package migrations

import "github.com/agambondan/islamic-explorer/app/model"

// ModelMigrations models to migrate
var ModelMigrations []interface{} = []interface{}{
	model.Multimedia{},
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
	model.ThemeAsset{},
	model.ChapterAsset{},
	model.BookAsset{},
	model.HadithAsset{},
	model.SurahAsset{},
	model.AyahAsset{},
	model.JuzAsset{},
	model.Tafsir{},
}
