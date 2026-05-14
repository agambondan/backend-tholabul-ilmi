package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type SearchRepository interface {
	SearchAyah(query string, limit, offset int) ([]model.Ayah, int64, error)
	SearchHadith(query string, limit, offset int) ([]model.Hadith, int64, error)
	SearchDictionary(query string, limit, offset int) ([]model.IslamicTerm, int64, error)
	SearchDoa(query string, limit, offset int) ([]model.Doa, int64, error)
	SearchKajian(query string, limit, offset int) ([]model.Kajian, int64, error)
	SearchPerawi(query string, limit, offset int) ([]model.Perawi, int64, error)
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

func (r *searchRepo) SearchAyah(query string, limit, offset int) ([]model.Ayah, int64, error) {
	var ayahs []model.Ayah
	var total int64

	filter := tsvAyah + ` @@ websearch_to_tsquery('simple', ?) OR "Translation".ar ILIKE ?`
	args := []interface{}{query, "%" + query + "%"}

	r.db.Model(&model.Ayah{}).
		Joins("Translation").
		Joins("Surah").Joins("Surah.Translation").
		Where(filter, args...).
		Count(&total)

	err := r.db.Model(&model.Ayah{}).
		Joins("Translation").
		Joins("Surah").Joins("Surah.Translation").
		Where(filter, args...).
		Order(gorm.Expr(`ts_rank(`+tsvAyah+`, websearch_to_tsquery('simple', ?)) DESC`, query)).
		Limit(limit).Offset(offset).
		Find(&ayahs).Error
	return ayahs, total, err
}

func (r *searchRepo) SearchHadith(query string, limit, offset int) ([]model.Hadith, int64, error) {
	var hadiths []model.Hadith
	var total int64

	filter := tsvHadith + ` @@ websearch_to_tsquery('simple', ?) OR "Translation".ar ILIKE ?`
	args := []interface{}{query, "%" + query + "%"}

	r.db.Model(&model.Hadith{}).
		Joins("Translation").
		Joins("Book").Joins("Book.Translation").
		Joins("Theme").Joins("Theme.Translation").
		Joins("Chapter").Joins("Chapter.Translation").
		Where(filter, args...).
		Count(&total)

	err := r.db.Model(&model.Hadith{}).
		Joins("Translation").
		Joins("Book").Joins("Book.Translation").
		Joins("Theme").Joins("Theme.Translation").
		Joins("Chapter").Joins("Chapter.Translation").
		Where(filter, args...).
		Order(gorm.Expr(`ts_rank(`+tsvHadith+`, websearch_to_tsquery('simple', ?)) DESC`, query)).
		Limit(limit).Offset(offset).
		Find(&hadiths).Error
	return hadiths, total, err
}

func (r *searchRepo) SearchDictionary(query string, limit, offset int) ([]model.IslamicTerm, int64, error) {
	var terms []model.IslamicTerm
	var total int64

	filter := "term ILIKE ? OR definition ILIKE ? OR example ILIKE ? OR source ILIKE ?"
	args := []interface{}{"%" + query + "%", "%" + query + "%", "%" + query + "%", "%" + query + "%"}

	r.db.Model(&model.IslamicTerm{}).Where(filter, args...).Count(&total)

	err := r.db.Model(&model.IslamicTerm{}).Preload("Translation").
		Where(filter, args...).
		Order("term ASC").
		Limit(limit).Offset(offset).
		Find(&terms).Error
	return terms, total, err
}

func (r *searchRepo) SearchDoa(query string, limit, offset int) ([]model.Doa, int64, error) {
	var doas []model.Doa
	var total int64

	filter := `doas.title ILIKE ? OR doas.arabic ILIKE ? OR doas.translation ILIKE ? OR doas.source ILIKE ? OR doas.category::text ILIKE ? OR "Translation".idn ILIKE ? OR "Translation".en ILIKE ? OR "Translation".latin_idn ILIKE ? OR "Translation".latin_en ILIKE ? OR "Translation".ar ILIKE ?`
	args := []interface{}{"%" + query + "%", "%" + query + "%", "%" + query + "%", "%" + query + "%", "%" + query + "%",
		"%" + query + "%", "%" + query + "%", "%" + query + "%", "%" + query + "%", "%" + query + "%"}

	r.db.Model(&model.Doa{}).Joins("Translation").Where(filter, args...).Count(&total)

	err := r.db.Model(&model.Doa{}).Joins("Translation").
		Where(filter, args...).
		Order("doas.category, doas.id").
		Limit(limit).Offset(offset).
		Find(&doas).Error
	return doas, total, err
}

func (r *searchRepo) SearchKajian(query string, limit, offset int) ([]model.Kajian, int64, error) {
	var kajians []model.Kajian
	var total int64

	filter := `kajians.title ILIKE ? OR kajians.description ILIKE ? OR kajians.speaker ILIKE ? OR kajians.topic ILIKE ? OR kajians.type::text ILIKE ? OR "Translation".idn ILIKE ? OR "Translation".en ILIKE ? OR "Translation".description_idn ILIKE ? OR "Translation".description_en ILIKE ?`
	args := []interface{}{"%" + query + "%", "%" + query + "%", "%" + query + "%", "%" + query + "%", "%" + query + "%",
		"%" + query + "%", "%" + query + "%", "%" + query + "%", "%" + query + "%"}

	r.db.Model(&model.Kajian{}).Joins("Translation").Where(filter, args...).Count(&total)

	err := r.db.Model(&model.Kajian{}).Joins("Translation").
		Where(filter, args...).
		Order("kajians.published_at DESC, kajians.id DESC").
		Limit(limit).Offset(offset).
		Find(&kajians).Error
	return kajians, total, err
}

func (r *searchRepo) SearchPerawi(query string, limit, offset int) ([]model.Perawi, int64, error) {
	var perawis []model.Perawi
	var total int64

	filter := "nama_latin ILIKE ? OR nama_arab ILIKE ? OR nama_lengkap ILIKE ? OR kunyah ILIKE ? OR laqab ILIKE ? OR nisbah ILIKE ?"
	args := []interface{}{"%" + query + "%", "%" + query + "%", "%" + query + "%", "%" + query + "%", "%" + query + "%", "%" + query + "%"}

	r.db.Model(&model.Perawi{}).Where(filter, args...).Count(&total)

	err := r.db.Model(&model.Perawi{}).
		Where(filter, args...).
		Order("nama_latin ASC").
		Limit(limit).Offset(offset).
		Find(&perawis).Error
	return perawis, total, err
}
