package model

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type BaseTime struct {
	CreatedAt *time.Time    `json:"-"`
	UpdatedAt *time.Time    `json:"-"`
	DeletedAt *sql.NullTime `json:"-" gorm:"index"`
}

type BaseID struct {
	ID *int `json:"id,omitempty" gorm:"primarykey"`
	BaseTime
}

type BaseUUID struct {
	ID uuid.UUID `json:"id,omitempty" gorm:"primarykey"`
	BaseTime
}
