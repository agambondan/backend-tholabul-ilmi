package model

import "github.com/google/uuid"

type TilawahLog struct {
	BaseID
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index:idx_tilawah_uid_date"`
	Date      string    `json:"date" gorm:"type:date;not null;index:idx_tilawah_uid_date"`
	PagesRead int       `json:"pages_read" gorm:"default:0"`
	JuzRead   float64   `json:"juz_read" gorm:"type:decimal(4,2);default:0"`
	Note      string    `json:"note" gorm:"type:text"`
}

type TilawahSummary struct {
	TotalPages    int     `json:"total_pages"`
	TotalJuz      float64 `json:"total_juz"`
	DailyAvgPages float64 `json:"daily_avg_pages"`
	EstKhatamDays int     `json:"est_khatam_days"`
	LogCount      int     `json:"log_count"`
}

type CreateTilawahRequest struct {
	Date      string  `json:"date" validate:"required"`
	PagesRead int     `json:"pages_read" validate:"min=0"`
	JuzRead   float64 `json:"juz_read" validate:"min=0"`
	Note      string  `json:"note"`
}
