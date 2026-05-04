package model

type DzikirCategory string

const (
	DzikirPagi          DzikirCategory = "pagi"
	DzikirPetang        DzikirCategory = "petang"
	DzikirSetelahSholat DzikirCategory = "setelah_sholat"
	DzikirTidur         DzikirCategory = "tidur"
	DzikirSafar         DzikirCategory = "safar"
	DzikirUmum          DzikirCategory = "dzikir_umum"
)

type Dzikir struct {
	BaseID
	Category        DzikirCategory `json:"category" gorm:"type:varchar(50);not null;index;uniqueIndex:idx_dzikir_category_title"`
	Occasion        string         `json:"occasion,omitempty" gorm:"type:varchar(100);index"`
	Title           string         `json:"title" gorm:"type:varchar(256);not null;uniqueIndex:idx_dzikir_category_title"`
	Arabic          string         `json:"arabic" gorm:"type:text;not null"`
	Transliteration string         `json:"transliteration" gorm:"type:text"`
	Translation     string         `json:"translation" gorm:"type:text;not null"`
	Count           int            `json:"count" gorm:"default:1"`
	Fadhilah        string         `json:"fadhilah" gorm:"type:text"`
	Source          string         `json:"source" gorm:"type:varchar(256)"`
}
