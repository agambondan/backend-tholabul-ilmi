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
	key := "tahlil:all"
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
	return s.repo.FindAllItems(limit, offset)
}

func (s *tahlilService) CreateItem(item *model.TahlilItem) (*model.TahlilItem, error) {
	return s.repo.CreateItem(item)
}

func (s *tahlilService) UpdateItem(id int, item *model.TahlilItem) (*model.TahlilItem, error) {
	return s.repo.UpdateItem(id, item)
}

func (s *tahlilService) DeleteItem(id int) error {
	return s.repo.DeleteItem(id)
}

func (s *tahlilService) EnsureCollection(t model.TahlilType) (*model.TahlilCollection, error) {
	return s.repo.EnsureCollection(t)
}
