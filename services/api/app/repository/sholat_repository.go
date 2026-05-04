package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type SholatRepository interface {
	Upsert(log *model.SholatLog) (*model.SholatLog, error)
	FindByUserIDAndDate(userID uuid.UUID, date string) ([]model.SholatLog, error)
	FindByUserIDDateRange(userID uuid.UUID, from, to string) ([]model.SholatLog, error)
	FindAllGuides() ([]model.SholatGuide, error)
	FindGuideByStep(step int) (*model.SholatGuide, error)
}

type sholatRepository struct {
	db *gorm.DB
}

func NewSholatRepository(db *gorm.DB) SholatRepository {
	return &sholatRepository{db}
}

func (r *sholatRepository) Upsert(log *model.SholatLog) (*model.SholatLog, error) {
	err := r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "date"}, {Name: "prayer"}},
		DoUpdates: clause.AssignmentColumns([]string{"status"}),
	}).Create(log).Error
	if err != nil {
		return nil, err
	}
	var result model.SholatLog
	r.db.Where("user_id = ? AND date = ? AND prayer = ?", log.UserID, log.Date, log.Prayer).First(&result)
	return &result, nil
}

func (r *sholatRepository) FindByUserIDAndDate(userID uuid.UUID, date string) ([]model.SholatLog, error) {
	var list []model.SholatLog
	err := r.db.Where("user_id = ? AND date = ?", userID, date).Find(&list).Error
	return list, err
}

func (r *sholatRepository) FindByUserIDDateRange(userID uuid.UUID, from, to string) ([]model.SholatLog, error) {
	var list []model.SholatLog
	q := r.db.Where("user_id = ?", userID)
	if from != "" {
		q = q.Where("date >= ?", from)
	}
	if to != "" {
		q = q.Where("date <= ?", to)
	}
	err := q.Order("date DESC, prayer").Limit(400).Find(&list).Error
	return list, err
}

func (r *sholatRepository) FindAllGuides() ([]model.SholatGuide, error) {
	var list []model.SholatGuide
	err := r.db.Order("step").Find(&list).Error
	return list, err
}

func (r *sholatRepository) FindGuideByStep(step int) (*model.SholatGuide, error) {
	var g model.SholatGuide
	err := r.db.Where("step = ?", step).First(&g).Error
	return &g, err
}
