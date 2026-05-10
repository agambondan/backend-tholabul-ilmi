package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type ManasikRepository interface {
	FindAll() ([]model.ManasikStep, error)
	FindByType(t model.ManasikType) ([]model.ManasikStep, error)
	FindByTypeAndStep(t model.ManasikType, step int) (*model.ManasikStep, error)
}

type manasikRepository struct{ db *gorm.DB }

func NewManasikRepository(db *gorm.DB) ManasikRepository {
	return &manasikRepository{db}
}

func (r *manasikRepository) FindAll() ([]model.ManasikStep, error) {
	var steps []model.ManasikStep
	return steps, r.db.Preload("Translation").Order("type ASC, step_order ASC").Find(&steps).Error
}

func (r *manasikRepository) FindByType(t model.ManasikType) ([]model.ManasikStep, error) {
	var steps []model.ManasikStep
	return steps, r.db.Preload("Translation").Where("type = ?", t).Order("step_order ASC").Find(&steps).Error
}

func (r *manasikRepository) FindByTypeAndStep(t model.ManasikType, step int) (*model.ManasikStep, error) {
	var s model.ManasikStep
	return &s, r.db.Preload("Translation").Where("type = ? AND step_order = ?", t, step).First(&s).Error
}
