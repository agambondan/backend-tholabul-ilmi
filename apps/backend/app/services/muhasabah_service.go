package service

import (
	"time"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
)

type MuhasabahService interface {
	Create(userID uuid.UUID, req *model.CreateMuhasabahRequest) (*model.Muhasabah, error)
	FindAll(userID uuid.UUID, limit, offset int) ([]model.Muhasabah, error)
	FindByID(id int, userID uuid.UUID) (*model.Muhasabah, error)
	Update(id int, userID uuid.UUID, req *model.UpdateMuhasabahRequest) (*model.Muhasabah, error)
	Delete(id int, userID uuid.UUID) error
}

type muhasabahService struct {
	repo repository.MuhasabahRepository
}

func NewMuhasabahService(repo repository.MuhasabahRepository) MuhasabahService {
	return &muhasabahService{repo}
}

func (s *muhasabahService) Create(userID uuid.UUID, req *model.CreateMuhasabahRequest) (*model.Muhasabah, error) {
	date := req.Date
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}
	moodScore := req.MoodScore
	if moodScore == 0 {
		moodScore = 3
	}
	m := &model.Muhasabah{
		UserID:    userID,
		Date:      date,
		Content:   req.Content,
		MoodScore: moodScore,
		IsPrivate: req.IsPrivate,
	}
	return s.repo.Create(m)
}

func (s *muhasabahService) FindAll(userID uuid.UUID, limit, offset int) ([]model.Muhasabah, error) {
	if limit <= 0 {
		limit = 20
	}
	return s.repo.FindByUserID(userID, limit, offset)
}

func (s *muhasabahService) FindByID(id int, userID uuid.UUID) (*model.Muhasabah, error) {
	return s.repo.FindByID(id, userID)
}

func (s *muhasabahService) Update(id int, userID uuid.UUID, req *model.UpdateMuhasabahRequest) (*model.Muhasabah, error) {
	m := &model.Muhasabah{
		Content:   req.Content,
		MoodScore: req.MoodScore,
	}
	if req.IsPrivate != nil {
		m.IsPrivate = *req.IsPrivate
	}
	return s.repo.Update(id, userID, m)
}

func (s *muhasabahService) Delete(id int, userID uuid.UUID) error {
	return s.repo.Delete(id, userID)
}
