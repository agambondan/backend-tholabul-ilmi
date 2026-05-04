package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type TahlilService interface {
	FindAll() ([]model.TahlilCollection, error)
	FindByID(id int) (*model.TahlilCollection, error)
}

type tahlilService struct {
	repo repository.TahlilRepository
}

func NewTahlilService(repo repository.TahlilRepository) TahlilService {
	return &tahlilService{repo}
}

func (s *tahlilService) FindAll() ([]model.TahlilCollection, error) {
	return s.repo.FindAll()
}

func (s *tahlilService) FindByID(id int) (*model.TahlilCollection, error) {
	return s.repo.FindByID(id)
}
