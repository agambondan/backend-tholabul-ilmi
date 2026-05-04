package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BaseTime struct {
	CreatedAt *time.Time     `json:"-"`
	UpdatedAt *time.Time     `json:"-"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type BaseID struct {
	ID *int `json:"id,omitempty" gorm:"primarykey"`
	BaseTime
}

type BaseUUID struct {
	ID uuid.UUID `json:"id,omitempty" gorm:"primarykey"`
	BaseTime
}
