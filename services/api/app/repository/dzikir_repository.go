package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type DzikirRepository interface {
	FindAll() ([]model.Dzikir, error)
	FindByID(id int) (*model.Dzikir, error)
	FindByCategory(category model.DzikirCategory) ([]model.Dzikir, error)
	FindByOccasion(occasion string) ([]model.Dzikir, error)
}

type dzikirRepository struct {
	db *gorm.DB
}

func NewDzikirRepository(db *gorm.DB) DzikirRepository {
	return &dzikirRepository{db}
}

func (r *dzikirRepository) FindAll() ([]model.Dzikir, error) {
	var list []model.Dzikir
	err := r.db.Order("category, id").Limit(500).Find(&list).Error
	return list, err
}

func (r *dzikirRepository) FindByID(id int) (*model.Dzikir, error) {
	var d model.Dzikir
	err := r.db.First(&d, id).Error
	return &d, err
}

func (r *dzikirRepository) FindByCategory(category model.DzikirCategory) ([]model.Dzikir, error) {
	var list []model.Dzikir
	err := r.db.Where("category = ?", category).Order("id").Limit(100).Find(&list).Error
	return list, err
}

func (r *dzikirRepository) FindByOccasion(occasion string) ([]model.Dzikir, error) {
	var list []model.Dzikir
	err := r.db.Where("occasion = ?", occasion).Order("id").Limit(100).Find(&list).Error
	return list, err
}
