package service

import (
	"time"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
)

type HafalanService interface {
	Update(userID uuid.UUID, surahID int, req *model.UpdateHafalanRequest) (*model.HafalanProgress, error)
	FindByUserID(userID uuid.UUID) ([]model.HafalanProgress, error)
	Summary(userID uuid.UUID) (*model.HafalanSummary, error)
}

type hafalanService struct {
	repo repository.HafalanRepository
}

func NewHafalanService(repo repository.HafalanRepository) HafalanService {
	return &hafalanService{repo}
}

func (s *hafalanService) Update(userID uuid.UUID, surahID int, req *model.UpdateHafalanRequest) (*model.HafalanProgress, error) {
	h := &model.HafalanProgress{
		BaseUUID: model.BaseUUID{ID: uuid.New()},
		UserID:   userID,
		SurahID:  surahID,
		Status:   req.Status,
	}

	now := time.Now()
	existing, _ := s.repo.FindByUserIDAndSurahID(userID, surahID)
	if existing != nil {
		h.ID = existing.ID
		if existing.StartedAt != nil {
			h.StartedAt = existing.StartedAt
		}
	}

	if req.Status == model.HafalanInProgress && (existing == nil || existing.StartedAt == nil) {
		h.StartedAt = &now
	}
	if req.Status == model.HafalanMemorized {
		if h.StartedAt == nil {
			h.StartedAt = &now
		}
		h.CompletedAt = &now
	}

	return s.repo.Upsert(h)
}

func (s *hafalanService) FindByUserID(userID uuid.UUID) ([]model.HafalanProgress, error) {
	return s.repo.FindByUserID(userID)
}

func (s *hafalanService) Summary(userID uuid.UUID) (*model.HafalanSummary, error) {
	return s.repo.Summary(userID)
}
