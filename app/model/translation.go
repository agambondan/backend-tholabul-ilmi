package model

type Translation struct {
	BaseID
	Direction         *string   `json:"direction"`
	TranslationsCount *int      `json:"translations_count"`
	LanguageCode      *string   `json:"language_code,omitempty" gorm:"varchar(4);not null"`
	Language          *Language `json:"language,omitempty" gorm:"foreignKey:LanguageCode"`
	Idn               *string   `json:"idn,omitempty" gorm:"type:text"`
	LatinIdn          *string   `json:"latin_idn,omitempty" gorm:"type:text"`
	En                *string   `json:"en,omitempty" gorm:"type:text"`
	LatinEn           *string   `json:"latin_en,omitempty" gorm:"type:text"`
	Ar                *string   `json:"ar,omitempty" gorm:"type:text"`
	ArWaqaf           *string   `json:"ar_waqaf,omitempty" gorm:"type:text"`
}
