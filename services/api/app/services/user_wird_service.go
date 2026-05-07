package service

import (
	"errors"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserWirdService interface {
	Create(userID uuid.UUID, req *model.CreateUserWirdRequest) (*model.UserWird, error)
	List(userID uuid.UUID) ([]model.UserWird, error)
	Update(id, userID uuid.UUID, req *model.UpdateUserWirdRequest) (*model.UserWird, error)
	Delete(id, userID uuid.UUID) error
}

type userWirdService struct {
	repo repository.UserWirdRepository
}

func NewUserWirdService(repo repository.UserWirdRepository) UserWirdService {
	return &userWirdService{repo}
}

func (s *userWirdService) Create(userID uuid.UUID, req *model.CreateUserWirdRequest) (*model.UserWird, error) {
	w := &model.UserWird{
		BaseUUID:        model.BaseUUID{ID: uuid.New()},
		UserID:          userID,
		Title:           req.Title,
		Arabic:          req.Arabic,
		Transliteration: req.Transliteration,
		Translation:     req.Translation,
		Source:          req.Source,
		Count:           req.Count,
		Occasion:        req.Occasion,
		Note:            req.Note,
	}
	if w.Count <= 0 {
		w.Count = 1
	}
	return s.repo.Save(w)
}

func (s *userWirdService) List(userID uuid.UUID) ([]model.UserWird, error) {
	return s.repo.FindByUserID(userID)
}

func (s *userWirdService) Update(id, userID uuid.UUID, req *model.UpdateUserWirdRequest) (*model.UserWird, error) {
	w, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("wird not found")
		}
		return nil, err
	}
	if w.UserID != userID {
		return nil, errors.New("forbidden")
	}
	if req.Title != nil {
		w.Title = *req.Title
	}
	if req.Arabic != nil {
		w.Arabic = *req.Arabic
	}
	if req.Transliteration != nil {
		w.Transliteration = *req.Transliteration
	}
	if req.Translation != nil {
		w.Translation = *req.Translation
	}
	if req.Source != nil {
		w.Source = *req.Source
	}
	if req.Count != nil {
		w.Count = *req.Count
	}
	if req.Occasion != nil {
		w.Occasion = *req.Occasion
	}
	if req.Note != nil {
		w.Note = *req.Note
	}
	return s.repo.Update(w)
}

func (s *userWirdService) Delete(id, userID uuid.UUID) error {
	w, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("wird not found")
		}
		return err
	}
	if w.UserID != userID {
		return errors.New("forbidden")
	}
	return s.repo.DeleteByID(id, userID)
}
