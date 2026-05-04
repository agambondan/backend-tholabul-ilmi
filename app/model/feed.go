package model

import "github.com/google/uuid"

type FeedRefType string

const (
	FeedRefTypeAyah   FeedRefType = "ayah"
	FeedRefTypeHadith FeedRefType = "hadith"
)

type FeedPost struct {
	BaseUUID
	UserID  uuid.UUID   `json:"user_id" gorm:"type:uuid;not null;index"`
	RefType FeedRefType `json:"ref_type" gorm:"type:varchar(20);not null;index"`
	RefID   int         `json:"ref_id" gorm:"not null;index"`
	Caption string      `json:"caption" gorm:"type:text"`
	Likes   int         `json:"likes" gorm:"default:0"`
	Author  *User       `json:"author,omitempty" gorm:"foreignKey:UserID;-:migration"`
}

type CreateFeedPostRequest struct {
	RefType FeedRefType `json:"ref_type" validate:"required,oneof=ayah hadith"`
	RefID   int         `json:"ref_id" validate:"required"`
	Caption string      `json:"caption"`
}
