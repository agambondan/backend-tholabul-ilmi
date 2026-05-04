package model

type AsmaUlHusna struct {
	BaseID
	Number          int    `json:"number" gorm:"not null;uniqueIndex"`
	Arabic          string `json:"arabic" gorm:"type:varchar(100);not null"`
	Transliteration string `json:"transliteration" gorm:"type:varchar(100);not null"`
	Indonesian      string `json:"indonesian" gorm:"type:varchar(256);not null"`
	English         string `json:"english" gorm:"type:varchar(256);not null"`
	Meaning         string `json:"meaning" gorm:"type:text"`
}
