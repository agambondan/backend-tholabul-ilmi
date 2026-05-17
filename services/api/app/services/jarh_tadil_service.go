package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type JarhTadilService interface {
	Create(*model.JarhTadil) (*model.JarhTadil, error)
	FindAll(limit, offset int) ([]model.JarhTadil, error)
	FindByID(*int) (*model.JarhTadil, error)
	FindByPerawiID(*int) ([]model.JarhTadil, error)
	UpdateByID(*int, *model.JarhTadil) (*model.JarhTadil, error)
	DeleteByID(*int) error
}

type jarhTadilService struct {
	repo  repository.JarhTadilRepository
	cache *lib.CacheService
}

func NewJarhTadilService(repo repository.JarhTadilRepository) JarhTadilService {
	return &jarhTadilService{repo: repo}
}

func NewJarhTadilServiceWithCache(repo repository.JarhTadilRepository, cache *lib.CacheService) JarhTadilService {
	return &jarhTadilService{repo: repo, cache: cache}
}

func (s *jarhTadilService) Create(j *model.JarhTadil) (*model.JarhTadil, error) {
	result, err := s.repo.Save(j)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("jarh-tadil:*")
	}
	return result, err
}

func (s *jarhTadilService) FindAll(limit, offset int) ([]model.JarhTadil, error) {
	if s.cache == nil {
		return s.repo.FindAll(limit, offset)
	}
	var result []model.JarhTadil
	key := lib.CacheKey("jarh-tadil:all", "limit", limit, "offset", offset)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindAll(limit, offset)
	})
	return result, err
}

func (s *jarhTadilService) FindByID(id *int) (*model.JarhTadil, error) {
	if s.cache == nil || id == nil {
		return s.repo.FindByID(id)
	}
	var result *model.JarhTadil
	key := lib.CacheKey("jarh-tadil:id", *id)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindByID(id)
	})
	return result, err
}

func (s *jarhTadilService) FindByPerawiID(perawiID *int) ([]model.JarhTadil, error) {
	if s.cache == nil || perawiID == nil {
		return s.repo.FindByPerawiID(perawiID)
	}
	var result []model.JarhTadil
	key := lib.CacheKey("jarh-tadil:perawi", *perawiID)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindByPerawiID(perawiID)
	})
	return result, err
}

func (s *jarhTadilService) UpdateByID(id *int, j *model.JarhTadil) (*model.JarhTadil, error) {
	result, err := s.repo.UpdateByID(id, j)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("jarh-tadil:*")
	}
	return result, err
}

func (s *jarhTadilService) DeleteByID(id *int) error {
	err := s.repo.DeleteByID(id)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("jarh-tadil:*")
	}
	return err
}
