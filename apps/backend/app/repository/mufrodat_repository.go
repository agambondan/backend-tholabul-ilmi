package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type MufrodatRepository interface {
	FindByAyahID(int) ([]model.Mufrodat, error)
	FindByRootWord(string) ([]model.Mufrodat, error)
}

type mufrodatRepo struct {
	db *gorm.DB
}

func NewMufrodatRepository(db *gorm.DB) MufrodatRepository {
	return &mufrodatRepo{db}
}

func (r *mufrodatRepo) base() *gorm.DB {
	return r.db.Model(&model.Mufrodat{}).Preload("Ayah").Preload("Ayah.Surah").Preload("Ayah.Translation")
}

func (r *mufrodatRepo) FindByAyahID(ayahID int) ([]model.Mufrodat, error) {
	var items []model.Mufrodat
	err := r.base().
		Where("ayah_id = ?", ayahID).
		Order("word_index asc").
		Find(&items).Error
	return items, err
}

func (r *mufrodatRepo) FindByRootWord(rootWord string) ([]model.Mufrodat, error) {
	var items []model.Mufrodat
	err := r.base().
		Where("root_word ILIKE ?", "%"+rootWord+"%").
		Order("ayah_id asc, word_index asc").
		Find(&items).Error
	return items, err
}
