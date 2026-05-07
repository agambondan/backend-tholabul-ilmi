package model

import (
	"time"

	"github.com/google/uuid"
)

// Achievement defines a milestone badge that users can earn.
type Achievement struct {
	BaseID
	Code        string `json:"code" gorm:"type:varchar(64);uniqueIndex;not null"`
	Name        string `json:"name" gorm:"type:varchar(128);not null"`
	NameEn      string `json:"name_en" gorm:"type:varchar(128)"`
	Description string `json:"description" gorm:"type:text"`
	DescEn      string `json:"desc_en" gorm:"type:text"`
	Icon        string `json:"icon" gorm:"type:varchar(256)"` // emoji or URL
	Category    string `json:"category" gorm:"type:varchar(64)"`
	// Threshold stores the numeric target for this achievement (e.g. streak=7 → 7).
	// Evaluation logic lives in the service.
	Threshold int `json:"threshold" gorm:"default:1"`
}

// UserAchievement records when a user earned a specific achievement.
type UserAchievement struct {
	BaseUUID
	UserID        uuid.UUID   `json:"user_id" gorm:"type:uuid;not null;index"`
	AchievementID int         `json:"achievement_id" gorm:"not null;index"`
	Achievement   Achievement `json:"achievement" gorm:"foreignKey:AchievementID"`
	EarnedAt      time.Time   `json:"earned_at"`
}

// UserPoints tracks the cumulative points a user has earned.
type UserPoints struct {
	BaseUUID
	UserID      uuid.UUID `json:"user_id" gorm:"type:uuid;not null;uniqueIndex"`
	TotalPoints int       `json:"total_points" gorm:"default:0"`
}
