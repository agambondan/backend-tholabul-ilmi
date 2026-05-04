package model

import (
	"time"

	"github.com/google/uuid"
)

type ActivityType string

const (
	ActivityQuran  ActivityType = "quran"
	ActivityHadith ActivityType = "hadith"
	ActivityDoa    ActivityType = "doa"
)

type UserActivity struct {
	BaseUUID
	UserID       uuid.UUID    `json:"user_id" gorm:"type:uuid;not null;uniqueIndex:idx_activity_user_date_type"`
	ActivityDate time.Time    `json:"activity_date" gorm:"type:date;not null;uniqueIndex:idx_activity_user_date_type"`
	Type         ActivityType `json:"type" gorm:"type:varchar(50);not null;uniqueIndex:idx_activity_user_date_type"`
	Count        int          `json:"count" gorm:"default:1"`
}

type StreakResponse struct {
	CurrentStreak int `json:"current_streak"`
	LongestStreak int `json:"longest_streak"`
	TotalDays     int `json:"total_days"`
}

type WeeklyActivity struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

type RecordActivityRequest struct {
	Type ActivityType `json:"type" validate:"required,oneof=quran hadith doa"`
}
