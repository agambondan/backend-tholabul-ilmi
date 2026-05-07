package model

import "github.com/google/uuid"

// UserWird stores custom wirid/dzikir created by individual users.
// Tidak berbagi dengan user lain — milik personal pencipta.
type UserWird struct {
	BaseUUID
	UserID          uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index"`
	Title           string    `json:"title" gorm:"type:varchar(256);not null"`
	Arabic          string    `json:"arabic" gorm:"type:text"`
	Transliteration string    `json:"transliteration" gorm:"type:text"`
	Translation     string    `json:"translation" gorm:"type:text"`
	Source          string    `json:"source" gorm:"type:varchar(256)"`
	Count           int       `json:"count" gorm:"default:1"`
	Occasion        string    `json:"occasion" gorm:"type:varchar(64)"`
	Note            string    `json:"note" gorm:"type:text"`
}

type CreateUserWirdRequest struct {
	Title           string `json:"title" validate:"required,max=256"`
	Arabic          string `json:"arabic"`
	Transliteration string `json:"transliteration"`
	Translation     string `json:"translation"`
	Source          string `json:"source"`
	Count           int    `json:"count"`
	Occasion        string `json:"occasion"`
	Note            string `json:"note"`
}

type UpdateUserWirdRequest struct {
	Title           *string `json:"title,omitempty"`
	Arabic          *string `json:"arabic,omitempty"`
	Transliteration *string `json:"transliteration,omitempty"`
	Translation     *string `json:"translation,omitempty"`
	Source          *string `json:"source,omitempty"`
	Count           *int    `json:"count,omitempty"`
	Occasion        *string `json:"occasion,omitempty"`
	Note            *string `json:"note,omitempty"`
}
