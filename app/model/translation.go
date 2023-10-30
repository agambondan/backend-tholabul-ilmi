package model

type Translation struct {
	BaseID
	Idn      *string `json:"idn,omitempty" gorm:"type:text"`
	LatinIdn *string `json:"latin_idn,omitempty" gorm:"type:text"`
	En       *string `json:"en,omitempty" gorm:"type:text"`
	LatinEn  *string `json:"latin_en,omitempty" gorm:"type:text"`
	Ar       *string `json:"ar,omitempty" gorm:"type:text"`
	ArWaqaf  *string `json:"ar_waqaf,omitempty" gorm:"type:text"`
	ArFormat *string `json:"ar_format,omitempty" gorm:"type:text"`
	ArHtml   *string `json:"ar_html,omitempty" gorm:"type:text"`
}
