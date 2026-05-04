package model

type ManasikType string

const (
	ManasikTypeHaji  ManasikType = "haji"
	ManasikTypeUmrah ManasikType = "umrah"
)

type ManasikStep struct {
	BaseID
	Type        ManasikType `json:"type" gorm:"type:varchar(20);not null;uniqueIndex:idx_manasik_type_step"`
	StepOrder   int         `json:"step_order" gorm:"not null;uniqueIndex:idx_manasik_type_step"`
	Title       string      `json:"title" gorm:"type:varchar(256);not null"`
	Description string      `json:"description" gorm:"type:text"`
	Arabic      string      `json:"arabic" gorm:"type:text"`
	Transliteration string  `json:"transliteration" gorm:"type:text"`
	Translation string      `json:"translation" gorm:"type:text"`
	Notes       string      `json:"notes" gorm:"type:text"`
	IsWajib     bool        `json:"is_wajib" gorm:"default:false"`
}
