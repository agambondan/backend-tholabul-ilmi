package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type AsbabunNuzulRepository interface {
	FindByAyahID(ayahID int) ([]model.AsbabunNuzul, error)
	FindBySurahNumber(surahNumber int) ([]model.AsbabunNuzul, error)
	FindByID(id int) (*model.AsbabunNuzul, error)
	Create(a *model.AsbabunNuzul) (*model.AsbabunNuzul, error)
	Update(id int, a *model.AsbabunNuzul) (*model.AsbabunNuzul, error)
	Delete(id int) error
}

type asbabunNuzulRepository struct{ db *gorm.DB }

func NewAsbabunNuzulRepository(db *gorm.DB) AsbabunNuzulRepository {
	return &asbabunNuzulRepository{db}
}

func (r *asbabunNuzulRepository) FindByAyahID(ayahID int) ([]model.AsbabunNuzul, error) {
	var items []model.AsbabunNuzul
	return items, r.db.Where("ayah_id = ?", ayahID).Find(&items).Error
}

func (r *asbabunNuzulRepository) FindBySurahNumber(surahNumber int) ([]model.AsbabunNuzul, error) {
	var items []model.AsbabunNuzul
	return items, r.db.
		Joins("JOIN ayah ON ayah.id = asbabun_nuzul.ayah_id").
		Joins("JOIN surah ON surah.id = ayah.surah_id").
		Where("surah.number = ?", surahNumber).
		Order("ayah.number ASC").
		Find(&items).Error
}

func (r *asbabunNuzulRepository) FindByID(id int) (*model.AsbabunNuzul, error) {
	var item model.AsbabunNuzul
	return &item, r.db.First(&item, id).Error
}

func (r *asbabunNuzulRepository) Create(a *model.AsbabunNuzul) (*model.AsbabunNuzul, error) {
	return a, r.db.Create(a).Error
}

func (r *asbabunNuzulRepository) Update(id int, a *model.AsbabunNuzul) (*model.AsbabunNuzul, error) {
	return a, r.db.Model(&model.AsbabunNuzul{}).Where("id = ?", id).Updates(a).Error
}

func (r *asbabunNuzulRepository) Delete(id int) error {
	return r.db.Delete(&model.AsbabunNuzul{}, id).Error
}
