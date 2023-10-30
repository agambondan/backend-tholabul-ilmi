package model

type Surah struct {
	BaseID
	Identifier      *string      `json:"identifier,omitempty" gorm:"type:varchar(256)"`
	Description     *string      `json:"description,omitempty" gorm:"type:text"`
	Number          *int         `json:"number,omitempty" gorm:"uniqueIndex;not null;"`
	NumberOfAyahs   *int         `json:"number_of_ayahs,omitempty"`
	RevelationType  *string      `json:"revelation_type,omitempty"`
	DefaultLanguage *string      `json:"default_language" gorm:"default:Ar"`
	TranslationID   *int         `json:"translation_id,omitempty"`
	Translation     *Translation `json:"translation,omitempty"`
	StartJuz        *Juz         `json:"start_juz,omitempty" gorm:"foreignKey:StartSurahID"`
	EndJuz          *Juz         `json:"end_juz,omitempty" gorm:"foreignKey:EndSurahID"`
	Ayahs           []*Ayah      `json:"ayahs,omitempty"`
	Media           []SurahAsset `json:"media,omitempty"`
}

type SurahAsset struct {
	BaseID
	SurahID      *int        `json:"surah_id,omitempty"`
	MultimediaID *int        `json:"multimedia_id,omitempty"`
	Surah        *Surah      `json:"-"`
	Multimedia   *Multimedia `json:"multimedia"`
}
