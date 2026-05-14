package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type TahlilRepository interface {
	FindAll(limit, offset int) ([]model.TahlilCollection, error)
	FindByID(id int) (*model.TahlilCollection, error)
	FindAllItems(limit, offset int) ([]model.TahlilItem, error)
	CreateItem(item *model.TahlilItem) (*model.TahlilItem, error)
	UpdateItem(id int, item *model.TahlilItem) (*model.TahlilItem, error)
	DeleteItem(id int) error
	EnsureCollection(t model.TahlilType) (*model.TahlilCollection, error)
}

type tahlilRepository struct {
	db *gorm.DB
}

func NewTahlilRepository(db *gorm.DB) TahlilRepository {
	return &tahlilRepository{db}
}

func (r *tahlilRepository) FindAll(limit, offset int) ([]model.TahlilCollection, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	var list []model.TahlilCollection
	err := r.db.Order("id").Limit(limit).Offset(offset).Find(&list).Error
	return list, err
}

func (r *tahlilRepository) FindByID(id int) (*model.TahlilCollection, error) {
	var col model.TahlilCollection
	err := r.db.Preload("Items.Translation").Preload("Items", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort_order, id")
	}).First(&col, id).Error
	return &col, err
}

func (r *tahlilRepository) FindAllItems(limit, offset int) ([]model.TahlilItem, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	var list []model.TahlilItem
	err := r.db.Preload("Translation").Order("collection_id, sort_order, id").Limit(limit).Offset(offset).Find(&list).Error
	return list, err
}

func (r *tahlilRepository) CreateItem(item *model.TahlilItem) (*model.TahlilItem, error) {
	trID, err := upsertContentTranslation(r.db, nil, item.Label, item.Arabic, item.Transliteration, item.TranslationText)
	if err != nil {
		return nil, err
	}
	item.TranslationID = trID
	if item.Repeat <= 0 {
		item.Repeat = 1
	}
	if err := r.db.Create(item).Error; err != nil {
		return nil, err
	}
	return r.findItemByID(*item.ID)
}

func (r *tahlilRepository) UpdateItem(id int, item *model.TahlilItem) (*model.TahlilItem, error) {
	var existing model.TahlilItem
	if err := r.db.First(&existing, id).Error; err != nil {
		return nil, err
	}
	trID, err := upsertContentTranslation(r.db, existing.TranslationID, item.Label, item.Arabic, item.Transliteration, item.TranslationText)
	if err != nil {
		return nil, err
	}
	updates := map[string]interface{}{
		"collection_id":   item.CollectionID,
		"sort_order":      item.SortOrder,
		"label":           item.Label,
		"arabic":          item.Arabic,
		"transliteration": item.Transliteration,
		"translation":     item.TranslationText,
		"repeat":          item.Repeat,
		"translation_id":  trID,
	}
	if updates["repeat"].(int) <= 0 {
		updates["repeat"] = 1
	}
	if err := r.db.Model(&existing).Updates(updates).Error; err != nil {
		return nil, err
	}
	return r.findItemByID(id)
}

func (r *tahlilRepository) DeleteItem(id int) error {
	return r.db.Delete(&model.TahlilItem{}, id).Error
}

func (r *tahlilRepository) EnsureCollection(t model.TahlilType) (*model.TahlilCollection, error) {
	var col model.TahlilCollection
	err := r.db.Where("type = ?", t).First(&col).Error
	if err == nil {
		return &col, nil
	}
	col = model.TahlilCollection{
		Type:        t,
		Title:       string(t),
		Description: "Auto-created collection for admin managed readings.",
	}
	if err := r.db.Create(&col).Error; err != nil {
		return nil, err
	}
	return &col, nil
}

func (r *tahlilRepository) findItemByID(id int) (*model.TahlilItem, error) {
	var item model.TahlilItem
	err := r.db.Preload("Translation").First(&item, id).Error
	return &item, err
}
