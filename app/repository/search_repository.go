package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type SearchRepository interface {
	SearchAyah(query string, limit int) ([]model.Ayah, error)
	SearchHadith(query string, limit int) ([]model.Hadith, error)
}

type searchRepo struct {
	db *gorm.DB
}

func NewSearchRepository(db *gorm.DB) SearchRepository {
	return &searchRepo{db}
}

func (r *searchRepo) SearchAyah(query string, limit int) ([]model.Ayah, error) {
	var ayahs []model.Ayah
	q := "%" + query + "%"
	err := r.db.
		Joins("JOIN translation ON translation.id = ayah.translation_id").
		Where("translation.idn ILIKE ? OR translation.en ILIKE ? OR translation.ar ILIKE ?", q, q, q).
		Preload("Translation").Preload("Surah").Preload("Surah.Translation").
		Limit(limit).
		Find(&ayahs).Error
	return ayahs, err
}

func (r *searchRepo) SearchHadith(query string, limit int) ([]model.Hadith, error) {
	var hadiths []model.Hadith
	q := "%" + query + "%"
	err := r.db.
		Joins("JOIN translation ON translation.id = hadith.translation_id").
		Where("translation.idn ILIKE ? OR translation.en ILIKE ? OR translation.ar ILIKE ?", q, q, q).
		Preload("Translation").Preload("Book").Preload("Theme").Preload("Chapter").
		Limit(limit).
		Find(&hadiths).Error
	return hadiths, err
}
