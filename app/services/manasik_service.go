package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type ManasikService interface {
	FindByType(t model.ManasikType) ([]model.ManasikStep, error)
	FindByTypeAndStep(t model.ManasikType, step int) (*model.ManasikStep, error)
}

type manasikService struct{ repo repository.ManasikRepository }

func NewManasikService(repo repository.ManasikRepository) ManasikService {
	return &manasikService{repo}
}

func (s *manasikService) FindByType(t model.ManasikType) ([]model.ManasikStep, error) {
	return s.repo.FindByType(t)
}

func (s *manasikService) FindByTypeAndStep(t model.ManasikType, step int) (*model.ManasikStep, error) {
	return s.repo.FindByTypeAndStep(t, step)
}
