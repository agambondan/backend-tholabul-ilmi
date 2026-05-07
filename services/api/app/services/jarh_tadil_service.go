package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type JarhTadilService interface {
	Create(*model.JarhTadil) (*model.JarhTadil, error)
	FindAll() ([]model.JarhTadil, error)
	FindByID(*int) (*model.JarhTadil, error)
	FindByPerawiID(*int) ([]model.JarhTadil, error)
	UpdateByID(*int, *model.JarhTadil) (*model.JarhTadil, error)
	DeleteByID(*int) error
}

type jarhTadilService struct {
	repo repository.JarhTadilRepository
}

func NewJarhTadilService(repo repository.JarhTadilRepository) JarhTadilService {
	return &jarhTadilService{repo}
}

func (s *jarhTadilService) Create(j *model.JarhTadil) (*model.JarhTadil, error) {
	return s.repo.Save(j)
}

func (s *jarhTadilService) FindAll() ([]model.JarhTadil, error) {
	return s.repo.FindAll()
}

func (s *jarhTadilService) FindByID(id *int) (*model.JarhTadil, error) {
	return s.repo.FindByID(id)
}

func (s *jarhTadilService) FindByPerawiID(perawiID *int) ([]model.JarhTadil, error) {
	return s.repo.FindByPerawiID(perawiID)
}

func (s *jarhTadilService) UpdateByID(id *int, j *model.JarhTadil) (*model.JarhTadil, error) {
	return s.repo.UpdateByID(id, j)
}

func (s *jarhTadilService) DeleteByID(id *int) error {
	return s.repo.DeleteByID(id)
}
