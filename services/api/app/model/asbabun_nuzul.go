package model

// AsbabunNuzul represents a single riwayat (narration) about the cause/context
// behind the revelation of one or more ayat. One asbab can cover multiple ayat
// (e.g. peristiwa Al-Ifk → QS 24:11-21), and a single ayat can have multiple
// asbab from different jalur riwayat — hence the many-to-many to Ayah.
type AsbabunNuzul struct {
	BaseID
	Title         string       `json:"title" gorm:"type:varchar(255)"`
	Narrator      string       `json:"narrator" gorm:"type:varchar(255)"`
	Content       string       `json:"content" gorm:"type:text;not null"`
	Source        string       `json:"source" gorm:"type:varchar(512)"`
	DisplayRef    string       `json:"display_ref" gorm:"type:varchar(128)"`
	TranslationID *int         `json:"translation_id,omitempty" gorm:"index"`
	Translation   *Translation `json:"translation,omitempty" gorm:"foreignKey:TranslationID;-:migration"`
	Ayahs         []Ayah       `json:"ayahs,omitempty" gorm:"many2many:asbabun_nuzul_ayahs;"`
}
