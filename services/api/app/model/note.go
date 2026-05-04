package model

import "github.com/google/uuid"

type NoteRefType string

const (
	NoteRefTypeAyah   NoteRefType = "ayah"
	NoteRefTypeHadith NoteRefType = "hadith"
)

type Note struct {
	BaseID
	UserID  uuid.UUID   `json:"user_id" gorm:"type:uuid;not null;index"`
	RefType NoteRefType `json:"ref_type" gorm:"type:varchar(20);not null;index"`
	RefID   int         `json:"ref_id" gorm:"not null;index"`
	Content string      `json:"content" gorm:"type:text;not null"`
}

type CreateNoteRequest struct {
	RefType NoteRefType `json:"ref_type" validate:"required"`
	RefID   int         `json:"ref_id" validate:"required"`
	Content string      `json:"content" validate:"required,max=5000"`
}

type UpdateNoteRequest struct {
	Content string `json:"content" validate:"required"`
}
