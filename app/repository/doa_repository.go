package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type DoaRepository interface {
	FindAll() ([]model.Doa, error)
	FindByID(int) (*model.Doa, error)
	FindByCategory(model.DoaCategory) ([]model.Doa, error)
}

type doaRepo struct {
	db *gorm.DB
}

func NewDoaRepository(db *gorm.DB) DoaRepository {
	return &doaRepo{db}
}

func (r *doaRepo) FindAll() ([]model.Doa, error) {
	var list []model.Doa
	err := r.db.Order("category, id").Limit(500).Find(&list).Error
	return list, err
}

func (r *doaRepo) FindByID(id int) (*model.Doa, error) {
	var d model.Doa
	if err := r.db.First(&d, id).Error; err != nil {
		return nil, err
	}
	return &d, nil
}

func (r *doaRepo) FindByCategory(category model.DoaCategory) ([]model.Doa, error) {
	var list []model.Doa
	err := r.db.Where("category = ?", category).Order("id").Limit(100).Find(&list).Error
	return list, err
}
