package model

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"gorm.io/gorm"
)

type Book struct {
	BaseID
	Slug            *string `gorm:"type:varchar(256);not null;index:,unique,where:deleted_at is null"`
	DefaultLanguage *string `gorm:"default:Idn"`
	TranslationID   *int
	Translation     *Translation
	Themes          []Theme `gorm:"many2many:book_themes;"`
	Hadith          []Hadith
}

type BookThemes struct {
	BaseID
	BookID  *int
	ThemeID *int
	Book    *Book
	Theme   *Theme
}

func (b *Book) Seed(db *gorm.DB) []Book {
	var books []Book
	var booksString = []string{"Shahih Bukhari", "Shahih Muslim", "Sunan Abu Daud", "Sunan Tirmidzi", "Sunan Nasa'i", "Sunan Ibnu Majah", "Muwatha' Malik", "Musnad Ahmad", "Sunan Darimi"}
	var booksSlug = []string{"bukhari", "muslim", "abudaud", "tirmidzi", "nasai", "ibnumajah", "malik", "ahmad", "darimi"}
	for i, v := range booksString {
		var book = new(Book)
		err := db.First(&book).Error
		if err != nil || book == nil {
			book.Translation = &Translation{
				Idn: lib.Strptr(v),
			}
			book.DefaultLanguage = lib.Strptr("idn")
			book.Slug = lib.Strptr(booksSlug[i])
			books = append(books, *book)
		}
	}
	return books
}
