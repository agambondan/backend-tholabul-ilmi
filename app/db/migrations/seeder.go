package migrations

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

var (
	book model.Book
	juz  model.Juz
)

// DataSeeds data to seeds
func DataSeeds(db *gorm.DB) []interface{} {
	return []interface{}{
		// book.Seed(db),
		// juz.Seeder(db),
	}
}
