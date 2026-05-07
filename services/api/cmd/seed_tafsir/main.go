package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/agambondan/islamic-explorer/app/config"
	appdb "github.com/agambondan/islamic-explorer/app/db"
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/spf13/viper"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// ─── JSON structures ──────────────────────────────────────────────────────────

type tafsirVerseEntry struct {
	Chapter int    `json:"chapter"`
	Verse   int    `json:"verse"`
	Text    string `json:"text"`
}

type tafsirChapterFile struct {
	Chapter []tafsirVerseEntry `json:"chapter"`
}

type ibnuKatsirEntry struct {
	VerseKey string `json:"verse_key"`
	Text     string `json:"text"`
}

type tafsirwebEntry struct {
	Surah int    `json:"surah"`
	Ayat  int    `json:"ayat"`
	Text  string `json:"text"`
}

// ─── Loaders ──────────────────────────────────────────────────────────────────

func loadTafsirChapter(path string) (map[int]string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var f tafsirChapterFile
	if err := json.Unmarshal(data, &f); err != nil {
		return nil, err
	}
	m := make(map[int]string, len(f.Chapter))
	for _, e := range f.Chapter {
		if e.Text != "" {
			m[e.Verse] = e.Text
		}
	}
	return m, nil
}

func loadIbnuKatsirSurah(path string) (map[int]string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var entries []ibnuKatsirEntry
	if err := json.Unmarshal(data, &entries); err != nil {
		return nil, err
	}
	m := make(map[int]string)
	for _, e := range entries {
		if e.Text == "" {
			continue
		}
		parts := strings.SplitN(e.VerseKey, ":", 2)
		if len(parts) != 2 {
			continue
		}
		ayah, err := strconv.Atoi(parts[1])
		if err != nil {
			continue
		}
		m[ayah] = e.Text
	}
	return m, nil
}

