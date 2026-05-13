package repository

import (
	"net/http/httptest"
	"testing"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

func TestAyahRepositoryJoinedPaginationQueries(t *testing.T) {
	db := newAyahRepositoryTestDB(t)
	repo := NewAyahRepository(db, paginate.New())
	surah := createAyahTestSurah(t, db, 1)
	createAyahTestAyah(t, db, surah, 1, 1, 1)
	createAyahTestAyah(t, db, surah, 2, 1, 1)

	app := fiber.New()
	app.Get("/", func(ctx *fiber.Ctx) error {
		repo.FindAll(ctx)

		number := 1
		if _, err := repo.FindByNumber(ctx, &number); err != nil {
			t.Fatalf("find by number: %v", err)
		}
		if _, err := repo.FindBySurahNumber(ctx, &number); err != nil {
			t.Fatalf("find by surah number: %v", err)
		}
		return ctx.SendStatus(fiber.StatusNoContent)
	})

	resp, err := app.Test(httptest.NewRequest("GET", "/?page=0&size=10", nil))
	if err != nil {
		t.Fatalf("fiber test: %v", err)
	}
	if resp.StatusCode != fiber.StatusNoContent {
		t.Fatalf("expected 204, got %d", resp.StatusCode)
	}
}

func TestAyahRepositoryDirectLookups(t *testing.T) {
	db := newAyahRepositoryTestDB(t)
	repo := NewAyahRepository(db, paginate.New())
	surah := createAyahTestSurah(t, db, 2)
	createAyahTestAyah(t, db, surah, 6, 2, 3)
	createAyahTestAyah(t, db, surah, 7, 2, 3)

	pageAyahs, err := repo.FindByPage(2)
	if err != nil {
		t.Fatalf("find by page: %v", err)
	}
	if len(pageAyahs) != 2 {
		t.Fatalf("expected 2 page ayahs, got %d", len(pageAyahs))
	}

	hizbAyahs, err := repo.FindByHizbQuarter(3)
	if err != nil {
		t.Fatalf("find by hizb quarter: %v", err)
	}
	if len(hizbAyahs) != 2 {
		t.Fatalf("expected 2 hizb ayahs, got %d", len(hizbAyahs))
	}

	daily, err := repo.FindDaily(2)
	if err != nil {
		t.Fatalf("find daily: %v", err)
	}
	if daily.Number == nil || *daily.Number != 7 {
		t.Fatalf("expected second ayah as daily result, got %#v", daily.Number)
	}
}

func newAyahRepositoryTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlite.Open("file::memory:"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true,
		},
	})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	if err := db.AutoMigrate(&model.Translation{}, &model.Surah{}, &model.Ayah{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	return db
}

func createAyahTestSurah(t *testing.T, db *gorm.DB, number int) *model.Surah {
	t.Helper()
	tr := &model.Translation{Idn: strptrOrNil("Al-Fatihah"), LatinEn: strptrOrNil("Al-Faatihah")}
	if err := db.Create(tr).Error; err != nil {
		t.Fatalf("create surah translation: %v", err)
	}
	surah := &model.Surah{Number: &number, TranslationID: tr.ID}
	if err := db.Create(surah).Error; err != nil {
		t.Fatalf("create surah: %v", err)
	}
	return surah
}

func createAyahTestAyah(t *testing.T, db *gorm.DB, surah *model.Surah, number int, page int, hizb int) *model.Ayah {
	t.Helper()
	tr := &model.Translation{Ar: strptrOrNil("text"), Idn: strptrOrNil("translation")}
	if err := db.Create(tr).Error; err != nil {
		t.Fatalf("create ayah translation: %v", err)
	}
	ayah := &model.Ayah{Number: &number, Page: &page, HizbQuarter: &hizb, SurahID: surah.ID, TranslationID: tr.ID}
	if err := db.Create(ayah).Error; err != nil {
		t.Fatalf("create ayah: %v", err)
	}
	return ayah
}
