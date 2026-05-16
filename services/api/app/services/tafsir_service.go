package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type TafsirService interface {
	FindByAyahID(int) (*model.Tafsir, error)
	FindBySurahNumber(int, int, int) ([]model.Tafsir, error)
	Search(string, int, int) ([]model.Tafsir, error)
	Save(*model.Tafsir) (*model.Tafsir, error)
	UpdateByAyahID(int, *model.Tafsir) (*model.Tafsir, error)
}

type tafsirService struct {
	repo  repository.TafsirRepository
	cache *lib.CacheService
}

func NewTafsirService(repo repository.TafsirRepository) TafsirService {
	return &tafsirService{repo: repo}
}

func NewTafsirServiceWithCache(repo repository.TafsirRepository, cache *lib.CacheService) TafsirService {
	return &tafsirService{repo: repo, cache: cache}
}

func (s *tafsirService) FindByAyahID(ayahID int) (*model.Tafsir, error) {
	return s.repo.FindByAyahID(ayahID)
}

func (s *tafsirService) FindBySurahNumber(surahNumber, limit, offset int) ([]model.Tafsir, error) {
	if s.cache == nil {
		return s.repo.FindBySurahNumber(surahNumber, limit, offset)
	}
	var result []model.Tafsir
	key := "tafsir:all"
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindBySurahNumber(surahNumber, limit, offset)
	})
	if err != nil {
		return result, err
	}
	return result, nil
}

func (s *tafsirService) Save(t *model.Tafsir) (*model.Tafsir, error) {
	result, err := s.repo.Save(t)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("tafsir:*")
	}
	return result, err
}

func (s *tafsirService) UpdateByAyahID(ayahID int, t *model.Tafsir) (*model.Tafsir, error) {
	result, err := s.repo.UpdateByAyahID(ayahID, t)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("tafsir:*")
	}
	return result, err
}

func (s *tafsirService) Search(query string, limit, offset int) ([]model.Tafsir, error) {
	return s.repo.Search(query, limit, offset)
}
