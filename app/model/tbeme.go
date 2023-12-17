package model

type Theme struct {
	BaseID
	DefaultLanguage *string      `json:"default_language,omitempty" gorm:"default:idn"`
	TranslationID   *int         `json:"translation_id,omitempty"`
	Translation     *Translation `json:"translation,omitempty"`
	Chapters        []Chapter    `json:"chapters,omitempty"`
	Hadiths         []Hadith     `json:"hadiths,omitempty"`
	Books           []Book       `json:"-" gorm:"many2many:book_themes;"`
	Media           []ThemeAsset `json:"media,omitempty"`
}

type ThemeAsset struct {
	BaseID
	ThemeID      *int        `json:"theme_id,omitempty"`
	MultimediaID *int        `json:"multimedia_id,omitempty"`
	Theme        *Theme      `json:"-"`
	Multimedia   *Multimedia `json:"multimedia"`
}
