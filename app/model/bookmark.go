package model

import "github.com/google/uuid"

type BookmarkType string

const (
	BookmarkAyah   BookmarkType = "ayah"
	BookmarkHadith BookmarkType = "hadith"
)

type Bookmark struct {
	BaseUUID
	UserID  uuid.UUID    `json:"user_id" gorm:"type:uuid;not null;uniqueIndex:idx_bookmark_user_ref"`
	RefType BookmarkType `json:"ref_type" gorm:"type:varchar(50);not null;uniqueIndex:idx_bookmark_user_ref"`
	RefID   int          `json:"ref_id" gorm:"not null;uniqueIndex:idx_bookmark_user_ref"`
	Ayah    *Ayah        `json:"ayah,omitempty" gorm:"-"`
	Hadith  *Hadith      `json:"hadith,omitempty" gorm:"-"`
}
