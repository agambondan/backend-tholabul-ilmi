//go:build ignore

package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

func main() {
	dsn := "host=localhost port=54320 user=postgres password=postgres dbname=thullabul_ilmi sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger:         logger.Default.LogMode(logger.Warn),
		NamingStrategy: schema.NamingStrategy{SingularTable: true},
	})
	if err != nil {
		log.Fatalf("koneksi DB gagal: %v", err)
	}

	endpoint := "localhost:9020"
	accessKeyID := "minioadmin"
	secretAccessKey := "minioadmin"
	useSSL := false

	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		log.Fatalln(err)
	}

	bucketName := "quran-audio"
	ctx := context.Background()

	err = minioClient.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
	if err != nil {
		exists, errBucketExists := minioClient.BucketExists(ctx, bucketName)
		if errBucketExists == nil && exists {
			log.Printf("Bucket %s already exists\n", bucketName)
		} else {
			log.Fatalln(err)
		}
	} else {
		log.Printf("Successfully created %s\n", bucketName)
		policy := fmt.Sprintf(`{"Version": "2012-10-17","Statement": [{"Action": ["s3:GetObject"],"Effect": "Allow","Principal": {"AWS": ["*"]},"Resource": ["arn:aws:s3:::%s/*"]}]}`, bucketName)
		minioClient.SetBucketPolicy(ctx, bucketName, policy)
	}

	var ayahs []model.Ayah
	db.Preload("Surah").Find(&ayahs)

	log.Printf("Found %d ayahs to process", len(ayahs))

	sem := make(chan struct{}, 10) // 10 concurrent downloads
	var wg sync.WaitGroup

	for _, ayah := range ayahs {
		wg.Add(1)
		sem <- struct{}{}
		go func(a model.Ayah) {
			defer wg.Done()
			defer func() { <-sem }()

			surahNum := *a.Surah.Number
			ayahNum := *a.Number
			fileName := fmt.Sprintf("%03d%03d.mp3", surahNum, ayahNum)
			audioUrl := fmt.Sprintf("https://everyayah.com/data/Alafasy_128kbps/%s", fileName)
			objectName := fmt.Sprintf("alafasy/%s", fileName)

			// Download
			resp, err := http.Get(audioUrl)
			if err != nil {
				log.Printf("Failed to download %s: %v", audioUrl, err)
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				log.Printf("Status %d for %s", resp.StatusCode, audioUrl)
				return
			}

			bodyBytes, err := io.ReadAll(resp.Body)
			if err != nil {
				log.Printf("Failed to read body %s: %v", audioUrl, err)
				return
			}

			fileSize := int64(len(bodyBytes))
			reader := bytes.NewReader(bodyBytes)

			_, err = minioClient.PutObject(ctx, bucketName, objectName, reader, fileSize, minio.PutObjectOptions{ContentType: "audio/mpeg"})
			if err != nil {
				log.Printf("Failed to upload %s to minio: %v", objectName, err)
				return
			}

			finalUrl := fmt.Sprintf("http://localhost:9020/%s/%s", bucketName, objectName)
			fSize := float64(fileSize)
			format := "mp3"
			title := fmt.Sprintf("Ayah %d:%d Audio", surahNum, ayahNum)

			var multimedia model.Multimedia
			err = db.Where("url = ?", finalUrl).First(&multimedia).Error
			if err == gorm.ErrRecordNotFound {
				multimedia = model.Multimedia{
					Title:            lib.Strptr(title),
					FileName:         lib.Strptr(objectName),
					FileSize:         &fSize,
					OriginalFileName: lib.Strptr(fileName),
					URL:              lib.Strptr(finalUrl),
					Format:           lib.Strptr(format),
				}
				db.Create(&multimedia)
			}

			var asset model.AyahAsset
			err = db.Where("ayah_id = ? AND multimedia_id = ?", a.ID, multimedia.ID).First(&asset).Error
			if err == gorm.ErrRecordNotFound {
				asset = model.AyahAsset{
					AyahID:       a.ID,
					MultimediaID: multimedia.ID,
				}
				db.Create(&asset)
			}

			log.Printf("Successfully scraped and uploaded %s", fileName)
		}(ayah)
	}

	wg.Wait()
	log.Println("Done scraping audio!")
}
