package model

type NotificationTemplate struct {
	BaseID
	Code    string `json:"code" gorm:"type:varchar(50);uniqueIndex;not null"`
	Title   string `json:"title" gorm:"type:varchar(256);not null"`
	Body    string `json:"body" gorm:"type:text;not null"`
	Channel string `json:"channel" gorm:"type:varchar(20);default:'email'"` // email, push, inbox
}

type CreateNotificationTemplateRequest struct {
	Code    string `json:"code" validate:"required"`
	Title   string `json:"title" validate:"required"`
	Body    string `json:"body" validate:"required"`
	Channel string `json:"channel"`
}
