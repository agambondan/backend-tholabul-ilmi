package repository

import (
	"testing"

	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

func TestAsbabunNuzulRepositoryCreateAndReplaceAyahs(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file::memory:"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true,
		},
	})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	if err := db.AutoMigrate(&model.Translation{}, &model.Surah{}, &model.Ayah{}, &model.AsbabunNuzul{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}

	repo := NewAsbabunNuzulRepository(db)
	surah := createAsbabunTestSurah(t, db, 2)
	ayah6 := createAsbabunTestAyah(t, db, surah, 6)
	ayah7 := createAsbabunTestAyah(t, db, surah, 7)

	ids, err := repo.FindAyahIDsByReferences([]model.AyahReference{
		{SurahNumber: 2, AyahNumber: 6},
		{SurahNumber: 2, AyahNumber: 7},
		{SurahNumber: 2, AyahNumber: 7},
	})
	if err != nil {
		t.Fatalf("resolve ayahs: %v", err)
	}
	if len(ids) != 2 {
		t.Fatalf("expected 2 unique ayah ids, got %d", len(ids))
	}

	created, err := repo.CreateWithAyahs(&model.AsbabunNuzul{
		Title:      "Sebab turun awal Al-Baqarah",
		Content:    "Riwayat ringkas",
		Source:     "Al-Wahidi",
		DisplayRef: "QS 2:6-7",
	}, ids)
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if created.TranslationID == nil {
		t.Fatal("expected translation to be created")
	}
	if len(created.Ayahs) != 2 {
		t.Fatalf("expected 2 linked ayahs, got %d", len(created.Ayahs))
	}

	updated, err := repo.UpdateWithAyahs(*created.ID, &model.AsbabunNuzul{
		Title:      "Sebab turun diperbarui",
		Narrator:   "Ibnu Abbas",
		Content:    "Riwayat diperbarui",
		Source:     "Lubabun Nuqul",
		DisplayRef: "QS 2:6",
	}, []int{*ayah6.ID})
	if err != nil {
		t.Fatalf("update: %v", err)
	}
	if updated.Narrator != "Ibnu Abbas" {
		t.Fatalf("expected narrator to update, got %q", updated.Narrator)
	}
	if len(updated.Ayahs) != 1 {
		t.Fatalf("expected relation replacement to leave 1 ayah, got %d", len(updated.Ayahs))
	}
	if updated.Ayahs[0].ID == nil || *updated.Ayahs[0].ID != *ayah6.ID {
		t.Fatalf("expected ayah 6 to remain linked, got %#v; ayah7=%#v", updated.Ayahs, ayah7.ID)
	}
}

func createAsbabunTestSurah(t *testing.T, db *gorm.DB, number int) *model.Surah {
	t.Helper()
	tr := &model.Translation{Idn: strptrOrNil("Al-Baqarah")}
	if err := db.Create(tr).Error; err != nil {
		t.Fatalf("create surah translation: %v", err)
	}
	surah := &model.Surah{Number: &number, TranslationID: tr.ID}
	if err := db.Create(surah).Error; err != nil {
		t.Fatalf("create surah: %v", err)
	}
	return surah
}

func createAsbabunTestAyah(t *testing.T, db *gorm.DB, surah *model.Surah, number int) *model.Ayah {
	t.Helper()
	tr := &model.Translation{Ar: strptrOrNil("text")}
	if err := db.Create(tr).Error; err != nil {
		t.Fatalf("create ayah translation: %v", err)
	}
	ayah := &model.Ayah{Number: &number, SurahID: surah.ID, TranslationID: tr.ID}
	if err := db.Create(ayah).Error; err != nil {
		t.Fatalf("create ayah: %v", err)
	}
	return ayah
}
