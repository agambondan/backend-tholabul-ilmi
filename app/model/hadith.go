package model

type Hadith struct {
	BaseID
	DefaultLanguage *string `gorm:"default:Ar"`
	BookID          *int
	ThemeID         *int
	ChapterID       *int
	TranslationID   *int
	Translation     []HadithTranslation
	// Translation     *Translation
}

type HadithTranslation struct {
	BaseID
	HadithID      *int
	TranslationID *int
	Hadith        *Hadith
	Translations  *Translation
}
