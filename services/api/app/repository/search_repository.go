package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type SearchRepository interface {
	SearchAyah(query string, limit int) ([]model.Ayah, error)
	SearchHadith(query string, limit int) ([]model.Hadith, error)
	SearchDictionary(query string, limit int) ([]model.IslamicTerm, error)
	SearchPerawi(query string, limit int) ([]model.Perawi, error)
}

type searchRepo struct {
	db *gorm.DB
}

func NewSearchRepository(db *gorm.DB) SearchRepository {
	return &searchRepo{db}
}

// tsvAyah builds the tsvector expression over the ayah translation columns.
const tsvAyah = `to_tsvector('simple', coalesce("Translation".idn,'') || ' ' || coalesce("Translation".en,''))`

// tsvHadith builds the tsvector expression over the hadith translation columns.
const tsvHadith = `to_tsvector('simple', coalesce("Translation".idn,'') || ' ' || coalesce("Translation".en,''))`

func (r *searchRepo) SearchAyah(query string, limit int) ([]model.Ayah, error) {
	var ayahs []model.Ayah
	err := r.db.
		Joins("Translation").
		Joins("Surah").Joins("Surah.Translation").
		Where(tsvAyah+` @@ websearch_to_tsquery('simple', ?) OR "Translation".ar ILIKE ?`,
			query, "%"+query+"%").
		Order(gorm.Expr(`ts_rank(`+tsvAyah+`, websearch_to_tsquery('simple', ?)) DESC`, query)).
		Limit(limit).
		Find(&ayahs).Error
	return ayahs, err
}

func (r *searchRepo) SearchHadith(query string, limit int) ([]model.Hadith, error) {
	var hadiths []model.Hadith
	err := r.db.
		Joins("Translation").
		Joins("Book").Joins("Book.Translation").
		Joins("Theme").Joins("Theme.Translation").
		Joins("Chapter").Joins("Chapter.Translation").
		Where(tsvHadith+` @@ websearch_to_tsquery('simple', ?) OR "Translation".ar ILIKE ?`,
			query, "%"+query+"%").
		Order(gorm.Expr(`ts_rank(`+tsvHadith+`, websearch_to_tsquery('simple', ?)) DESC`, query)).
		Limit(limit).
		Find(&hadiths).Error
	return hadiths, err
}

func (r *searchRepo) SearchDictionary(query string, limit int) ([]model.IslamicTerm, error) {
	var terms []model.IslamicTerm
	err := r.db.
		Preload("Translation").
		Where("term ILIKE ? OR definition ILIKE ? OR example ILIKE ? OR source ILIKE ?",
			"%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%").
		Order("term ASC").
		Limit(limit).
		Find(&terms).Error
	return terms, err
}

func (r *searchRepo) SearchPerawi(query string, limit int) ([]model.Perawi, error) {
	var perawis []model.Perawi
	err := r.db.
		Where("nama_latin ILIKE ? OR nama_arab ILIKE ? OR nama_lengkap ILIKE ? OR kunyah ILIKE ? OR laqab ILIKE ? OR nisbah ILIKE ?",
			"%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%").
		Order("nama_latin ASC").
		Limit(limit).
		Find(&perawis).Error
	return perawis, err
}
