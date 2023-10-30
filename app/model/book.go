package model

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"gorm.io/gorm"
)

type Book struct {
	BaseID
	Slug            *string      `json:"slug" gorm:"type:varchar(256);not null;index:,unique,where:deleted_at is null"`
	DefaultLanguage *string      `gorm:"default:Idn"`
	TranslationID   *int         `json:"translation_id,omitempty"`
	Translation     *Translation `json:"translation,omitempty"`
	Themes          []Theme      `json:"-" gorm:"many2many:book_themes"`
	Hadith          []Hadith     `json:"hadith,omitempty"`
	Media           []BookAsset  `json:"media,omitempty"`
}

type BookAsset struct {
	BaseID
	AyahID       *int        `json:"book_id,omitempty"`
	MultimediaID *int        `json:"multimedia_id,omitempty"`
	Book         *Book       `json:"-"`
	Multimedia   *Multimedia `json:"multimedia"`
}

type BookThemes struct {
	BaseID
	BookID  *int   `json:"-"`
	ThemeID *int   `json:"-"`
	Book    *Book  `json:"-"`
	Theme   *Theme `json:"-"`
}

func (b *Book) Seed(db *gorm.DB) []Book {
	var books []Book
	booksString := []string{"Shahih Bukhari", "Shahih Muslim", "Sunan Abu Daud", "Sunan Tirmidzi", "Sunan Nasa'i", "Sunan Ibnu Majah", "Muwatha' Malik", "Musnad Ahmad", "Sunan Darimi"}
	booksSlug := []string{"bukhari", "muslim", "abudaud", "tirmidzi", "nasai", "ibnumajah", "malik", "ahmad", "darimi"}
	for i, v := range booksString {
		book := new(Book)
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
