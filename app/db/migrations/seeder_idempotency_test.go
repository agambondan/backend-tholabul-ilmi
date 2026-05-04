package migrations

import (
	"testing"

	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

func TestDoaSeedsAreIdempotent(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file::memory:"), &gorm.Config{
		Logger:                                   logger.Default.LogMode(logger.Silent),
		DisableForeignKeyConstraintWhenMigrating: true,
		NamingStrategy:                           schema.NamingStrategy{SingularTable: true},
	})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}

	if err := db.AutoMigrate(&model.Doa{}); err != nil {
		t.Fatalf("auto migrate: %v", err)
	}

	seed := func() {
		DeduplicateSeedData(db)
		items := seedDoa()
		for i := range items {
			if err := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&items[i]).Error; err != nil {
				t.Fatalf("seed data: %v", err)
			}
		}
		if err := upsertDoaSeeds(db); err != nil {
			t.Fatalf("upsert doa seeds: %v", err)
		}
	}

	seed()
	firstCount := countDoaRows(t, db)
	seed()
	secondCount := countDoaRows(t, db)

	if firstCount != secondCount {
		t.Fatalf("doa seed is not idempotent: first=%d second=%d", firstCount, secondCount)
	}
	if duplicates := countDuplicateDoaKeys(t, db); duplicates != 0 {
		t.Fatalf("doa seed has %d duplicate category/title keys", duplicates)
	}
}

func countDoaRows(t *testing.T, db *gorm.DB) int64 {
	t.Helper()

	var count int64
	if err := db.Model(&model.Doa{}).Count(&count).Error; err != nil {
		t.Fatalf("count doa rows: %v", err)
	}
	return count
}

func countDuplicateDoaKeys(t *testing.T, db *gorm.DB) int64 {
	t.Helper()

	var count int64
	err := db.Raw(`
		SELECT COUNT(*)
		FROM (
			SELECT category, title
			FROM doa
			GROUP BY category, title
			HAVING COUNT(*) > 1
		) duplicates
	`).Scan(&count).Error
	if err != nil {
		t.Fatalf("count duplicate doa keys: %v", err)
	}
	return count
}
