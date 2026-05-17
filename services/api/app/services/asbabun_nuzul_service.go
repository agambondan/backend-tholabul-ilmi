package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type AsbabunNuzulService interface {
	FindAll(page, size int) ([]model.AsbabunNuzul, error)
	FindByAyahID(ayahID int) ([]model.AsbabunNuzul, error)
	FindBySurahNumber(surahNumber, limit, offset int) ([]model.AsbabunNuzul, error)
	ResolveAyahIDs(refs []model.AyahReference) ([]int, error)
	Create(a *model.AsbabunNuzul) (*model.AsbabunNuzul, error)
	CreateWithAyahs(a *model.AsbabunNuzul, ayahIDs []int) (*model.AsbabunNuzul, error)
	Update(id int, a *model.AsbabunNuzul) (*model.AsbabunNuzul, error)
	UpdateWithAyahs(id int, a *model.AsbabunNuzul, ayahIDs []int) (*model.AsbabunNuzul, error)
	Delete(id int) error
}

type asbabunNuzulService struct {
	repo  repository.AsbabunNuzulRepository
	cache *lib.CacheService
}

func NewAsbabunNuzulService(repo repository.AsbabunNuzulRepository) AsbabunNuzulService {
	return &asbabunNuzulService{repo: repo}
}

func NewAsbabunNuzulServiceWithCache(repo repository.AsbabunNuzulRepository, cache *lib.CacheService) AsbabunNuzulService {
	return &asbabunNuzulService{repo: repo, cache: cache}
}

func (s *asbabunNuzulService) FindAll(page, size int) ([]model.AsbabunNuzul, error) {
	if s.cache == nil {
		return s.repo.FindAll(page, size)
	}
	var result []model.AsbabunNuzul
	key := lib.CacheKey("asbabun-nuzul:all", "page", page, "size", size)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindAll(page, size)
	})
	return result, err
}

func (s *asbabunNuzulService) FindByAyahID(ayahID int) ([]model.AsbabunNuzul, error) {
	if s.cache == nil {
		return s.repo.FindByAyahID(ayahID)
	}
	var result []model.AsbabunNuzul
	key := lib.CacheKey("asbabun-nuzul:ayah", ayahID)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindByAyahID(ayahID)
	})
	return result, err
}

func (s *asbabunNuzulService) FindBySurahNumber(surahNumber, limit, offset int) ([]model.AsbabunNuzul, error) {
	if s.cache == nil {
		return s.repo.FindBySurahNumber(surahNumber, limit, offset)
	}
	var result []model.AsbabunNuzul
	key := lib.CacheKey("asbabun-nuzul:surah", surahNumber, "limit", limit, "offset", offset)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindBySurahNumber(surahNumber, limit, offset)
	})
	return result, err
}

func (s *asbabunNuzulService) ResolveAyahIDs(refs []model.AyahReference) ([]int, error) {
	return s.repo.FindAyahIDsByReferences(refs)
}

func (s *asbabunNuzulService) Create(a *model.AsbabunNuzul) (*model.AsbabunNuzul, error) {
	result, err := s.repo.Create(a)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("asbabun-nuzul:*")
	}
	return result, err
}

func (s *asbabunNuzulService) CreateWithAyahs(a *model.AsbabunNuzul, ayahIDs []int) (*model.AsbabunNuzul, error) {
	result, err := s.repo.CreateWithAyahs(a, ayahIDs)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("asbabun-nuzul:*")
	}
	return result, err
}

func (s *asbabunNuzulService) Update(id int, a *model.AsbabunNuzul) (*model.AsbabunNuzul, error) {
	result, err := s.repo.Update(id, a)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("asbabun-nuzul:*")
	}
	return result, err
}

func (s *asbabunNuzulService) UpdateWithAyahs(id int, a *model.AsbabunNuzul, ayahIDs []int) (*model.AsbabunNuzul, error) {
	result, err := s.repo.UpdateWithAyahs(id, a, ayahIDs)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("asbabun-nuzul:*")
	}
	return result, err
}

func (s *asbabunNuzulService) Delete(id int) error {
	err := s.repo.Delete(id)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("asbabun-nuzul:*")
	}
	return err
}
