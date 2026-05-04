package model

import "github.com/google/uuid"

type CommentRefType string

const (
	CommentRefTypeAyah   CommentRefType = "ayah"
	CommentRefTypeHadith CommentRefType = "hadith"
)

type Comment struct {
	BaseID
	UserID    uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	RefType   CommentRefType `json:"ref_type" gorm:"type:varchar(20);not null;index"`
	RefID     int            `json:"ref_id" gorm:"not null;index"`
	Content   string         `json:"content" gorm:"type:text;not null"`
	ParentID  *int           `json:"parent_id,omitempty" gorm:"index"`
	LikeCount int            `json:"like_count" gorm:"default:0"`
	Replies   []Comment      `json:"replies,omitempty" gorm:"foreignKey:ParentID;-:migration"`
	Username  string         `json:"username,omitempty" gorm:"-"`
}

type CreateCommentRequest struct {
	RefType  CommentRefType `json:"ref_type" validate:"required"`
	RefID    int            `json:"ref_id" validate:"required"`
	Content  string         `json:"content" validate:"required,max=5000"`
	ParentID *int           `json:"parent_id,omitempty"`
}
