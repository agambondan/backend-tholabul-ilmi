package migrations

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type tafsirVerseRow struct {
	Chapter int    `json:"chapter"`
	Verse   int    `json:"verse"`
	Text    string `json:"text"`
}

type tafsirSurahFile struct {
	Chapter []tafsirVerseRow `json:"chapter"`
}

// SeedTafsirFromFiles seeds tafsir from data/tafsir after Quran ayah rows exist.
func SeedTafsirFromFiles(db *gorm.DB) {
	const dataDir = "data/tafsir"
	if _, err := os.Stat(dataDir); os.IsNotExist(err) {
		log.Println("[seeder] data/tafsir/ tidak ditemukan - skip SeedTafsirFromFiles")
		return
	}

	type ayahRow struct {
		ID          int
		Number      int
		SurahNumber int
	}
	var ayahs []ayahRow
	if err := db.Raw(`
		SELECT ayah.id, ayah.number, surah.number AS surah_number
		FROM ayah
		JOIN surah ON surah.id = ayah.surah_id
		WHERE ayah.deleted_at IS NULL AND surah.deleted_at IS NULL
	`).Scan(&ayahs).Error; err != nil {
		log.Printf("[seeder] SeedTafsirFromFiles: ayah index gagal: %v", err)
		return
	}
	if len(ayahs) == 0 {
		log.Println("[seeder] SeedTafsirFromFiles: ayah index kosong - jalankan SeedQuranFromFile dulu")
		return
	}

	ayahMap := make(map[string]int, len(ayahs))
	for _, a := range ayahs {
		ayahMap[fmt.Sprintf("%d:%d", a.SurahNumber, a.Number)] = a.ID
	}

	var existing []model.Tafsir
	db.Select("ayah_id").Find(&existing)
	existingSet := make(map[int]bool, len(existing))
	for _, t := range existing {
		if t.AyahID != nil {
			existingSet[*t.AyahID] = true
		}
	}

	jalalaynDir := filepath.Join(dataDir, "ind-jalaladdinalmah")
	quraishDir := filepath.Join(dataDir, "ind-muhammadquraish")
	created := 0

	for surah := 1; surah <= 114; surah++ {
		jalalayn := readTafsirSurah(filepath.Join(jalalaynDir, fmt.Sprintf("%d.json", surah)))
		quraish := readTafsirSurah(filepath.Join(quraishDir, fmt.Sprintf("%d.json", surah)))
		if len(jalalayn) == 0 && len(quraish) == 0 {
			continue
		}

		maxAyah := 0
		for ayah := range jalalayn {
			if ayah > maxAyah {
				maxAyah = ayah
			}
		}
		for ayah := range quraish {
			if ayah > maxAyah {
				maxAyah = ayah
			}
		}

		for ayah := 1; ayah <= maxAyah; ayah++ {
			ayahID, ok := ayahMap[fmt.Sprintf("%d:%d", surah, ayah)]
			if !ok || existingSet[ayahID] {
				continue
			}
			jalalaynText := jalalayn[ayah]
			quraishText := quraish[ayah]
			if jalalaynText == "" && quraishText == "" {
				continue
			}

			tafsir := model.Tafsir{AyahID: lib.Intptr(ayahID)}
			if jalalaynText != "" {
				tr := model.Translation{DescriptionIdn: lib.Strptr(jalalaynText)}
				if err := db.Create(&tr).Error; err != nil {
					log.Printf("[seeder] tafsir jalalayn QS %d:%d gagal: %v", surah, ayah, err)
				} else {
					tafsir.KemenagTranslationID = tr.ID
				}
			}
			if quraishText != "" {
				tr := model.Translation{DescriptionIdn: lib.Strptr(quraishText)}
				if err := db.Create(&tr).Error; err != nil {
					log.Printf("[seeder] tafsir quraish QS %d:%d gagal: %v", surah, ayah, err)
				} else {
					tafsir.IbnuKatsirTranslationID = tr.ID
				}
			}
			if tafsir.KemenagTranslationID == nil && tafsir.IbnuKatsirTranslationID == nil {
				continue
			}
			if err := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&tafsir).Error; err != nil {
				log.Printf("[seeder] tafsir QS %d:%d gagal: %v", surah, ayah, err)
				continue
			}
			existingSet[ayahID] = true
			created++
		}
	}

	log.Printf("[seeder] SeedTafsirFromFiles: %d tafsir seeded", created)
}

func readTafsirSurah(path string) map[int]string {
	f, err := os.Open(path)
	if err != nil {
		return map[int]string{}
	}
	defer f.Close()

	var surah tafsirSurahFile
	if err := json.NewDecoder(f).Decode(&surah); err != nil {
		log.Printf("[seeder] parse %s gagal: %v", path, err)
		return map[int]string{}
	}

	verses := make(map[int]string, len(surah.Chapter))
	for _, row := range surah.Chapter {
		if row.Text != "" {
			verses[row.Verse] = row.Text
		}
	}
	return verses
}
