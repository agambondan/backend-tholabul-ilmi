package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type DoaRepository interface {
	FindAll(limit, offset int) ([]model.Doa, error)
	FindByID(int) (*model.Doa, error)
	FindByCategory(model.DoaCategory, int, int) ([]model.Doa, error)
}

type doaRepo struct {
	db *gorm.DB
}

func NewDoaRepository(db *gorm.DB) DoaRepository {
	return &doaRepo{db}
}

func (r *doaRepo) FindAll(limit, offset int) ([]model.Doa, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	var list []model.Doa
	err := r.db.Joins("Translation").Order("category, id").Limit(limit).Offset(offset).Find(&list).Error
	return list, err
}

func (r *doaRepo) FindByID(id int) (*model.Doa, error) {
	var d model.Doa
	if err := r.db.Joins("Translation").First(&d, id).Error; err != nil {
		return nil, err
	}
	return &d, nil
}

func (r *doaRepo) FindByCategory(category model.DoaCategory, limit, offset int) ([]model.Doa, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	var list []model.Doa
	err := r.db.Joins("Translation").Where("category = ?", category).Order("id").Limit(limit).Offset(offset).Find(&list).Error
	return list, err
}
