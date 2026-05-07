package model

import (
	"github.com/google/uuid"
)

// DzikirLog records when a user has done a specific dzikir on a given date.
// LogDate uses YYYY-MM-DD string to simplify date-only comparisons.
type DzikirLog struct {
	BaseUUID
	UserID   uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	DzikirID int            `json:"dzikir_id" gorm:"not null;index"`
	LogDate  string         `json:"log_date" gorm:"type:varchar(10);not null;index"` // YYYY-MM-DD
	Category DzikirCategory `json:"category" gorm:"type:varchar(50)"`
}

type LogDzikirRequest struct {
	DzikirID int    `json:"dzikir_id" validate:"required"`
	LogDate  string `json:"log_date"` // optional; defaults to today
	Category string `json:"category"`
}
