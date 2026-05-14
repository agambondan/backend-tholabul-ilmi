package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type FiqhService interface {
	FindAllCategories(limit, offset int) ([]model.FiqhCategory, error)
	FindAllItems(limit, offset int) ([]model.FiqhItem, error)
	FindCategoryBySlug(slug string, limit, offset int) (*model.FiqhCategory, error)
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
	repo  repository.FiqhRepository
	cache *lib.CacheService
}

func NewFiqhService(repo repository.FiqhRepository) FiqhService {
	return &fiqhService{repo: repo}
}

func NewFiqhServiceWithCache(repo repository.FiqhRepository, cache *lib.CacheService) FiqhService {
	return &fiqhService{repo: repo, cache: cache}
}

func (s *fiqhService) FindAllCategories(limit, offset int) ([]model.FiqhCategory, error) {
	return s.repo.FindAllCategories(limit, offset)
}

func (s *fiqhService) FindAllItems(limit, offset int) ([]model.FiqhItem, error) {
	if s.cache == nil {
		return s.repo.FindAllItems(limit, offset)
	}
	var result []model.FiqhItem
	key := "fiqh:all"
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindAllItems(limit, offset)
	})
	return result, err
}

func (s *fiqhService) FindCategoryBySlug(slug string, limit, offset int) (*model.FiqhCategory, error) {
	return s.repo.FindCategoryBySlug(slug, limit, offset)
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
	result, err := s.repo.CreateCategory(cat)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("fiqh:*")
	}
	return result, err
}

func (s *fiqhService) UpdateCategory(id int, req *model.CreateFiqhCategoryRequest) (*model.FiqhCategory, error) {
	cat := &model.FiqhCategory{
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
	}
	result, err := s.repo.UpdateCategory(id, cat)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("fiqh:*")
	}
	return result, err
}

func (s *fiqhService) DeleteCategory(id int) error {
	err := s.repo.DeleteCategory(id)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("fiqh:*")
	}
	return err
}

func (s *fiqhService) CreateItem(req *model.CreateFiqhItemRequest) (*model.FiqhItem, error) {
	item := &model.FiqhItem{
		CategoryID: &req.CategoryID,
		Title:      req.Title,
		Slug:       req.Slug,
		Content:    req.Content,
		Source:     req.Source,
		Dalil:      req.Dalil,
		SortOrder:  req.SortOrder,
	}
	result, err := s.repo.CreateItem(item)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("fiqh:*")
	}
	return result, err
}

func (s *fiqhService) UpdateItem(id int, req *model.CreateFiqhItemRequest) (*model.FiqhItem, error) {
	item := &model.FiqhItem{
		CategoryID: &req.CategoryID,
		Title:      req.Title,
		Slug:       req.Slug,
		Content:    req.Content,
		Source:     req.Source,
		Dalil:      req.Dalil,
		SortOrder:  req.SortOrder,
	}
	result, err := s.repo.UpdateItem(id, item)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("fiqh:*")
	}
	return result, err
}

func (s *fiqhService) DeleteItem(id int) error {
	err := s.repo.DeleteItem(id)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("fiqh:*")
	}
	return err
}
