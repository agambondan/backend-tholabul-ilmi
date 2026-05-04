package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type DzikirService interface {
	FindAll() ([]model.Dzikir, error)
	FindByID(id int) (*model.Dzikir, error)
	FindByCategory(category string) ([]model.Dzikir, error)
	FindByOccasion(occasion string) ([]model.Dzikir, error)
}

type dzikirService struct {
	repo repository.DzikirRepository
}

func NewDzikirService(repo repository.DzikirRepository) DzikirService {
	return &dzikirService{repo}
}

func (s *dzikirService) FindAll() ([]model.Dzikir, error) {
	return s.repo.FindAll()
}

func (s *dzikirService) FindByID(id int) (*model.Dzikir, error) {
	return s.repo.FindByID(id)
}

func (s *dzikirService) FindByCategory(category string) ([]model.Dzikir, error) {
	return s.repo.FindByCategory(model.DzikirCategory(category))
}

func (s *dzikirService) FindByOccasion(occasion string) ([]model.Dzikir, error) {
	return s.repo.FindByOccasion(occasion)
}
