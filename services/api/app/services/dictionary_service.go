package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type DictionaryService interface {
	FindAll(category string, search string) ([]model.IslamicTerm, error)
	FindByTerm(term string) (*model.IslamicTerm, error)
	FindByCategory(category model.TermCategory) ([]model.IslamicTerm, error)
	FindByID(id int) (*model.IslamicTerm, error)
	Create(req *model.CreateIslamicTermRequest) (*model.IslamicTerm, error)
	Update(id int, req *model.CreateIslamicTermRequest) (*model.IslamicTerm, error)
	Delete(id int) error
}

type dictionaryService struct {
	repo  repository.DictionaryRepository
	cache *lib.CacheService
}

func NewDictionaryService(repo repository.DictionaryRepository) DictionaryService {
	return &dictionaryService{repo: repo}
}

func NewDictionaryServiceWithCache(repo repository.DictionaryRepository, cache *lib.CacheService) DictionaryService {
	return &dictionaryService{repo: repo, cache: cache}
}

func (s *dictionaryService) FindAll(category string, search string) ([]model.IslamicTerm, error) {
	if s.cache == nil {
		return s.repo.FindAll(category, search)
	}
	var result []model.IslamicTerm
	key := lib.CacheKey("dictionary:all", "category", category, "search", search)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindAll(category, search)
	})
	return result, err
}

func (s *dictionaryService) FindByTerm(term string) (*model.IslamicTerm, error) {
	return s.repo.FindByTerm(term)
}

func (s *dictionaryService) FindByCategory(category model.TermCategory) ([]model.IslamicTerm, error) {
	if s.cache == nil {
		return s.repo.FindByCategory(category)
	}
	var result []model.IslamicTerm
	key := lib.CacheKey("dictionary:category", category)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindByCategory(category)
	})
	return result, err
}

func (s *dictionaryService) FindByID(id int) (*model.IslamicTerm, error) {
	return s.repo.FindByID(id)
}

func (s *dictionaryService) Create(req *model.CreateIslamicTermRequest) (*model.IslamicTerm, error) {
	result, err := s.repo.Create(&model.IslamicTerm{
		Term:       req.Term,
		Category:   req.Category,
		Definition: req.Definition,
		Example:    req.Example,
		Source:     req.Source,
		Origin:     req.Origin,
	})
	if err == nil && s.cache != nil {
		s.cache.Invalidate("dictionary:*")
	}
	return result, err
}

func (s *dictionaryService) Update(id int, req *model.CreateIslamicTermRequest) (*model.IslamicTerm, error) {
	result, err := s.repo.Update(id, &model.IslamicTerm{
		Term:       req.Term,
		Category:   req.Category,
		Definition: req.Definition,
		Example:    req.Example,
		Source:     req.Source,
		Origin:     req.Origin,
	})
	if err == nil && s.cache != nil {
		s.cache.Invalidate("dictionary:*")
	}
	return result, err
}

func (s *dictionaryService) Delete(id int) error {
	err := s.repo.Delete(id)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("dictionary:*")
	}
	return err
}
