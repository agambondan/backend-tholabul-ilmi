package model

type Hadith struct {
	BaseID
	DefaultLanguage *string       `gorm:"default:Ar"`
	BookID          *int          `json:"book_id,omitempty"`
	ThemeID         *int          `json:"theme_id,omitempty"`
	ChapterID       *int          `json:"chapter_id,omitempty"`
	TranslationID   *int          `json:"translation_id,omitempty"`
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
