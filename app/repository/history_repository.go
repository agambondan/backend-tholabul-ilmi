package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type HistoryRepository interface {
	FindAll(category string, yearFrom, yearTo int) ([]model.HistoryEvent, error)
	FindByID(id int) (*model.HistoryEvent, error)
	FindBySlug(slug string) (*model.HistoryEvent, error)
	Create(e *model.HistoryEvent) (*model.HistoryEvent, error)
	Update(id int, e *model.HistoryEvent) (*model.HistoryEvent, error)
	Delete(id int) error
}

type historyRepository struct{ db *gorm.DB }

func NewHistoryRepository(db *gorm.DB) HistoryRepository {
	return &historyRepository{db}
}

func (r *historyRepository) FindAll(category string, yearFrom, yearTo int) ([]model.HistoryEvent, error) {
	var items []model.HistoryEvent
	q := r.db.Order("year_miladi ASC")
	if category != "" {
		q = q.Where("category = ?", category)
	}
	if yearFrom > 0 {
		q = q.Where("year_miladi >= ?", yearFrom)
	}
	if yearTo > 0 {
		q = q.Where("year_miladi <= ?", yearTo)
	}
	return items, q.Limit(500).Find(&items).Error
}

func (r *historyRepository) FindByID(id int) (*model.HistoryEvent, error) {
	var item model.HistoryEvent
	return &item, r.db.First(&item, id).Error
}

func (r *historyRepository) FindBySlug(slug string) (*model.HistoryEvent, error) {
	var item model.HistoryEvent
	return &item, r.db.Where("slug = ?", slug).First(&item).Error
}

func (r *historyRepository) Create(e *model.HistoryEvent) (*model.HistoryEvent, error) {
	return e, r.db.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "slug"}}, DoUpdates: clause.AssignmentColumns([]string{"title", "description", "year_hijri", "year_miladi", "category", "is_significant"})}).Create(e).Error
}

func (r *historyRepository) Update(id int, e *model.HistoryEvent) (*model.HistoryEvent, error) {
	return e, r.db.Model(&model.HistoryEvent{}).Where("id = ?", id).Updates(e).Error
}

func (r *historyRepository) Delete(id int) error {
	return r.db.Delete(&model.HistoryEvent{}, id).Error
}
