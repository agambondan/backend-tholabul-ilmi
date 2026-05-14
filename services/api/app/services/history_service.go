package service

import (
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

type historyService struct{ repo repository.HistoryRepository }

func NewHistoryService(repo repository.HistoryRepository) HistoryService {
	return &historyService{repo}
}

func (s *historyService) FindAll(category string, yearFrom, yearTo, limit, offset int) ([]model.HistoryEvent, error) {
	return s.repo.FindAll(category, yearFrom, yearTo, limit, offset)
}

func (s *historyService) FindByID(id int) (*model.HistoryEvent, error) {
	return s.repo.FindByID(id)
}

func (s *historyService) FindBySlug(slug string) (*model.HistoryEvent, error) {
	return s.repo.FindBySlug(slug)
}

func (s *historyService) Create(req *model.CreateHistoryEventRequest) (*model.HistoryEvent, error) {
	return s.repo.Create(&model.HistoryEvent{
		YearHijri: req.YearHijri, YearMiladi: req.YearMiladi,
		Title: req.Title, Slug: req.Slug, Description: req.Description,
		Category: req.Category, IsSignificant: req.IsSignificant,
	})
}

func (s *historyService) Update(id int, req *model.CreateHistoryEventRequest) (*model.HistoryEvent, error) {
	return s.repo.Update(id, &model.HistoryEvent{
		YearHijri: req.YearHijri, YearMiladi: req.YearMiladi,
		Title: req.Title, Slug: req.Slug, Description: req.Description,
		Category: req.Category, IsSignificant: req.IsSignificant,
	})
}

func (s *historyService) Delete(id int) error { return s.repo.Delete(id) }
