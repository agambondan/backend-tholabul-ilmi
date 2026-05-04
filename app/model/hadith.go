package model

type Hadith struct {
	BaseID
	DefaultLanguage *string       `gorm:"default:Ar"`
	Number          *int          `json:"number,omitempty" gorm:"index"`
	BookID          *int          `json:"book_id,omitempty" gorm:"index"`
	ThemeID         *int          `json:"theme_id,omitempty" gorm:"index"`
	ChapterID       *int          `json:"chapter_id,omitempty" gorm:"index"`
	TranslationID   *int          `json:"translation_id,omitempty" gorm:"index"`
	Book            *Book         `json:"book,omitempty"`
	Theme           *Theme        `json:"theme,omitempty"`
	Chapter         *Chapter      `json:"chapter,omitempty"`
	Translation     *Translation  `json:"translation,omitempty"`
	Media           []HadithAsset `json:"media,omitempty"`
}

type HadithAsset struct {
	BaseID
	HadithID     *int        `json:"hadith_id,omitempty"`
	MultimediaID *int        `json:"multimedia_id,omitempty"`
	Hadith       *Hadith     `json:"-"`
	Multimedia   *Multimedia `json:"multimedia"`
}
