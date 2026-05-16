package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type MunasabahRepository interface {
	Save(*model.Munasabah) (*model.Munasabah, error)
	FindByAyahID(int) ([]model.Munasabah, error)
	Delete(int) error
}

type munasabahRepo struct{ db *gorm.DB }

func NewMunasabahRepository(db *gorm.DB) MunasabahRepository { return &munasabahRepo{db} }

func (r *munasabahRepo) Save(m *model.Munasabah) (*model.Munasabah, error) {
	if err := r.db.Create(m).Error; err != nil {
		return nil, err
	}
	return m, nil
}

func (r *munasabahRepo) FindByAyahID(ayahID int) ([]model.Munasabah, error) {
	var items []model.Munasabah
	err := r.db.Preload("AyahFrom").Preload("AyahFrom.Translation").Preload("AyahFrom.Surah").
		Preload("AyahTo").Preload("AyahTo.Translation").Preload("AyahTo.Surah").
		Where("ayah_from_id = ? OR ayah_to_id = ?", ayahID, ayahID).
		Order("id asc").Find(&items).Error
	return items, err
}

func (r *munasabahRepo) Delete(id int) error {
	return r.db.Delete(&model.Munasabah{}, id).Error
}
