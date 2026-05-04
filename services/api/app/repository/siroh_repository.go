package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
	"gorm.io/gorm"
)

type SirohRepository interface {
	FindAllCategories() ([]model.SirohCategory, error)
	FindCategoryBySlug(string) (*model.SirohCategory, error)
	FindContentBySlug(string) (*model.SirohContent, error)
	FindContentsByCategoryID(int) ([]model.SirohContent, error)
	FindAllContents(*fiber.Ctx) *paginate.Page
	SaveCategory(*model.SirohCategory) (*model.SirohCategory, error)
	SaveContent(*model.SirohContent) (*model.SirohContent, error)
	UpdateCategory(int, *model.SirohCategory) (*model.SirohCategory, error)
	UpdateContent(int, *model.SirohContent) (*model.SirohContent, error)
	DeleteCategory(int) error
	DeleteContent(int) error
}

type sirohRepo struct {
	db *gorm.DB
	pg *paginate.Pagination
}

func NewSirohRepository(db *gorm.DB, pg *paginate.Pagination) SirohRepository {
	return &sirohRepo{db, pg}
}

func (r *sirohRepo) FindAllCategories() ([]model.SirohCategory, error) {
	var list []model.SirohCategory
	err := r.db.Order("\"order\" asc, id asc").Find(&list).Error
	return list, err
}

func (r *sirohRepo) FindCategoryBySlug(slug string) (*model.SirohCategory, error) {
	var c model.SirohCategory
	err := r.db.Preload("Contents").Where("slug = ?", slug).First(&c).Error
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *sirohRepo) FindContentBySlug(slug string) (*model.SirohContent, error) {
	var c model.SirohContent
	err := r.db.Preload("Category").Where("slug = ?", slug).First(&c).Error
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *sirohRepo) FindContentsByCategoryID(categoryID int) ([]model.SirohContent, error) {
	var list []model.SirohContent
	err := r.db.Where("category_id = ?", categoryID).Order("\"order\" asc, id asc").Limit(200).Find(&list).Error
	return list, err
}

func (r *sirohRepo) FindAllContents(ctx *fiber.Ctx) *paginate.Page {
	var list []model.SirohContent
	mod := r.db.Model(&model.SirohContent{}).Preload("Category").Order("category_id, \"order\" asc")
	page := r.pg.With(mod).Request(ctx.Request()).Response(&list)
	return &page
}

func (r *sirohRepo) SaveCategory(c *model.SirohCategory) (*model.SirohCategory, error) {
	if err := r.db.Create(c).Error; err != nil {
		return nil, err
	}
	return c, nil
}

func (r *sirohRepo) SaveContent(c *model.SirohContent) (*model.SirohContent, error) {
	if err := r.db.Create(c).Error; err != nil {
		return nil, err
	}
	return c, nil
}

func (r *sirohRepo) UpdateCategory(id int, c *model.SirohCategory) (*model.SirohCategory, error) {
	if err := r.db.Model(&model.SirohCategory{}).Where("id = ?", id).Updates(c).Error; err != nil {
		return nil, err
	}
	var updated model.SirohCategory
	r.db.First(&updated, id)
	return &updated, nil
}

func (r *sirohRepo) UpdateContent(id int, c *model.SirohContent) (*model.SirohContent, error) {
	if err := r.db.Model(&model.SirohContent{}).Where("id = ?", id).Updates(c).Error; err != nil {
		return nil, err
	}
	var updated model.SirohContent
	r.db.Preload("Category").First(&updated, id)
	return &updated, nil
}

func (r *sirohRepo) DeleteCategory(id int) error {
	return r.db.Delete(&model.SirohCategory{}, id).Error
}

func (r *sirohRepo) DeleteContent(id int) error {
	return r.db.Delete(&model.SirohContent{}, id).Error
}
