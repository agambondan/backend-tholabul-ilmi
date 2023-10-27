package migrations

import "github.com/agambondan/islamic-explorer/app/model"

// ModelMigrations models to migrate
var ModelMigrations []interface{} = []interface{}{
	model.Translation{},
	model.Theme{},
	model.Chapter{},
	model.Book{},
	model.Hadith{},
	model.BookThemes{},
	model.Surah{},
	model.Ayah{},
	model.Juz{},
	model.Tafsir{},
	model.Language{},
}
