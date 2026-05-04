package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CommentRepository interface {
	FindByRef(refType model.CommentRefType, refID int) ([]model.Comment, error)
	FindByID(id int) (*model.Comment, error)
	Create(c *model.Comment) (*model.Comment, error)
	Delete(id int, userID uuid.UUID) error
}

type commentRepository struct{ db *gorm.DB }

func NewCommentRepository(db *gorm.DB) CommentRepository {
	return &commentRepository{db}
}

func (r *commentRepository) FindByRef(refType model.CommentRefType, refID int) ([]model.Comment, error) {
	var items []model.Comment
	err := r.db.
		Where("ref_type = ? AND ref_id = ? AND parent_id IS NULL", refType, refID).
		Preload("Replies").
		Order("created_at ASC").
		Find(&items).Error
	return items, err
}

func (r *commentRepository) FindByID(id int) (*model.Comment, error) {
	var item model.Comment
	return &item, r.db.First(&item, id).Error
}

func (r *commentRepository) Create(c *model.Comment) (*model.Comment, error) {
	return c, r.db.Create(c).Error
}

func (r *commentRepository) Delete(id int, userID uuid.UUID) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&model.Comment{}).Error
}
