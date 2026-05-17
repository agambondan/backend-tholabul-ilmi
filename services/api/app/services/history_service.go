package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type HistoryService interface {
	FindAll(category string, yearFrom, yearTo, limit, offset int) ([]model.HistoryEvent, error)
	FindByID(id int) (*model.HistoryEvent, error)
	FindBySlug(slug string) (*model.HistoryEvent, error)
	Create(req *model.CreateHistoryEventRequest) (*model.HistoryEvent, error)
	Update(id int, req *model.CreateHistoryEventRequest) (*model.HistoryEvent, error)
	Delete(id int) error
}

type historyService struct {
	repo  repository.HistoryRepository
	cache *lib.CacheService
}

func NewHistoryService(repo repository.HistoryRepository) HistoryService {
	return &historyService{repo: repo}
}

func NewHistoryServiceWithCache(repo repository.HistoryRepository, cache *lib.CacheService) HistoryService {
	return &historyService{repo: repo, cache: cache}
}

func (s *historyService) FindAll(category string, yearFrom, yearTo, limit, offset int) ([]model.HistoryEvent, error) {
	if s.cache == nil {
		return s.repo.FindAll(category, yearFrom, yearTo, limit, offset)
	}
	var result []model.HistoryEvent
	key := lib.CacheKey("history:all", "category", category, "yearFrom", yearFrom, "yearTo", yearTo, "limit", limit, "offset", offset)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindAll(category, yearFrom, yearTo, limit, offset)
	})
	return result, err
}

func (s *historyService) FindByID(id int) (*model.HistoryEvent, error) {
	if s.cache == nil {
		return s.repo.FindByID(id)
	}
	var result *model.HistoryEvent
	key := lib.CacheKey("history:id", id)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindByID(id)
	})
	return result, err
}

func (s *historyService) FindBySlug(slug string) (*model.HistoryEvent, error) {
	if s.cache == nil {
		return s.repo.FindBySlug(slug)
	}
	var result *model.HistoryEvent
	key := lib.CacheKey("history:slug", slug)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindBySlug(slug)
	})
	return result, err
}

func (s *historyService) Create(req *model.CreateHistoryEventRequest) (*model.HistoryEvent, error) {
	result, err := s.repo.Create(&model.HistoryEvent{
		YearHijri: req.YearHijri, YearMiladi: req.YearMiladi,
		Title: req.Title, Slug: req.Slug, Description: req.Description,
		Category: req.Category, IsSignificant: req.IsSignificant,
	})
	if err == nil && s.cache != nil {
		s.cache.Invalidate("history:*")
	}
	return result, err
}

func (s *historyService) Update(id int, req *model.CreateHistoryEventRequest) (*model.HistoryEvent, error) {
	result, err := s.repo.Update(id, &model.HistoryEvent{
		YearHijri: req.YearHijri, YearMiladi: req.YearMiladi,
		Title: req.Title, Slug: req.Slug, Description: req.Description,
		Category: req.Category, IsSignificant: req.IsSignificant,
	})
	if err == nil && s.cache != nil {
		s.cache.Invalidate("history:*")
	}
	return result, err
}

func (s *historyService) Delete(id int) error {
	err := s.repo.Delete(id)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("history:*")
	}
	return err
}
