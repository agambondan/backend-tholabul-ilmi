package model

import (
	"time"

	"github.com/google/uuid"
)

type ProgressType string

const (
	ProgressQuran  ProgressType = "quran"
	ProgressHadith ProgressType = "hadith"
)

type ReadingProgress struct {
	BaseUUID
	UserID      uuid.UUID    `json:"user_id" gorm:"type:uuid;not null;uniqueIndex:idx_progress_user_type"`
	ContentType ProgressType `json:"content_type" gorm:"type:varchar(50);not null;uniqueIndex:idx_progress_user_type"`
	SurahNumber *int         `json:"surah_number,omitempty"`
	AyahNumber  *int         `json:"ayah_number,omitempty"`
	AyahID      *int         `json:"ayah_id,omitempty"`
	BookSlug    *string      `json:"book_slug,omitempty" gorm:"type:varchar(256)"`
	HadithID    *int         `json:"hadith_id,omitempty"`
	LastReadAt  *time.Time   `json:"last_read_at,omitempty"`
}

type UpdateQuranProgressRequest struct {
	SurahNumber int `json:"surah_number" validate:"required"`
	AyahNumber  int `json:"ayah_number" validate:"required"`
	AyahID      int `json:"ayah_id" validate:"required"`
}

type UpdateHadithProgressRequest struct {
	BookSlug string `json:"book_slug" validate:"required"`
	HadithID int    `json:"hadith_id" validate:"required"`
}
