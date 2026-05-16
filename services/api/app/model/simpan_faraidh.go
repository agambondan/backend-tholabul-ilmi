package model

import "github.com/google/uuid"

type SimpanFaraidh struct {
	BaseUUID
	UserID        uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index"`
	Wealth        float64   `json:"wealth" gorm:"not null"`
	Debt          float64   `json:"debt" gorm:"default:0"`
	Funeral       float64   `json:"funeral" gorm:"default:0"`
	Will          float64   `json:"will" gorm:"default:0"`
	HeirsJSON     string    `json:"heirs_json" gorm:"type:text;not null"`
	ResultSummary string    `json:"result_summary,omitempty" gorm:"type:text"`
	Catatan       string    `json:"catatan,omitempty" gorm:"type:varchar(500)"`
}

type CreateSimpanFaraidhRequest struct {
	Wealth        float64 `json:"wealth" validate:"min=0"`
	Debt          float64 `json:"debt"`
	Funeral       float64 `json:"funeral"`
	Will          float64 `json:"will"`
	HeirsJSON     string  `json:"heirs_json" validate:"required"`
	ResultSummary string  `json:"result_summary"`
	Catatan       string  `json:"catatan"`
}
