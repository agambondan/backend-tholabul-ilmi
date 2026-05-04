package service

import (
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

type dictionaryService struct{ repo repository.DictionaryRepository }

func NewDictionaryService(repo repository.DictionaryRepository) DictionaryService {
	return &dictionaryService{repo}
}

func (s *dictionaryService) FindAll(category string, search string) ([]model.IslamicTerm, error) {
	return s.repo.FindAll(category, search)
}

func (s *dictionaryService) FindByTerm(term string) (*model.IslamicTerm, error) {
	return s.repo.FindByTerm(term)
}

func (s *dictionaryService) FindByCategory(category model.TermCategory) ([]model.IslamicTerm, error) {
	return s.repo.FindByCategory(category)
}

func (s *dictionaryService) FindByID(id int) (*model.IslamicTerm, error) {
	return s.repo.FindByID(id)
}

func (s *dictionaryService) Create(req *model.CreateIslamicTermRequest) (*model.IslamicTerm, error) {
	return s.repo.Create(&model.IslamicTerm{
		Term:       req.Term,
		Category:   req.Category,
		Definition: req.Definition,
		Example:    req.Example,
		Source:     req.Source,
		Origin:     req.Origin,
	})
}

func (s *dictionaryService) Update(id int, req *model.CreateIslamicTermRequest) (*model.IslamicTerm, error) {
	return s.repo.Update(id, &model.IslamicTerm{
		Term:       req.Term,
		Category:   req.Category,
		Definition: req.Definition,
		Example:    req.Example,
		Source:     req.Source,
		Origin:     req.Origin,
	})
}

func (s *dictionaryService) Delete(id int) error { return s.repo.Delete(id) }
