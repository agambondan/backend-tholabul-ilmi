package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type AsmaUlHusnaRepository interface {
	FindAll(limit, offset int) ([]model.AsmaUlHusna, error)
	FindByNumber(int) (*model.AsmaUlHusna, error)
}

type asmaUlHusnaRepo struct {
	db *gorm.DB
}

func NewAsmaUlHusnaRepository(db *gorm.DB) AsmaUlHusnaRepository {
	return &asmaUlHusnaRepo{db}
}

func (r *asmaUlHusnaRepo) FindAll(limit, offset int) ([]model.AsmaUlHusna, error) {
	if limit <= 0 {
		limit = 99
	}
	if offset < 0 {
		offset = 0
	}
	var list []model.AsmaUlHusna
	err := r.db.Preload("Translation").Order("number asc").Limit(limit).Offset(offset).Find(&list).Error
	return list, err
}

func (r *asmaUlHusnaRepo) FindByNumber(number int) (*model.AsmaUlHusna, error) {
	var a model.AsmaUlHusna
	if err := r.db.Preload("Translation").Where("number = ?", number).First(&a).Error; err != nil {
		return nil, err
	}
	return &a, nil
}
