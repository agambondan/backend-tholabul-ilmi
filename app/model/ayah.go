package model

type Ayah struct {
	BaseID
	Number          *int         `json:"number,omitempty"`
	DefaultLanguage *string      `json:"default_language,omitempty" gorm:"default:Ar"`
	SurahID         *int         `json:"surah_id,omitempty" gorm:"not null;"`
	TranslationID   *int         `json:"translation_id,omitempty" gorm:"not null;"`
	JuzNumber       *int         `json:"juz_number,omitempty"`
	Manzil          *int         `json:"manzil,omitempty"`
	Page            *int         `json:"page,omitempty"`
	Ruku            *int         `json:"ruku,omitempty"`
	HizbQuarter     *int         `json:"hizb_quarter,omitempty"`
	Sajda           *bool        `json:"sajda,omitempty"`
	JuzID           *int         `json:"juz_id,omitempty"`
	Translation     *Translation `json:"translation,omitempty"`
	Surah           *Surah       `json:"surah,omitempty"`
	Media           []AyahAsset  `json:"media,omitempty"`
	// ArabFormat      *string      `json:"arab_format,omitempty" gorm:"type:text"`
	// ArabHtml        *string      `json:"arab_html,omitempty" gorm:"type:text"`
}

type AyahAsset struct {
	BaseID
	AyahID       *int        `json:"ayah_id,omitempty"`
	MultimediaID *int        `json:"multimedia_id,omitempty"`
	Ayah         *Ayah       `json:"-"`
	Multimedia   *Multimedia `json:"multimedia"`
}
