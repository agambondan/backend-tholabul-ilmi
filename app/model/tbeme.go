package model

type Theme struct {
	BaseID
	DefaultLanguage *string `gorm:"default:Idn"`
	TranslationID   *int
	Translation     *Translation
	Chapters        []Chapter
	Hadith          []Hadith
	Books           []Book `gorm:"many2many:book_themes;"`
}

// type ThemeTranslation struct {
// 	BaseID
// 	ThemeID       *int
// 	TranslationId *int
// 	Theme         *Theme
// 	Translation   *Translation
// }
