package model

type Chapter struct {
	BaseID
	ThemeID         *int           `json:"theme_id,omitempty"`
	DefaultLanguage *string        `gorm:"default:Idn"`
	TranslationID   *int           `json:"translation_id,omitempty"`
	Translation     *Translation   `json:"translation,omitempty"`
	Media           []ChapterAsset `json:"media,omitempty"`
}

type ChapterAsset struct {
	BaseID
	ChapterID    *int        `json:"chapter_id,omitempty"`
	MultimediaID *int        `json:"multimedia_id,omitempty"`
	Chapter      *Chapter    `json:"-"`
	Multimedia   *Multimedia `json:"multimedia"`
}
