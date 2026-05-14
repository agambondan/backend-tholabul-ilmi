package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type ManasikService interface {
	FindAll(limit, offset int) ([]model.ManasikStep, error)
	FindByType(t model.ManasikType, limit, offset int) ([]model.ManasikStep, error)
	FindByTypeAndStep(t model.ManasikType, step int) (*model.ManasikStep, error)
	Create(step *model.ManasikStep) (*model.ManasikStep, error)
	Update(id int, step *model.ManasikStep) (*model.ManasikStep, error)
	Delete(id int) error
}

type manasikService struct {
	repo  repository.ManasikRepository
	cache *lib.CacheService
}

func NewManasikService(repo repository.ManasikRepository) ManasikService {
	return &manasikService{repo: repo}
}

func NewManasikServiceWithCache(repo repository.ManasikRepository, cache *lib.CacheService) ManasikService {
	return &manasikService{repo: repo, cache: cache}
}

func (s *manasikService) FindAll(limit, offset int) ([]model.ManasikStep, error) {
	if s.cache == nil {
		return s.repo.FindAll(limit, offset)
	}
	var result []model.ManasikStep
	key := "manasik:all"
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindAll(limit, offset)
	})
	return result, err
}

func (s *manasikService) FindByType(t model.ManasikType, limit, offset int) ([]model.ManasikStep, error) {
	return s.repo.FindByType(t, limit, offset)
}

func (s *manasikService) FindByTypeAndStep(t model.ManasikType, step int) (*model.ManasikStep, error) {
	return s.repo.FindByTypeAndStep(t, step)
}

func (s *manasikService) Create(step *model.ManasikStep) (*model.ManasikStep, error) {
	return s.repo.Create(step)
}

func (s *manasikService) Update(id int, step *model.ManasikStep) (*model.ManasikStep, error) {
	return s.repo.Update(id, step)
}

func (s *manasikService) Delete(id int) error {
	return s.repo.Delete(id)
}
