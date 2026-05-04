package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type AsmaUlHusnaRepository interface {
	FindAll() ([]model.AsmaUlHusna, error)
	FindByNumber(int) (*model.AsmaUlHusna, error)
}

type asmaUlHusnaRepo struct {
	db *gorm.DB
}

func NewAsmaUlHusnaRepository(db *gorm.DB) AsmaUlHusnaRepository {
	return &asmaUlHusnaRepo{db}
}

func (r *asmaUlHusnaRepo) FindAll() ([]model.AsmaUlHusna, error) {
	var list []model.AsmaUlHusna
	err := r.db.Order("number asc").Find(&list).Error
	return list, err
}

func (r *asmaUlHusnaRepo) FindByNumber(number int) (*model.AsmaUlHusna, error) {
	var a model.AsmaUlHusna
	if err := r.db.Where("number = ?", number).First(&a).Error; err != nil {
		return nil, err
	}
	return &a, nil
}
