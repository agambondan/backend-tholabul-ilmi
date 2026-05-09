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

// FindByAyahID returns all asbabun nuzul whose `Ayahs` set includes the given
// ayah. With the m2m schema a single ayat can have multiple riwayat (e.g.
// jalur Bukhari + jalur Muslim) so the result is always a slice.
func (r *asbabunNuzulRepository) FindByAyahID(ayahID int) ([]model.AsbabunNuzul, error) {
	var items []model.AsbabunNuzul
	err := r.db.
		Preload("Translation").
		Preload("Ayahs").
		Joins("JOIN asbabun_nuzul_ayahs j ON j.asbabun_nuzul_id = asbabun_nuzul.id").
		Where("j.ayah_id = ?", ayahID).
		Find(&items).Error
	return items, err
}

// FindBySurahNumber returns all asbabun nuzul tied to any ayah of the given
// surah, sorted by the smallest ayah number each riwayat references.
func (r *asbabunNuzulRepository) FindBySurahNumber(surahNumber int) ([]model.AsbabunNuzul, error) {
	var items []model.AsbabunNuzul
	err := r.db.
		Preload("Translation").
		Preload("Ayahs").
		Joins("JOIN asbabun_nuzul_ayahs j ON j.asbabun_nuzul_id = asbabun_nuzul.id").
		Joins("JOIN ayah ON ayah.id = j.ayah_id").
		Joins("JOIN surah ON surah.id = ayah.surah_id").
		Where("surah.number = ?", surahNumber).
		Group("asbabun_nuzul.id").
		Order("MIN(ayah.number) ASC").
		Find(&items).Error
	return items, err
}

func (r *asbabunNuzulRepository) FindByID(id int) (*model.AsbabunNuzul, error) {
	var item model.AsbabunNuzul
	return &item, r.db.Preload("Translation").Preload("Ayahs").First(&item, id).Error
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
