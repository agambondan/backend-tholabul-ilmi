package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type TahlilService interface {
	FindAll() ([]model.TahlilCollection, error)
	FindByID(id int) (*model.TahlilCollection, error)
	FindAllItems() ([]model.TahlilItem, error)
	CreateItem(item *model.TahlilItem) (*model.TahlilItem, error)
	UpdateItem(id int, item *model.TahlilItem) (*model.TahlilItem, error)
	DeleteItem(id int) error
	EnsureCollection(t model.TahlilType) (*model.TahlilCollection, error)
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

func (s *tahlilService) FindAllItems() ([]model.TahlilItem, error) {
	return s.repo.FindAllItems()
}

func (s *tahlilService) CreateItem(item *model.TahlilItem) (*model.TahlilItem, error) {
	return s.repo.CreateItem(item)
}

func (s *tahlilService) UpdateItem(id int, item *model.TahlilItem) (*model.TahlilItem, error) {
	return s.repo.UpdateItem(id, item)
}

func (s *tahlilService) DeleteItem(id int) error {
	return s.repo.DeleteItem(id)
}

func (s *tahlilService) EnsureCollection(t model.TahlilType) (*model.TahlilCollection, error) {
	return s.repo.EnsureCollection(t)
}
