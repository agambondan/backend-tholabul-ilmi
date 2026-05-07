package service

import (
	"time"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
)

type DzikirLogService interface {
	Log(userID uuid.UUID, req model.LogDzikirRequest) (*model.DzikirLog, error)
	GetToday(userID uuid.UUID) ([]model.DzikirLog, error)
	Delete(logID, userID uuid.UUID) error
}

type dzikirLogService struct {
	repo repository.DzikirLogRepository
}

func NewDzikirLogService(repo repository.DzikirLogRepository) DzikirLogService {
	return &dzikirLogService{repo}
}

func today() string {
	return time.Now().UTC().Format("2006-01-02")
}

func (s *dzikirLogService) Log(userID uuid.UUID, req model.LogDzikirRequest) (*model.DzikirLog, error) {
	date := req.LogDate
	if date == "" {
		date = today()
	}
	// idempotent: return existing log if already logged today
	existing, err := s.repo.FindByUserIDDateAndDzikirID(userID, date, req.DzikirID)
	if err == nil && existing != nil {
		return existing, nil
	}
	log := &model.DzikirLog{
		BaseUUID: model.BaseUUID{ID: uuid.New()},
		UserID:   userID,
		DzikirID: req.DzikirID,
		LogDate:  date,
		Category: model.DzikirCategory(req.Category),
	}
	return s.repo.Save(log)
}

func (s *dzikirLogService) GetToday(userID uuid.UUID) ([]model.DzikirLog, error) {
	return s.repo.FindByUserIDAndDate(userID, today())
}

func (s *dzikirLogService) Delete(logID, userID uuid.UUID) error {
	return s.repo.DeleteByID(logID, userID)
}
