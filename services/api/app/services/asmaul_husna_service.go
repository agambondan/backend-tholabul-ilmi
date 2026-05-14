package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type AsmaUlHusnaService interface {
	FindAll(limit, offset int) ([]model.AsmaUlHusna, error)
	FindByNumber(int) (*model.AsmaUlHusna, error)
}

type asmaUlHusnaService struct {
	repo repository.AsmaUlHusnaRepository
}

func NewAsmaUlHusnaService(repo repository.AsmaUlHusnaRepository) AsmaUlHusnaService {
	return &asmaUlHusnaService{repo}
}

func (s *asmaUlHusnaService) FindAll(limit, offset int) ([]model.AsmaUlHusna, error) {
	return s.repo.FindAll(limit, offset)
}

func (s *asmaUlHusnaService) FindByNumber(number int) (*model.AsmaUlHusna, error) {
	return s.repo.FindByNumber(number)
}
