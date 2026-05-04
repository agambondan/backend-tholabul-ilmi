package model

import "github.com/google/uuid"

type MurojaahSession struct {
	BaseID
	UserID   uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index:idx_murojaah_uid_date"`
	Date     string    `json:"date" gorm:"type:date;not null;index:idx_murojaah_uid_date"`
	SurahID  int       `json:"surah_id" gorm:"not null"`
	FromAyah int       `json:"from_ayah"`
	ToAyah   int       `json:"to_ayah"`
	Score    int       `json:"score" gorm:"default:0"`
	Duration int       `json:"duration_seconds" gorm:"default:0"`
	Note     string    `json:"note" gorm:"type:text"`
}

type RecordMurojaahRequest struct {
	Date     string `json:"date" validate:"required"`
	SurahID  int    `json:"surah_id" validate:"required,min=1"`
	FromAyah int    `json:"from_ayah" validate:"min=1"`
	ToAyah   int    `json:"to_ayah" validate:"min=1"`
	Score    int    `json:"score" validate:"min=0,max=100"`
	Duration int    `json:"duration_seconds" validate:"min=0"`
	Note     string `json:"note"`
}

type MurojaahStats struct {
	TotalSessions int     `json:"total_sessions"`
	AvgScore      float64 `json:"avg_score"`
	TotalDuration int     `json:"total_duration_seconds"`
	SurahCovered  int     `json:"surah_covered"`
}
