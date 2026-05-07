package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type DictionaryRepository interface {
	FindAll(category string, search string) ([]model.IslamicTerm, error)
	FindByTerm(term string) (*model.IslamicTerm, error)
	FindByCategory(category model.TermCategory) ([]model.IslamicTerm, error)
	FindByID(id int) (*model.IslamicTerm, error)
	Create(t *model.IslamicTerm) (*model.IslamicTerm, error)
	Update(id int, t *model.IslamicTerm) (*model.IslamicTerm, error)
	Delete(id int) error
}

type dictionaryRepository struct{ db *gorm.DB }

func NewDictionaryRepository(db *gorm.DB) DictionaryRepository {
	return &dictionaryRepository{db}
}

func (r *dictionaryRepository) FindAll(category string, search string) ([]model.IslamicTerm, error) {
	var items []model.IslamicTerm
	q := r.db.Preload("Translation").Order("term ASC")
	if category != "" {
		q = q.Where("category = ?", category)
	}
	if search != "" {
		q = q.Where("term ILIKE ? OR definition ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	return items, q.Limit(500).Find(&items).Error
}

func (r *dictionaryRepository) FindByTerm(term string) (*model.IslamicTerm, error) {
	var item model.IslamicTerm
	return &item, r.db.Preload("Translation").Where("term ILIKE ?", term).First(&item).Error
}

func (r *dictionaryRepository) FindByCategory(category model.TermCategory) ([]model.IslamicTerm, error) {
	var items []model.IslamicTerm
	return items, r.db.Preload("Translation").Where("category = ?", category).Order("term ASC").Limit(200).Find(&items).Error
}

func (r *dictionaryRepository) FindByID(id int) (*model.IslamicTerm, error) {
	var item model.IslamicTerm
	return &item, r.db.Preload("Translation").First(&item, id).Error
}

func (r *dictionaryRepository) Create(t *model.IslamicTerm) (*model.IslamicTerm, error) {
	return t, r.db.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "term"}}, DoUpdates: clause.AssignmentColumns([]string{"category", "definition", "example", "source", "origin"})}).Create(t).Error
}

func (r *dictionaryRepository) Update(id int, t *model.IslamicTerm) (*model.IslamicTerm, error) {
	return t, r.db.Model(&model.IslamicTerm{}).Where("id = ?", id).Updates(t).Error
}

func (r *dictionaryRepository) Delete(id int) error {
	return r.db.Delete(&model.IslamicTerm{}, id).Error
}
