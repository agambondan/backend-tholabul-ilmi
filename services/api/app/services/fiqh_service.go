package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type FiqhService interface {
	FindAllCategories() ([]model.FiqhCategory, error)
	FindCategoryBySlug(slug string) (*model.FiqhCategory, error)
	FindItemBySlug(slug string) (*model.FiqhItem, error)
	FindItemByCategoryAndID(slug string, id int) (*model.FiqhItem, error)
	CreateCategory(req *model.CreateFiqhCategoryRequest) (*model.FiqhCategory, error)
	UpdateCategory(id int, req *model.CreateFiqhCategoryRequest) (*model.FiqhCategory, error)
	DeleteCategory(id int) error
	CreateItem(req *model.CreateFiqhItemRequest) (*model.FiqhItem, error)
	UpdateItem(id int, req *model.CreateFiqhItemRequest) (*model.FiqhItem, error)
	DeleteItem(id int) error
}

type fiqhService struct {
	repo repository.FiqhRepository
}

func NewFiqhService(repo repository.FiqhRepository) FiqhService {
	return &fiqhService{repo}
}

func (s *fiqhService) FindAllCategories() ([]model.FiqhCategory, error) {
	return s.repo.FindAllCategories()
}

func (s *fiqhService) FindCategoryBySlug(slug string) (*model.FiqhCategory, error) {
	return s.repo.FindCategoryBySlug(slug)
}

func (s *fiqhService) FindItemBySlug(slug string) (*model.FiqhItem, error) {
	return s.repo.FindItemBySlug(slug)
}

func (s *fiqhService) FindItemByCategoryAndID(slug string, id int) (*model.FiqhItem, error) {
	return s.repo.FindItemByCategoryAndID(slug, id)
}

func (s *fiqhService) CreateCategory(req *model.CreateFiqhCategoryRequest) (*model.FiqhCategory, error) {
	cat := &model.FiqhCategory{
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
	}
	return s.repo.CreateCategory(cat)
}

func (s *fiqhService) UpdateCategory(id int, req *model.CreateFiqhCategoryRequest) (*model.FiqhCategory, error) {
	cat := &model.FiqhCategory{
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
	}
	return s.repo.UpdateCategory(id, cat)
}

func (s *fiqhService) DeleteCategory(id int) error {
	return s.repo.DeleteCategory(id)
}

func (s *fiqhService) CreateItem(req *model.CreateFiqhItemRequest) (*model.FiqhItem, error) {
	item := &model.FiqhItem{
		CategoryID: &req.CategoryID,
		Title:      req.Title,
		Slug:       req.Slug,
		Content:    req.Content,
		Source:     req.Source,
		SortOrder:  req.SortOrder,
	}
	return s.repo.CreateItem(item)
}

func (s *fiqhService) UpdateItem(id int, req *model.CreateFiqhItemRequest) (*model.FiqhItem, error) {
	item := &model.FiqhItem{
		CategoryID: &req.CategoryID,
		Title:      req.Title,
		Slug:       req.Slug,
		Content:    req.Content,
		Source:     req.Source,
		SortOrder:  req.SortOrder,
	}
	return s.repo.UpdateItem(id, item)
}

func (s *fiqhService) DeleteItem(id int) error {
	return s.repo.DeleteItem(id)
}