func loadTafsirwebAyah(surahDir string, ayah int) string {
	path := filepath.Join(surahDir, fmt.Sprintf("%d.json", ayah))
	data, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	var entry tafsirwebEntry
	if err := json.Unmarshal(data, &entry); err != nil {
		return ""
	}
	return entry.Text
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

func saveTranslation(db *gorm.DB, t *model.Translation) error {
	return db.Clauses(clause.OnConflict{DoNothing: true}).Create(t).Error
}

// ─── Main logic ───────────────────────────────────────────────────────────────

func run(db *gorm.DB, dataDir string) error {
	// Pre-load ayah index: map[surahID][ayahNumber] = ayahID
	log.Println("Loading ayah index from DB...")
	var ayahs []model.Ayah
	if err := db.Select("id, surah_id, number").Find(&ayahs).Error; err != nil {
		return fmt.Errorf("load ayahs: %w", err)
	}
	ayahIndex := make(map[int]map[int]int)
	for _, a := range ayahs {
		if a.SurahID == nil || a.Number == nil || a.ID == nil {
			continue
		}
		if ayahIndex[*a.SurahID] == nil {
			ayahIndex[*a.SurahID] = make(map[int]int)
		}
		ayahIndex[*a.SurahID][*a.Number] = *a.ID
	}
	log.Printf("Loaded %d ayahs across %d surahs\n", len(ayahs), len(ayahIndex))

	// Pre-load existing tafsir for idempotency
	var existing []model.Tafsir
	db.Select("ayah_id").Find(&existing)
	existingSet := make(map[int]bool, len(existing))
	for _, t := range existing {
		if t.AyahID != nil {
			existingSet[*t.AyahID] = true
		}
	}
	log.Printf("Existing tafsir records: %d\n", len(existingSet))

	kemenagDir := filepath.Join(dataDir, "tafsir", "ind-muhammadquraish")
	tafsirwebBaseDir := filepath.Join(dataDir, "tafsirweb")
	ibnukatsirDir := filepath.Join(dataDir, "ibnukatsir")

	created := 0
	for surah := 1; surah <= 114; surah++ {
		log.Printf("[%3d/114] Surah %d...", surah, surah)

		surahAyahs := ayahIndex[surah]
		if len(surahAyahs) == 0 {
			log.Printf("  WARN: surah %d not found in DB — run seed_quran first", surah)
			continue
		}

		// Load Kemenag (Quraish Shihab) — Indonesian tafsir
		kemenagMap, err := loadTafsirChapter(filepath.Join(kemenagDir, fmt.Sprintf("%d.json", surah)))
		if err != nil {
			log.Printf("  WARN: kemenag surah %d: %v", surah, err)
			kemenagMap = make(map[int]string)
		}

		// Load Ibnu Katsir (English)
		ikMap, err := loadIbnuKatsirSurah(filepath.Join(ibnukatsirDir, fmt.Sprintf("%d.json", surah)))
		if err != nil {
			log.Printf("  WARN: ibnukatsir surah %d: %v", surah, err)
			ikMap = make(map[int]string)
		}

		tafsirwebSurahDir := filepath.Join(tafsirwebBaseDir, fmt.Sprintf("%d", surah))

		for ayahNum := 1; ayahNum <= len(surahAyahs); ayahNum++ {
			ayahID, ok := surahAyahs[ayahNum]
			if !ok {
				continue
			}
			if existingSet[ayahID] {
				continue
			}

			tafsir := &model.Tafsir{AyahID: lib.Intptr(ayahID)}

			// Kemenag translation (Indonesian Quraish Shihab tafsir)
			if text, ok := kemenagMap[ayahNum]; ok && text != "" {
				t := &model.Translation{DescriptionIdn: lib.Strptr(text)}
				if err := saveTranslation(db, t); err != nil {
					log.Printf("  ERROR: kemenag translation surah %d ayah %d: %v", surah, ayahNum, err)
				} else {
					tafsir.KemenagTranslationID = t.ID
				}
			}

			// Ibnu Katsir translation (tafsirweb = Indonesian, ibnukatsir = English)
			twText := loadTafsirwebAyah(tafsirwebSurahDir, ayahNum)
			ikEnText := ikMap[ayahNum]

			if twText != "" || ikEnText != "" {
				t := &model.Translation{}
				if twText != "" {
					t.DescriptionIdn = lib.Strptr(twText)
				}
				if ikEnText != "" {
					t.DescriptionEn = lib.Strptr(ikEnText)
				}
				if err := saveTranslation(db, t); err != nil {
					log.Printf("  ERROR: ibnukatsir translation surah %d ayah %d: %v", surah, ayahNum, err)
				} else {
					tafsir.IbnuKatsirTranslationID = t.ID
				}
			}

			if tafsir.KemenagTranslationID == nil && tafsir.IbnuKatsirTranslationID == nil {
				continue
			}

			if err := db.Clauses(clause.OnConflict{DoNothing: true}).Create(tafsir).Error; err != nil {
				log.Printf("  ERROR: save tafsir surah %d ayah %d: %v", surah, ayahNum, err)
				continue
			}
			created++
		}
	}

	log.Printf("Done! Created %d tafsir records.\n", created)
	return nil
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	environment := flag.String("environment", "", "set environment (development|staging|production|container), default: local")
	dataDir := flag.String("data", "data", "path to tafsir data directory")
	flag.Parse()

	switch *environment {
	case "development":
		if err := lib.LoadEnvironmentLocalFlag(".env.development"); err != nil {
			panic(err)
		}
	case "staging":
		if err := lib.LoadEnvironmentLocalFlag(".env.staging"); err != nil {
			panic(err)
		}
	case "production":
		if err := lib.LoadEnvironmentLocalFlag(".env.production"); err != nil {
			panic(err)
		}
	case "container":
		viper.AutomaticEnv()
	default:
		if err := lib.LoadEnvironmentLocalFlag(".env.local"); err != nil {
			panic(err)
		}
	}

	env := config.Environment{}
	envInit := env.Init()
	gormDB := appdb.NewPostgresql(envInit)

	if err := run(gormDB, *dataDir); err != nil {
		log.Fatalf("Seed tafsir failed: %v", err)
	}
}
