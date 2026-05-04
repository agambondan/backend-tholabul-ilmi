package repository

import (
	"time"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type NotificationRepository interface {
	FindByUser(userID uuid.UUID) ([]model.NotificationSetting, error)
	UpsertMany(settings []model.NotificationSetting) ([]model.NotificationSetting, error)
	FindDue(now time.Time) ([]model.NotificationSetting, error)
	MarkSent(id int, sentAt time.Time) error
}

type notificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) NotificationRepository {
	return &notificationRepository{db}
}

func (r *notificationRepository) FindByUser(userID uuid.UUID) ([]model.NotificationSetting, error) {
	var items []model.NotificationSetting
	err := r.db.Where("user_id = ?", userID).Order("type ASC").Find(&items).Error
	return items, err
}

func (r *notificationRepository) UpsertMany(settings []model.NotificationSetting) ([]model.NotificationSetting, error) {
	if len(settings) == 0 {
		return []model.NotificationSetting{}, nil
	}
	err := r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "type"}},
		DoUpdates: clause.AssignmentColumns([]string{"time", "is_active", "updated_at"}),
	}).Create(&settings).Error
	if err != nil {
		return nil, err
	}
	return r.FindByUser(settings[0].UserID)
}

func (r *notificationRepository) FindDue(now time.Time) ([]model.NotificationSetting, error) {
	var items []model.NotificationSetting
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	err := r.db.
		Preload("User").
		Where("is_active = true AND time = ? AND (last_sent_at IS NULL OR last_sent_at < ?)", now.Format("15:04"), startOfDay).
		Order("type ASC").
		Find(&items).Error
	return items, err
}

func (r *notificationRepository) MarkSent(id int, sentAt time.Time) error {
	return r.db.Model(&model.NotificationSetting{}).Where("id = ?", id).Update("last_sent_at", sentAt).Error
}
