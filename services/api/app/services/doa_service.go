package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type DoaService interface {
	FindAll(limit, offset int) ([]model.Doa, error)
	FindByID(int) (*model.Doa, error)
	FindByCategory(model.DoaCategory, int, int) ([]model.Doa, error)
}

type doaService struct {
	repo  repository.DoaRepository
	cache *lib.CacheService
}

func NewDoaService(repo repository.DoaRepository) DoaService {
	return &doaService{repo: repo}
}

func NewDoaServiceWithCache(repo repository.DoaRepository, cache *lib.CacheService) DoaService {
	return &doaService{repo: repo, cache: cache}
}

func (s *doaService) FindAll(limit, offset int) ([]model.Doa, error) {
	if s.cache == nil {
		return s.repo.FindAll(limit, offset)
	}
	var result []model.Doa
	key := "doa:all"
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindAll(limit, offset)
	})
	return result, err
}

func (s *doaService) FindByID(id int) (*model.Doa, error) {
	return s.repo.FindByID(id)
}

func (s *doaService) FindByCategory(category model.DoaCategory, limit, offset int) ([]model.Doa, error) {
	return s.repo.FindByCategory(category, limit, offset)
}
