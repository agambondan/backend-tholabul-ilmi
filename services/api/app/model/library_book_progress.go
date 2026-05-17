package model

import (
	"time"

	"github.com/google/uuid"
)

type LibraryBookProgressStatus string

const (
	LibraryBookProgressPlanned   LibraryBookProgressStatus = "planned"
	LibraryBookProgressReading   LibraryBookProgressStatus = "reading"
	LibraryBookProgressCompleted LibraryBookProgressStatus = "completed"
	LibraryBookProgressPaused    LibraryBookProgressStatus = "paused"
)

type LibraryBookProgress struct {
	BaseID
	UserID        uuid.UUID                 `json:"user_id" gorm:"type:uuid;not null;uniqueIndex:idx_library_progress_user_book"`
	LibraryBookID int                       `json:"library_book_id" gorm:"not null;uniqueIndex:idx_library_progress_user_book"`
	Status        LibraryBookProgressStatus `json:"status" gorm:"type:varchar(30);default:'reading';index"`
	CurrentPage   int                       `json:"current_page" gorm:"default:0"`
	Note          string                    `json:"note" gorm:"type:text"`
	LastStudiedAt *time.Time                `json:"last_studied_at,omitempty"`
	Book          *LibraryBook              `json:"book,omitempty" gorm:"foreignKey:LibraryBookID"`
}

type UpdateLibraryBookProgressRequest struct {
	Status      LibraryBookProgressStatus `json:"status"`
	CurrentPage int                       `json:"current_page"`
	Note        string                    `json:"note" validate:"max=5000"`
}
