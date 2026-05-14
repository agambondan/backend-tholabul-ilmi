package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type AsmaUlHusnaService interface {
	FindAll(limit, offset int) ([]model.AsmaUlHusna, error)
	FindByNumber(int) (*model.AsmaUlHusna, error)
}

type asmaUlHusnaService struct {
	repo  repository.AsmaUlHusnaRepository
	cache *lib.CacheService
}

func NewAsmaUlHusnaService(repo repository.AsmaUlHusnaRepository) AsmaUlHusnaService {
	return &asmaUlHusnaService{repo: repo}
}

func NewAsmaUlHusnaServiceWithCache(repo repository.AsmaUlHusnaRepository, cache *lib.CacheService) AsmaUlHusnaService {
	return &asmaUlHusnaService{repo: repo, cache: cache}
}

func (s *asmaUlHusnaService) FindAll(limit, offset int) ([]model.AsmaUlHusna, error) {
	if s.cache == nil {
		return s.repo.FindAll(limit, offset)
	}
	var result []model.AsmaUlHusna
	key := "asmaul-husna:all"
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindAll(limit, offset)
	})
	if err != nil {
		return result, err
	}
	return result, nil
}

func (s *asmaUlHusnaService) FindByNumber(number int) (*model.AsmaUlHusna, error) {
	return s.repo.FindByNumber(number)
}
