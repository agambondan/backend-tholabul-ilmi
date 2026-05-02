package service

import (
	"time"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
)

type ReadingProgressService interface {
	UpdateQuran(userID uuid.UUID, req *model.UpdateQuranProgressRequest) (*model.ReadingProgress, error)
	UpdateHadith(userID uuid.UUID, req *model.UpdateHadithProgressRequest) (*model.ReadingProgress, error)
	GetQuran(userID uuid.UUID) (*model.ReadingProgress, error)
	GetHadith(userID uuid.UUID) (*model.ReadingProgress, error)
	GetAll(userID uuid.UUID) ([]model.ReadingProgress, error)
}

type readingProgressService struct {
	repo     repository.ReadingProgressRepository
	activity repository.UserActivityRepository
}

func NewReadingProgressService(repo repository.ReadingProgressRepository, activity repository.UserActivityRepository) ReadingProgressService {
	return &readingProgressService{repo, activity}
}

func (s *readingProgressService) UpdateQuran(userID uuid.UUID, req *model.UpdateQuranProgressRequest) (*model.ReadingProgress, error) {
	now := time.Now()
	p := &model.ReadingProgress{
		BaseUUID:    model.BaseUUID{ID: uuid.New()},
		UserID:      userID,
		ContentType: model.ProgressQuran,
		SurahNumber: &req.SurahNumber,
		AyahNumber:  &req.AyahNumber,
		AyahID:      &req.AyahID,
		LastReadAt:  &now,
	}
	result, err := s.repo.Upsert(p)
	if err != nil {
		return nil, err
	}
	_ = s.activity.Record(userID, model.ActivityQuran)
	return result, nil
}

func (s *readingProgressService) UpdateHadith(userID uuid.UUID, req *model.UpdateHadithProgressRequest) (*model.ReadingProgress, error) {
	now := time.Now()
	p := &model.ReadingProgress{
		BaseUUID:    model.BaseUUID{ID: uuid.New()},
		UserID:      userID,
		ContentType: model.ProgressHadith,
		BookSlug:    &req.BookSlug,
		HadithID:    &req.HadithID,
		LastReadAt:  &now,
	}
	result, err := s.repo.Upsert(p)
	if err != nil {
		return nil, err
	}
	_ = s.activity.Record(userID, model.ActivityHadith)
	return result, nil
}

func (s *readingProgressService) GetQuran(userID uuid.UUID) (*model.ReadingProgress, error) {
	return s.repo.FindByUserIDAndType(userID, model.ProgressQuran)
}

func (s *readingProgressService) GetHadith(userID uuid.UUID) (*model.ReadingProgress, error) {
	return s.repo.FindByUserIDAndType(userID, model.ProgressHadith)
}

func (s *readingProgressService) GetAll(userID uuid.UUID) ([]model.ReadingProgress, error) {
	return s.repo.FindAllByUserID(userID)
}
