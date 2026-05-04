package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
)

type TilawahService interface {
	Add(userID uuid.UUID, req *model.CreateTilawahRequest) (*model.TilawahLog, error)
	FindAll(userID uuid.UUID, from, to string) ([]model.TilawahLog, error)
	Summary(userID uuid.UUID) (*model.TilawahSummary, error)
	Delete(id int, userID uuid.UUID) error
}

type tilawahService struct {
	repo repository.TilawahRepository
}

func NewTilawahService(repo repository.TilawahRepository) TilawahService {
	return &tilawahService{repo}
}

func (s *tilawahService) Add(userID uuid.UUID, req *model.CreateTilawahRequest) (*model.TilawahLog, error) {
	return s.repo.Create(userID, req)
}

func (s *tilawahService) FindAll(userID uuid.UUID, from, to string) ([]model.TilawahLog, error) {
	if from != "" && to != "" {
		return s.repo.FindByUserIDAndDateRange(userID, from, to)
	}
	return s.repo.FindByUserID(userID)
}

func (s *tilawahService) Summary(userID uuid.UUID) (*model.TilawahSummary, error) {
	return s.repo.Summary(userID)
}

func (s *tilawahService) Delete(id int, userID uuid.UUID) error {
	return s.repo.DeleteByID(id, userID)
}
