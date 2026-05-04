package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type DoaService interface {
	FindAll() ([]model.Doa, error)
	FindByID(int) (*model.Doa, error)
	FindByCategory(model.DoaCategory) ([]model.Doa, error)
}

type doaService struct {
	repo repository.DoaRepository
}

func NewDoaService(repo repository.DoaRepository) DoaService {
	return &doaService{repo}
}

func (s *doaService) FindAll() ([]model.Doa, error) {
	return s.repo.FindAll()
}

func (s *doaService) FindByID(id int) (*model.Doa, error) {
	return s.repo.FindByID(id)
}

func (s *doaService) FindByCategory(category model.DoaCategory) ([]model.Doa, error) {
	return s.repo.FindByCategory(category)
}
