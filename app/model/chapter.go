package model

type Chapter struct {
	BaseID
	ThemeID         *int
	DefaultLanguage *string `gorm:"default:Idn"`
	TranslationID   *int
	Translation     *Translation
}

// type ChapterTranslation struct {
// 	BaseID
// 	ChapterID     *int
// 	TranslationId *int
// 	Chapter       *Chapter
// 	Translation   *Translation
// }
