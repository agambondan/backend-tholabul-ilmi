package service

import (
	"time"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
)

type MurojaahService interface {
	GetSession(userID uuid.UUID, count int) ([]model.Ayah, error)
	RecordSession(userID uuid.UUID, req *model.RecordMurojaahRequest) (*model.MurojaahSession, error)
	GetHistory(userID uuid.UUID, limit int) ([]model.MurojaahSession, error)
	GetStats(userID uuid.UUID) (*model.MurojaahStats, error)
}

type murojaahService struct {
	repo    repository.MurojaahRepository
	hafalan repository.HafalanRepository
}

func NewMurojaahService(repo repository.MurojaahRepository, hafalan repository.HafalanRepository) MurojaahService {
	return &murojaahService{repo, hafalan}
}

func (s *murojaahService) GetSession(userID uuid.UUID, count int) ([]model.Ayah, error) {
	surahIDs, err := s.hafalan.FindMemorizedSurahIDs(userID)
	if err != nil {
		return nil, err
	}
	if count <= 0 || count > 50 {
		count = 10
	}
	return s.repo.FindRandomAyahFromSurah(surahIDs, count)
}

func (s *murojaahService) RecordSession(userID uuid.UUID, req *model.RecordMurojaahRequest) (*model.MurojaahSession, error) {
	date := req.Date
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}
	session := &model.MurojaahSession{
		UserID:   userID,
		Date:     date,
		SurahID:  req.SurahID,
		FromAyah: req.FromAyah,
		ToAyah:   req.ToAyah,
		Score:    req.Score,
		Duration: req.Duration,
		Note:     req.Note,
	}
	return s.repo.Create(session)
}

func (s *murojaahService) GetHistory(userID uuid.UUID, limit int) ([]model.MurojaahSession, error) {
	return s.repo.FindByUserID(userID, limit)
}

func (s *murojaahService) GetStats(userID uuid.UUID) (*model.MurojaahStats, error) {
	return s.repo.Stats(userID)
}
