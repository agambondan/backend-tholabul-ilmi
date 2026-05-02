package model

import "github.com/google/uuid"

type UserRole string

const (
	RoleAdmin UserRole = "admin"
	RoleUser  UserRole = "user"
)

type User struct {
	BaseUUID
	Name     *string  `json:"name,omitempty" gorm:"type:varchar(256);not null" validate:"required"`
	Email    *string  `json:"email,omitempty" gorm:"type:varchar(256);uniqueIndex;not null" validate:"required,email"`
	Password *string  `json:"-" gorm:"type:varchar(256);not null"`
	Role     UserRole `json:"role,omitempty" gorm:"type:varchar(50);default:'user'"`
	Avatar   *string  `json:"avatar,omitempty" gorm:"type:varchar(512)"`
}

type RegisterRequest struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  *User  `json:"user"`
}

type UpdatePasswordRequest struct {
	OldPassword string `json:"old_password" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=8"`
}

func (u *User) ToPublic() *User {
	return &User{
		BaseUUID: BaseUUID{ID: uuid.UUID{}},
		Name:     u.Name,
		Email:    u.Email,
		Role:     u.Role,
		Avatar:   u.Avatar,
	}
}
