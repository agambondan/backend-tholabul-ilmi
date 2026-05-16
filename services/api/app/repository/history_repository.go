package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type HistoryRepository interface {
	FindAll(category string, yearFrom, yearTo, limit, offset int) ([]model.HistoryEvent, error)
	FindByID(id int) (*model.HistoryEvent, error)
	FindBySlug(slug string) (*model.HistoryEvent, error)
	Create(e *model.HistoryEvent) (*model.HistoryEvent, error)
	Update(id int, e *model.HistoryEvent) (*model.HistoryEvent, error)
	Delete(id int) error
}

type historyRepository struct{ db *gorm.DB }

func NewHistoryRepository(db *gorm.DB) HistoryRepository {
	return &historyRepository{db}
}

func (r *historyRepository) FindAll(category string, yearFrom, yearTo, limit, offset int) ([]model.HistoryEvent, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	var items []model.HistoryEvent
	q := r.db.Preload("Translation").Order("year_miladi ASC")
	if category != "" {
		q = q.Where("category = ?", category)
	}
	if yearFrom > 0 {
		q = q.Where("year_miladi >= ?", yearFrom)
	}
	if yearTo > 0 {
		q = q.Where("year_miladi <= ?", yearTo)
	}
	return items, q.Limit(limit).Offset(offset).Find(&items).Error
}

func (r *historyRepository) FindByID(id int) (*model.HistoryEvent, error) {
	var item model.HistoryEvent
	return &item, r.db.Preload("Translation").First(&item, id).Error
}

func (r *historyRepository) FindBySlug(slug string) (*model.HistoryEvent, error) {
	var item model.HistoryEvent
	return &item, r.db.Preload("Translation").Where("slug = ?", slug).First(&item).Error
}

func (r *historyRepository) Create(e *model.HistoryEvent) (*model.HistoryEvent, error) {
	var saved model.HistoryEvent
	err := r.db.Transaction(func(tx *gorm.DB) error {
		var existing model.HistoryEvent
		err := tx.Where("slug = ?", e.Slug).First(&existing).Error
		if err != nil && err != gorm.ErrRecordNotFound {
			return err
		}

		var existingTranslationID *int
		if err == nil {
			existingTranslationID = existing.TranslationID
			e.ID = existing.ID
		}

		trID, err := upsertContentTranslation(tx, existingTranslationID, e.Title, "", "", e.Description)
		if err != nil {
			return err
		}
		e.TranslationID = trID

		if err := tx.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "slug"}},
			DoUpdates: clause.AssignmentColumns([]string{"title", "description", "year_hijri", "year_miladi", "category", "is_significant", "translation_id"}),
		}).Create(e).Error; err != nil {
			return err
		}
		return tx.Preload("Translation").Where("slug = ?", e.Slug).First(&saved).Error
	})
	return &saved, err
}

func (r *historyRepository) Update(id int, e *model.HistoryEvent) (*model.HistoryEvent, error) {
	var saved model.HistoryEvent
	err := r.db.Transaction(func(tx *gorm.DB) error {
		var existing model.HistoryEvent
		if err := tx.First(&existing, id).Error; err != nil {
			return err
		}

		trID, err := upsertContentTranslation(tx, existing.TranslationID, e.Title, "", "", e.Description)
		if err != nil {
			return err
		}

		if err := tx.Model(&existing).Updates(map[string]interface{}{
			"year_hijri":     e.YearHijri,
			"year_miladi":    e.YearMiladi,
			"title":          e.Title,
			"slug":           e.Slug,
			"description":    e.Description,
			"category":       e.Category,
			"is_significant": e.IsSignificant,
			"translation_id": trID,
		}).Error; err != nil {
			return err
		}
		return tx.Preload("Translation").First(&saved, id).Error
	})
	return &saved, err
}

func (r *historyRepository) Delete(id int) error {
	return r.db.Delete(&model.HistoryEvent{}, id).Error
}
