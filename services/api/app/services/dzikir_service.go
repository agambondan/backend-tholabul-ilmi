package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type DzikirService interface {
	FindAll(limit, offset int) ([]model.Dzikir, error)
	FindByID(id int) (*model.Dzikir, error)
	FindByCategory(category string, limit, offset int) ([]model.Dzikir, error)
	FindByOccasion(occasion string, limit, offset int) ([]model.Dzikir, error)
	Create(d *model.Dzikir) (*model.Dzikir, error)
	Update(id int, d *model.Dzikir) (*model.Dzikir, error)
	Delete(id int) error
}

type dzikirService struct {
	repo  repository.DzikirRepository
	cache *lib.CacheService
}

func NewDzikirService(repo repository.DzikirRepository) DzikirService {
	return &dzikirService{repo: repo}
}

func NewDzikirServiceWithCache(repo repository.DzikirRepository, cache *lib.CacheService) DzikirService {
	return &dzikirService{repo: repo, cache: cache}
}

func (s *dzikirService) FindAll(limit, offset int) ([]model.Dzikir, error) {
	if s.cache == nil {
		return s.repo.FindAll(limit, offset)
	}
	var result []model.Dzikir
	key := lib.CacheKey("dzikir:all", "limit", limit, "offset", offset)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindAll(limit, offset)
	})
	return result, err
}

func (s *dzikirService) FindByID(id int) (*model.Dzikir, error) {
	return s.repo.FindByID(id)
}

func (s *dzikirService) FindByCategory(category string, limit, offset int) ([]model.Dzikir, error) {
	if s.cache == nil {
		return s.repo.FindByCategory(model.DzikirCategory(category), limit, offset)
	}
	var result []model.Dzikir
	key := lib.CacheKey("dzikir:category", category, "limit", limit, "offset", offset)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindByCategory(model.DzikirCategory(category), limit, offset)
	})
	return result, err
}

func (s *dzikirService) FindByOccasion(occasion string, limit, offset int) ([]model.Dzikir, error) {
	if s.cache == nil {
		return s.repo.FindByOccasion(occasion, limit, offset)
	}
	var result []model.Dzikir
	key := lib.CacheKey("dzikir:occasion", occasion, "limit", limit, "offset", offset)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindByOccasion(occasion, limit, offset)
	})
	return result, err
}

func (s *dzikirService) Create(d *model.Dzikir) (*model.Dzikir, error) {
	result, err := s.repo.Create(d)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("dzikir:*")
	}
	return result, err
}

func (s *dzikirService) Update(id int, d *model.Dzikir) (*model.Dzikir, error) {
	result, err := s.repo.Update(id, d)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("dzikir:*")
	}
	return result, err
}

func (s *dzikirService) Delete(id int) error {
	err := s.repo.Delete(id)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("dzikir:*")
	}
	return err
}
