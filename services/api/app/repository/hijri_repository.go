package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type IslamicEventRepository interface {
	FindAll(category string) ([]model.IslamicEvent, error)
	FindByMonth(month int) ([]model.IslamicEvent, error)
	FindByID(id int) (*model.IslamicEvent, error)
	Create(e *model.IslamicEvent) (*model.IslamicEvent, error)
	Delete(id int) error
}

type islamicEventRepository struct{ db *gorm.DB }

func NewIslamicEventRepository(db *gorm.DB) IslamicEventRepository {
	return &islamicEventRepository{db}
}

func (r *islamicEventRepository) FindAll(category string) ([]model.IslamicEvent, error) {
	var items []model.IslamicEvent
	q := r.db.Preload("Translation").Order("hijri_month ASC, hijri_day ASC")
	if category != "" {
		q = q.Where("category = ?", category)
	}
	return items, q.Find(&items).Error
}

func (r *islamicEventRepository) FindByMonth(month int) ([]model.IslamicEvent, error) {
	var items []model.IslamicEvent
	return items, r.db.Preload("Translation").Where("hijri_month = ?", month).Order("hijri_day ASC").Find(&items).Error
}

func (r *islamicEventRepository) FindByID(id int) (*model.IslamicEvent, error) {
	var item model.IslamicEvent
	return &item, r.db.Preload("Translation").First(&item, id).Error
}

func (r *islamicEventRepository) Create(e *model.IslamicEvent) (*model.IslamicEvent, error) {
	return e, r.db.Clauses(clause.OnConflict{DoNothing: true}).Create(e).Error
}

func (r *islamicEventRepository) Delete(id int) error {
	return r.db.Delete(&model.IslamicEvent{}, id).Error
}
