package model

type Mufrodat struct {
	BaseID
	AyahID          *int   `json:"ayah_id,omitempty" gorm:"not null;uniqueIndex:idx_mufrodat_ayah_word"`
	WordIndex       int    `json:"word_index" gorm:"not null;uniqueIndex:idx_mufrodat_ayah_word"`
	Arabic          string `json:"arabic" gorm:"type:varchar(128);not null"`
	Transliteration string `json:"transliteration" gorm:"type:varchar(256);not null"`
	Indonesian      string `json:"indonesian" gorm:"type:varchar(256);not null"`
	RootWord        string `json:"root_word" gorm:"type:varchar(128);index"`
	PartOfSpeech    string `json:"part_of_speech" gorm:"type:varchar(64)"`
	Ayah            *Ayah  `json:"ayah,omitempty"`
}
