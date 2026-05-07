package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type TakhrijRepository interface {
	Save(*model.Takhrij) (*model.Takhrij, error)
	FindAll() ([]model.Takhrij, error)
	FindByID(*int) (*model.Takhrij, error)
	FindByHadithID(*int) ([]model.Takhrij, error)
	UpdateByID(*int, *model.Takhrij) (*model.Takhrij, error)
	DeleteByID(*int) error
}

type takhrijRepo struct {
	db *gorm.DB
}

func NewTakhrijRepository(db *gorm.DB) TakhrijRepository {
	return &takhrijRepo{db}
}

func (r *takhrijRepo) withRelations(db *gorm.DB) *gorm.DB {
	return db.Preload("Book").Preload("Book.Translation")
}

func (r *takhrijRepo) Save(t *model.Takhrij) (*model.Takhrij, error) {
	if err := r.db.Create(t).Error; err != nil {
		return nil, err
	}
	return t, nil
}

func (r *takhrijRepo) FindAll() ([]model.Takhrij, error) {
	var list []model.Takhrij
	err := r.withRelations(r.db).Order("hadith_id, id").Limit(500).Find(&list).Error
	return list, err
}

func (r *takhrijRepo) FindByID(id *int) (*model.Takhrij, error) {
	var t model.Takhrij
	if err := r.withRelations(r.db).First(&t, id).Error; err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *takhrijRepo) FindByHadithID(hadithID *int) ([]model.Takhrij, error) {
	var list []model.Takhrij
	err := r.withRelations(r.db).Where("hadith_id = ?", hadithID).Order("id").Find(&list).Error
	return list, err
}

func (r *takhrijRepo) UpdateByID(id *int, t *model.Takhrij) (*model.Takhrij, error) {
	if _, err := r.FindByID(id); err != nil {
		return nil, err
	}
	t.ID = id
	if err := r.db.Updates(t).Error; err != nil {
		return nil, err
	}
	return t, nil
}

func (r *takhrijRepo) DeleteByID(id *int) error {
	if _, err := r.FindByID(id); err != nil {
		return err
	}
	return r.db.Delete(&model.Takhrij{}, id).Error
}
