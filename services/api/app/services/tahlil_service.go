package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type TahlilService interface {
	FindAll(limit, offset int) ([]model.TahlilCollection, error)
	FindByID(id int) (*model.TahlilCollection, error)
	FindAllItems(limit, offset int) ([]model.TahlilItem, error)
	CreateItem(item *model.TahlilItem) (*model.TahlilItem, error)
	UpdateItem(id int, item *model.TahlilItem) (*model.TahlilItem, error)
	DeleteItem(id int) error
	EnsureCollection(t model.TahlilType) (*model.TahlilCollection, error)
}

type tahlilService struct {
	repo  repository.TahlilRepository
	cache *lib.CacheService
}

func NewTahlilService(repo repository.TahlilRepository) TahlilService {
	return &tahlilService{repo: repo}
}

func NewTahlilServiceWithCache(repo repository.TahlilRepository, cache *lib.CacheService) TahlilService {
	return &tahlilService{repo: repo, cache: cache}
}

func (s *tahlilService) FindAll(limit, offset int) ([]model.TahlilCollection, error) {
	if s.cache == nil {
		return s.repo.FindAll(limit, offset)
	}
	var result []model.TahlilCollection
	key := lib.CacheKey("tahlil:all", "limit", limit, "offset", offset)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindAll(limit, offset)
	})
	if err != nil {
		return result, err
	}
	return result, nil
}

func (s *tahlilService) FindByID(id int) (*model.TahlilCollection, error) {
	return s.repo.FindByID(id)
}

func (s *tahlilService) FindAllItems(limit, offset int) ([]model.TahlilItem, error) {
	if s.cache == nil {
		return s.repo.FindAllItems(limit, offset)
	}
	var result []model.TahlilItem
	key := lib.CacheKey("tahlil:items", "limit", limit, "offset", offset)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindAllItems(limit, offset)
	})
	return result, err
}

func (s *tahlilService) CreateItem(item *model.TahlilItem) (*model.TahlilItem, error) {
	result, err := s.repo.CreateItem(item)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("tahlil:*")
	}
	return result, err
}

func (s *tahlilService) UpdateItem(id int, item *model.TahlilItem) (*model.TahlilItem, error) {
	result, err := s.repo.UpdateItem(id, item)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("tahlil:*")
	}
	return result, err
}

func (s *tahlilService) DeleteItem(id int) error {
	err := s.repo.DeleteItem(id)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("tahlil:*")
	}
	return err
}

func (s *tahlilService) EnsureCollection(t model.TahlilType) (*model.TahlilCollection, error) {
	return s.repo.EnsureCollection(t)
}
