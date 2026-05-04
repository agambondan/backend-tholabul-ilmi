package service

import (
	"time"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
)

type AmalanService interface {
	FindAllItems() ([]model.AmalanItem, error)
	GetTodayStatus(userID uuid.UUID) ([]model.AmalanWithStatus, error)
	Toggle(userID uuid.UUID, amalanItemID int, isDone bool) error
	GetHistory(userID uuid.UUID, from, to string) ([]model.AmalanLog, error)
}

type amalanService struct {
	repo repository.AmalanRepository
}

func NewAmalanService(repo repository.AmalanRepository) AmalanService {
	return &amalanService{repo}
}

func (s *amalanService) FindAllItems() ([]model.AmalanItem, error) {
	return s.repo.FindAllItems()
}

func (s *amalanService) GetTodayStatus(userID uuid.UUID) ([]model.AmalanWithStatus, error) {
	today := time.Now().Format("2006-01-02")
	return s.repo.FindTodayStatus(userID, today)
}

func (s *amalanService) Toggle(userID uuid.UUID, amalanItemID int, isDone bool) error {
	today := time.Now().Format("2006-01-02")
	return s.repo.ToggleLog(userID, amalanItemID, today, isDone)
}

func (s *amalanService) GetHistory(userID uuid.UUID, from, to string) ([]model.AmalanLog, error) {
	if from == "" {
		from = time.Now().AddDate(0, -1, 0).Format("2006-01-02")
	}
	if to == "" {
		to = time.Now().Format("2006-01-02")
	}
	return s.repo.FindHistory(userID, from, to)
}
