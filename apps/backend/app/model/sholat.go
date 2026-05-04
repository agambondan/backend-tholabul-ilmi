package model

import "github.com/google/uuid"

type PrayerName string

const (
	PrayerSubuh   PrayerName = "subuh"
	PrayerDzuhur  PrayerName = "dzuhur"
	PrayerAshar   PrayerName = "ashar"
	PrayerMaghrib PrayerName = "maghrib"
	PrayerIsya    PrayerName = "isya"
)

type PrayerStatus string

const (
	PrayerBerjamaah PrayerStatus = "berjamaah"
	PrayerMunfarid  PrayerStatus = "munfarid"
	PrayerQadha     PrayerStatus = "qadha"
	PrayerMissed    PrayerStatus = "missed"
)

type SholatLog struct {
	BaseID
	UserID uuid.UUID    `json:"user_id" gorm:"type:uuid;not null;uniqueIndex:idx_sholat_user_date_prayer"`
	Date   string       `json:"date" gorm:"type:date;not null;uniqueIndex:idx_sholat_user_date_prayer"`
	Prayer PrayerName   `json:"prayer" gorm:"type:varchar(20);not null;uniqueIndex:idx_sholat_user_date_prayer"`
	Status PrayerStatus `json:"status" gorm:"type:varchar(20);not null;default:'munfarid'"`
}

type SholatGuide struct {
	BaseID
	Step                int          `json:"step" gorm:"uniqueIndex;not null"`
	Title               string       `json:"title" gorm:"type:varchar(256);not null"`
	Arabic              string       `json:"arabic" gorm:"type:text"`
	Transliteration     string       `json:"transliteration" gorm:"type:text"`
	Translation         string       `json:"translation" gorm:"type:text"`
	Description         string       `json:"description" gorm:"type:text"`
	Source              string       `json:"source" gorm:"type:varchar(512)"`
	Notes               string       `json:"notes" gorm:"type:text"`
	TranslationID       *int         `json:"translation_id,omitempty" gorm:"index"`
	TranslationRelation *Translation `json:"translation_rel,omitempty" gorm:"foreignKey:TranslationID;-:migration"`
}

type LogSholatRequest struct {
	Date   string       `json:"date" validate:"required"`
	Prayer PrayerName   `json:"prayer" validate:"required,oneof=subuh dzuhur ashar maghrib isya"`
	Status PrayerStatus `json:"status" validate:"required,oneof=berjamaah munfarid qadha missed"`
}

type SholatDailyStatus struct {
	Date    string                    `json:"date"`
	Prayers map[PrayerName]*SholatLog `json:"prayers"`
}

type SholatStats struct {
	TotalDays     int     `json:"total_days"`
	BerjamaahPct  float64 `json:"berjamaah_pct"`
	MunfaridPct   float64 `json:"munfarid_pct"`
	QadhaPct      float64 `json:"qadha_pct"`
	MissedPct     float64 `json:"missed_pct"`
	BestStreak    int     `json:"best_streak_days"`
	CurrentStreak int     `json:"current_streak_days"`
}
