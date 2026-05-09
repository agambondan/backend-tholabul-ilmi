package migrations

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const (
	quranBaseDataFile  = "data/quran_base.json"
	mufrodatDataFile   = "data/mufrodat.json"
)

// ── JSON structs (mirror data/quran_base.json) ────────────────────────────────

type quranBaseJSON struct {
	Surahs []surahJSON `json:"surahs"`
}

type surahJSON struct {
	Number          int       `json:"number"`
	NameAr          string    `json:"name_ar"`
	NameEn          string    `json:"name_en"`
	NameTranslation string    `json:"name_translation"`
	Slug            string    `json:"slug"`
	RevelationType  string    `json:"revelation_type"`
	Ayahs           []ayahJSON `json:"ayahs"`
}

type ayahJSON struct {
	Number      int    `json:"number"`
	Arabic      string `json:"arabic"`
	Indonesian  string `json:"indonesian"`
	English     string `json:"english"`
	Juz         int    `json:"juz"`
	Page        int    `json:"page"`
	Manzil      int    `json:"manzil"`
	Ruku        int    `json:"ruku"`
	HizbQuarter int    `json:"hizb_quarter"`
	Sajda       bool   `json:"sajda"`
}

type mufrodatFileJSON struct {
	Entries []ayahWordEntry `json:"entries"`
}

type ayahWordEntry struct {
	Surah int        `json:"surah"`
	Ayah  int        `json:"ayah"`
	Words []wordItem `json:"words"`
}

type wordItem struct {
	Index           int    `json:"index"`
	Arabic          string `json:"arabic"`
	Transliteration string `json:"transliteration"`
	Indonesian      string `json:"indonesian"`
}

// ── SeedQuranFromFile ─────────────────────────────────────────────────────────

// SeedQuranFromFile seeds surah and ayah from data/quran_base.json.
// No-op if the file does not exist or if ayahs are already fully seeded.
func SeedQuranFromFile(db *gorm.DB) {
	var ayahCount int64
	db.Model(&model.Ayah{}).Count(&ayahCount)
	if ayahCount >= 6236 {
		return
	}

	f, err := os.Open(quranBaseDataFile)
	if err != nil {
		log.Printf("[seeder] quran_base.json tidak ditemukan — skip (%v)", err)
		return
	}
	defer f.Close()

	var data quranBaseJSON
	if err := json.NewDecoder(f).Decode(&data); err != nil {
		log.Printf("[seeder] parse quran_base.json gagal: %v", err)
		return
	}

	log.Printf("[seeder] SeedQuranFromFile: %d surahs...", len(data.Surahs))
	seeded := 0

	for _, sf := range data.Surahs {
		tr := model.Translation{
			Ar:      lib.Strptr(sf.NameAr),
			LatinEn: lib.Strptr(sf.NameEn),
			En:      lib.Strptr(sf.NameTranslation),
			Idn:     lib.Strptr(sf.NameTranslation),
		}
		if err := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&tr).Error; err != nil {
			log.Printf("[seeder] surah %d translation: %v", sf.Number, err)
			continue
		}

		surah := model.Surah{
			Number:         lib.Intptr(sf.Number),
			TranslationID:  tr.ID,
			NumberOfAyahs:  lib.Intptr(len(sf.Ayahs)),
			RevelationType: lib.Strptr(sf.RevelationType),
			Slug:           lib.Strptr(sf.Slug),
			Identifier:     lib.Strptr(sf.NameEn),
		}
		if err := db.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "number"}},
			DoUpdates: clause.AssignmentColumns([]string{
				"translation_id", "number_of_ayahs", "revelation_type", "slug", "identifier", "updated_at",
			}),
		}).Create(&surah).Error; err != nil {
			log.Printf("[seeder] surah %d: %v", sf.Number, err)
			continue
		}
		if surah.ID == nil {
			db.Where("number = ?", sf.Number).Select("id").First(&surah)
		}
		if surah.ID == nil {
			continue
		}

		for _, af := range sf.Ayahs {
			ayahTr := model.Translation{
				Ar:  lib.Strptr(af.Arabic),
				Idn: lib.Strptr(af.Indonesian),
				En:  lib.Strptr(af.English),
			}
			if err := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&ayahTr).Error; err != nil {
				continue
			}
			ayah := model.Ayah{
				Number:        lib.Intptr(af.Number),
				SurahID:       surah.ID,
				TranslationID: ayahTr.ID,
				JuzNumber:     lib.Intptr(af.Juz),
				Page:          lib.Intptr(af.Page),
				Manzil:        lib.Intptr(af.Manzil),
				Ruku:          lib.Intptr(af.Ruku),
				HizbQuarter:   lib.Intptr(af.HizbQuarter),
				Sajda:         lib.Boolptr(af.Sajda),
			}
			if err := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&ayah).Error; err != nil {
				continue
			}
			seeded++
		}
	}
	log.Printf("[seeder] SeedQuranFromFile: %d ayahs seeded", seeded)
}

// ── SeedMufrodatFromFile ──────────────────────────────────────────────────────

// SeedMufrodatFromFile seeds per-kata data from data/mufrodat.json.
// Requires ayah table to be populated first (call SeedQuranFromFile before this).
func SeedMufrodatFromFile(db *gorm.DB) {
	var mufCount int64
	db.Model(&model.Mufrodat{}).Count(&mufCount)
	if mufCount >= 77000 {
		return
	}

	f, err := os.Open(mufrodatDataFile)
	if err != nil {
		log.Printf("[seeder] mufrodat.json tidak ditemukan — skip (%v)", err)
		return
	}
	defer f.Close()

	var data mufrodatFileJSON
	if err := json.NewDecoder(f).Decode(&data); err != nil {
		log.Printf("[seeder] parse mufrodat.json gagal: %v", err)
		return
	}

	// Build ayah index: "surah:ayah" → ayah.id
	log.Printf("[seeder] SeedMufrodatFromFile: building ayah index...")
	type row struct {
		ID          int
		Number      int
		SurahNumber int
	}
	var rows []row
	db.Raw(`
		SELECT ayah.id, ayah.number, surah.number AS surah_number
		FROM ayah JOIN surah ON surah.id = ayah.surah_id
	`).Scan(&rows)
	ayahIdx := make(map[string]int, len(rows))
	for _, r := range rows {
		ayahIdx[fmt.Sprintf("%d:%d", r.SurahNumber, r.Number)] = r.ID
	}

	if len(ayahIdx) == 0 {
		log.Println("[seeder] SeedMufrodatFromFile: ayah index kosong — jalankan SeedQuranFromFile dulu")
		return
	}

	log.Printf("[seeder] SeedMufrodatFromFile: %d entries...", len(data.Entries))
	seeded := 0
	for _, entry := range data.Entries {
		ayahID, ok := ayahIdx[fmt.Sprintf("%d:%d", entry.Surah, entry.Ayah)]
		if !ok {
			continue
		}
		for _, w := range entry.Words {
			item := model.Mufrodat{
				AyahID:          lib.Intptr(ayahID),
				WordIndex:       w.Index,
				Arabic:          w.Arabic,
				Transliteration: w.Transliteration,
				Indonesian:      w.Indonesian,
			}
			if err := db.Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "ayah_id"}, {Name: "word_index"}},
				DoUpdates: clause.AssignmentColumns([]string{"arabic", "transliteration", "indonesian"}),
			}).Create(&item).Error; err == nil {
				seeded++
			}
		}
	}
	log.Printf("[seeder] SeedMufrodatFromFile: %d kata seeded", seeded)
}
