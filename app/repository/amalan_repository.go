package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type AmalanRepository interface {
	FindAllItems() ([]model.AmalanItem, error)
	FindTodayStatus(userID uuid.UUID, date string) ([]model.AmalanWithStatus, error)
	ToggleLog(userID uuid.UUID, amalanItemID int, date string, isDone bool) error
	FindHistory(userID uuid.UUID, from, to string) ([]model.AmalanLog, error)
}

type amalanRepository struct {
	db *gorm.DB
}

func NewAmalanRepository(db *gorm.DB) AmalanRepository {
	return &amalanRepository{db}
}

func (r *amalanRepository) FindAllItems() ([]model.AmalanItem, error) {
	var items []model.AmalanItem
	err := r.db.Where("is_active = true").Order("category, name").Limit(200).Find(&items).Error
	return items, err
}

func (r *amalanRepository) FindTodayStatus(userID uuid.UUID, date string) ([]model.AmalanWithStatus, error) {
	items, err := r.FindAllItems()
	if err != nil {
		return nil, err
	}
	var logs []model.AmalanLog
	r.db.Where("user_id = ? AND date = ?", userID, date).Find(&logs)

	logMap := make(map[int]model.AmalanLog)
	for _, l := range logs {
		logMap[l.AmalanItemID] = l
	}

	result := make([]model.AmalanWithStatus, len(items))
	for i, item := range items {
		ws := model.AmalanWithStatus{AmalanItem: item}
		if l, ok := logMap[*item.ID]; ok {
			ws.IsDone = l.IsDone
			ws.LogID = l.ID
		}
		result[i] = ws
	}
	return result, nil
}

func (r *amalanRepository) ToggleLog(userID uuid.UUID, amalanItemID int, date string, isDone bool) error {
	log := model.AmalanLog{
		UserID:       userID,
		AmalanItemID: amalanItemID,
		Date:         date,
		IsDone:       isDone,
	}
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "amalan_item_id"}, {Name: "date"}},
		DoUpdates: clause.AssignmentColumns([]string{"is_done"}),
	}).Create(&log).Error
}

func (r *amalanRepository) FindHistory(userID uuid.UUID, from, to string) ([]model.AmalanLog, error) {
	var logs []model.AmalanLog
	err := r.db.Preload("AmalanItem").
		Where("user_id = ? AND date BETWEEN ? AND ?", userID, from, to).
		Order("date DESC").Find(&logs).Error
	return logs, err
}
