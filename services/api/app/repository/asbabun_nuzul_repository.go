package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type AsbabunNuzulRepository interface {
	FindAll(page, size int) ([]model.AsbabunNuzul, error)
	FindByAyahID(ayahID int) ([]model.AsbabunNuzul, error)
	FindBySurahNumber(surahNumber int) ([]model.AsbabunNuzul, error)
	FindByID(id int) (*model.AsbabunNuzul, error)
	FindAyahIDsByReferences(refs []model.AyahReference) ([]int, error)
	Create(a *model.AsbabunNuzul) (*model.AsbabunNuzul, error)
	CreateWithAyahs(a *model.AsbabunNuzul, ayahIDs []int) (*model.AsbabunNuzul, error)
	Update(id int, a *model.AsbabunNuzul) (*model.AsbabunNuzul, error)
	UpdateWithAyahs(id int, a *model.AsbabunNuzul, ayahIDs []int) (*model.AsbabunNuzul, error)
	Delete(id int) error
}

type asbabunNuzulRepository struct{ db *gorm.DB }

func NewAsbabunNuzulRepository(db *gorm.DB) AsbabunNuzulRepository {
	return &asbabunNuzulRepository{db}
}

func (r *asbabunNuzulRepository) FindAll(page, size int) ([]model.AsbabunNuzul, error) {
	if page < 0 {
		page = 0
	}
	if size <= 0 {
		size = 100
	}

	var items []model.AsbabunNuzul
	err := r.db.
		Preload("Translation").
		Preload("Ayahs").
		Preload("Ayahs.Surah").
		Order("id ASC").
		Offset(page * size).
		Limit(size).
		Find(&items).Error
	return items, err
}

// FindByAyahID returns all asbabun nuzul whose `Ayahs` set includes the given
// ayah. With the m2m schema a single ayat can have multiple riwayat (e.g.
// jalur Bukhari + jalur Muslim) so the result is always a slice.
func (r *asbabunNuzulRepository) FindByAyahID(ayahID int) ([]model.AsbabunNuzul, error) {
	var items []model.AsbabunNuzul
	err := r.db.
		Preload("Translation").
		Preload("Ayahs").
		Preload("Ayahs.Surah").
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
		Preload("Ayahs.Surah").
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
	return &item, r.db.Preload("Translation").Preload("Ayahs").Preload("Ayahs.Surah").First(&item, id).Error
}

func (r *asbabunNuzulRepository) FindAyahIDsByReferences(refs []model.AyahReference) ([]int, error) {
	ids := make([]int, 0, len(refs))
	seen := map[int]bool{}
	for _, ref := range refs {
		if ref.SurahNumber <= 0 || ref.AyahNumber <= 0 {
			continue
		}
		key := ref.SurahNumber*10000 + ref.AyahNumber
		if seen[key] {
			continue
		}
		seen[key] = true

		var ayah model.Ayah
		if err := r.db.
			Select("ayah.id").
			Joins("JOIN surah ON surah.id = ayah.surah_id").
			Where("surah.number = ? AND ayah.number = ?", ref.SurahNumber, ref.AyahNumber).
			First(&ayah).Error; err != nil {
			return nil, err
		}
		if ayah.ID != nil {
			ids = append(ids, *ayah.ID)
		}
	}
	return ids, nil
}

func (r *asbabunNuzulRepository) Create(a *model.AsbabunNuzul) (*model.AsbabunNuzul, error) {
	return a, r.db.Create(a).Error
}

func (r *asbabunNuzulRepository) CreateWithAyahs(a *model.AsbabunNuzul, ayahIDs []int) (*model.AsbabunNuzul, error) {
	tx := r.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	trID, err := upsertContentTranslation(tx, a.TranslationID, a.Title, "", "", a.Content)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	a.TranslationID = trID

	if err := tx.Omit("Ayahs.*").Create(a).Error; err != nil {
		tx.Rollback()
		return nil, err
	}
	if err := replaceAsbabunNuzulAyahs(tx, a, ayahIDs); err != nil {
		tx.Rollback()
		return nil, err
	}
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	if a.ID == nil {
		return a, nil
	}
	return r.FindByID(*a.ID)
}

func (r *asbabunNuzulRepository) Update(id int, a *model.AsbabunNuzul) (*model.AsbabunNuzul, error) {
	return a, r.db.Model(&model.AsbabunNuzul{}).Where("id = ?", id).Updates(a).Error
}

func (r *asbabunNuzulRepository) UpdateWithAyahs(id int, a *model.AsbabunNuzul, ayahIDs []int) (*model.AsbabunNuzul, error) {
	var existing model.AsbabunNuzul
	if err := r.db.First(&existing, id).Error; err != nil {
		return nil, err
	}

	tx := r.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	trID, err := upsertContentTranslation(tx, existing.TranslationID, a.Title, "", "", a.Content)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Model(&existing).Updates(map[string]interface{}{
		"title":          a.Title,
		"narrator":       a.Narrator,
		"content":        a.Content,
		"source":         a.Source,
		"display_ref":    a.DisplayRef,
		"translation_id": trID,
	}).Error; err != nil {
		tx.Rollback()
		return nil, err
	}
	if err := replaceAsbabunNuzulAyahs(tx, &existing, ayahIDs); err != nil {
		tx.Rollback()
		return nil, err
	}
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return r.FindByID(id)
}

func (r *asbabunNuzulRepository) Delete(id int) error {
	return r.db.Delete(&model.AsbabunNuzul{}, id).Error
}

func replaceAsbabunNuzulAyahs(db *gorm.DB, item *model.AsbabunNuzul, ayahIDs []int) error {
	ids := uniquePositiveInts(ayahIDs)
	ayahs := make([]model.Ayah, 0)
	if len(ids) > 0 {
		if err := db.Where("id IN ?", ids).Find(&ayahs).Error; err != nil {
			return err
		}
	}
	return db.Model(item).Association("Ayahs").Replace(ayahs)
}

func uniquePositiveInts(values []int) []int {
	seen := map[int]bool{}
	result := make([]int, 0, len(values))
	for _, value := range values {
		if value <= 0 || seen[value] {
			continue
		}
		seen[value] = true
		result = append(result, value)
	}
	return result
}
