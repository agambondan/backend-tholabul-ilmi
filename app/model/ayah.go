package model

type Ayah struct {
	BaseID
	ArabFormat      *string      `json:"arab_format,omitempty"`
	ArabHtml        *string      `json:"arab_html,omitempty"`
	Number          *int         `json:"number,omitempty"`
	DefaultLanguage *string      `json:"default_language,omitempty" gorm:"default:Ar"`
	SurahID         *int         `json:"surah_id,omitempty" gorm:"not null;"`
	TranslationID   *int         `json:"translation_id,omitempty" gorm:"not null;"`
	JuzID           *int         `json:"juz_id,omitempty"`
	Translation     *Translation `json:"translation,omitempty"`
	Surah           *Surah       `json:"surah,omitempty"`
}

// type AyahTranslation struct {
// 	BaseID
// 	AyahID        *int
// 	TranslationID *int
// 	Translation   *Translation
// 	Ayah          *Ayah
// }
