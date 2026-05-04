package model

type AsbabunNuzul struct {
	BaseID
	AyahID        int          `json:"ayah_id" gorm:"not null;index"`
	Content       string       `json:"content" gorm:"type:text;not null"`
	Source        string       `json:"source" gorm:"type:varchar(512)"`
	TranslationID *int         `json:"translation_id,omitempty" gorm:"index"`
	Translation   *Translation `json:"translation,omitempty" gorm:"foreignKey:TranslationID;-:migration"`
}
