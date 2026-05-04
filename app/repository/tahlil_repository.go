package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type TahlilRepository interface {
	FindAll() ([]model.TahlilCollection, error)
	FindByID(id int) (*model.TahlilCollection, error)
}

type tahlilRepository struct {
	db *gorm.DB
}

func NewTahlilRepository(db *gorm.DB) TahlilRepository {
	return &tahlilRepository{db}
}

func (r *tahlilRepository) FindAll() ([]model.TahlilCollection, error) {
	var list []model.TahlilCollection
	err := r.db.Order("id").Find(&list).Error
	return list, err
}

func (r *tahlilRepository) FindByID(id int) (*model.TahlilCollection, error) {
	var col model.TahlilCollection
	err := r.db.Preload("Items", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort_order, id")
	}).First(&col, id).Error
	return &col, err
}
