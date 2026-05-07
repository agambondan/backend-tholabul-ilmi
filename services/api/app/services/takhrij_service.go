package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type TakhrijService interface {
	Create(*model.Takhrij) (*model.Takhrij, error)
	FindAll() ([]model.Takhrij, error)
	FindByID(*int) (*model.Takhrij, error)
	FindByHadithID(*int) ([]model.Takhrij, error)
	UpdateByID(*int, *model.Takhrij) (*model.Takhrij, error)
	DeleteByID(*int) error
}

type takhrijService struct {
	repo repository.TakhrijRepository
}

func NewTakhrijService(repo repository.TakhrijRepository) TakhrijService {
	return &takhrijService{repo}
}

func (s *takhrijService) Create(t *model.Takhrij) (*model.Takhrij, error) {
	return s.repo.Save(t)
}

func (s *takhrijService) FindAll() ([]model.Takhrij, error) {
	return s.repo.FindAll()
}

func (s *takhrijService) FindByID(id *int) (*model.Takhrij, error) {
	return s.repo.FindByID(id)
}

func (s *takhrijService) FindByHadithID(hadithID *int) ([]model.Takhrij, error) {
	return s.repo.FindByHadithID(hadithID)
}

func (s *takhrijService) UpdateByID(id *int, t *model.Takhrij) (*model.Takhrij, error) {
	return s.repo.UpdateByID(id, t)
}

func (s *takhrijService) DeleteByID(id *int) error {
	return s.repo.DeleteByID(id)
}
