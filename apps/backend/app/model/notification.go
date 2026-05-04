package model

import (
	"time"

	"github.com/google/uuid"
)

type NotificationType string

const (
	NotificationTypeDailyQuran  NotificationType = "daily_quran"
	NotificationTypeDailyHadith NotificationType = "daily_hadith"
	NotificationTypeDoa         NotificationType = "doa"
)

type NotificationSetting struct {
	BaseID
	UserID     uuid.UUID        `json:"user_id" gorm:"type:uuid;not null;uniqueIndex:idx_notification_user_type"`
	Type       NotificationType `json:"type" gorm:"type:varchar(50);not null;uniqueIndex:idx_notification_user_type"`
	Time       string           `json:"time" gorm:"type:varchar(5);not null"`
	IsActive   bool             `json:"is_active" gorm:"default:true"`
	LastSentAt *time.Time       `json:"last_sent_at,omitempty"`
	User       *User            `json:"user,omitempty" gorm:"foreignKey:UserID;references:ID"`
}

type NotificationSettingRequest struct {
	Type     NotificationType `json:"type" validate:"required,oneof=daily_quran daily_hadith doa"`
	Time     string           `json:"time" validate:"required"`
	IsActive *bool            `json:"is_active" validate:"required"`
}

type NotificationSettingsUpsertRequest struct {
	Settings []NotificationSettingRequest `json:"settings" validate:"required,dive"`
}
