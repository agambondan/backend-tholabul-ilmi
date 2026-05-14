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
	db.Select("id", "ayah_id", "kemenag_translation_id", "ibnu_katsir_translation_id").Find(&existing)
	existingByAyah := make(map[int]model.Tafsir, len(existing))
	for _, t := range existing {
		if t.AyahID != nil {
			existingByAyah[*t.AyahID] = t
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
			if !ok {
				continue
			}
			jalalaynText := jalalayn[ayah]
			quraishText := quraish[ayah]
			if jalalaynText == "" && quraishText == "" {
				continue
			}

			existingTafsir, exists := existingByAyah[ayahID]
			if exists {
				updates := map[string]interface{}{}
				if jalalaynText != "" && existingTafsir.KemenagTranslationID == nil {
					if id := createTafsirTranslation(db, jalalaynText, surah, ayah, "jalalayn"); id != nil {
						updates["kemenag_translation_id"] = *id
						existingTafsir.KemenagTranslationID = id
					}
				}
				if quraishText != "" && existingTafsir.IbnuKatsirTranslationID == nil {
					if id := createTafsirTranslation(db, quraishText, surah, ayah, "quraish"); id != nil {
						updates["ibnu_katsir_translation_id"] = *id
						existingTafsir.IbnuKatsirTranslationID = id
					}
				}
				if len(updates) > 0 && existingTafsir.ID != nil {
					if err := db.Model(&model.Tafsir{}).Where("id = ?", *existingTafsir.ID).Updates(updates).Error; err != nil {
						log.Printf("[seeder] tafsir QS %d:%d update gagal: %v", surah, ayah, err)
						continue
					}
					existingByAyah[ayahID] = existingTafsir
					created++
				}
				continue
			}

			tafsir := model.Tafsir{AyahID: lib.Intptr(ayahID)}
			if jalalaynText != "" {
				tafsir.KemenagTranslationID = createTafsirTranslation(db, jalalaynText, surah, ayah, "jalalayn")
			}
			if quraishText != "" {
				tafsir.IbnuKatsirTranslationID = createTafsirTranslation(db, quraishText, surah, ayah, "quraish")
			}
			if tafsir.KemenagTranslationID == nil && tafsir.IbnuKatsirTranslationID == nil {
				continue
			}
			if err := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&tafsir).Error; err != nil {
				log.Printf("[seeder] tafsir QS %d:%d gagal: %v", surah, ayah, err)
				continue
			}
			existingByAyah[ayahID] = tafsir
			created++
		}
	}

	log.Printf("[seeder] SeedTafsirFromFiles: %d tafsir seeded/updated", created)
}

func createTafsirTranslation(db *gorm.DB, text string, surah, ayah int, source string) *int {
	tr := model.Translation{DescriptionIdn: lib.Strptr(text)}
	if err := db.Create(&tr).Error; err != nil {
		log.Printf("[seeder] tafsir %s QS %d:%d gagal: %v", source, surah, ayah, err)
		return nil
	}
	return tr.ID
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
