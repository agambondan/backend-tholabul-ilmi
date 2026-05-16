package service

import (
	"errors"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SimpanFaraidhService interface {
	Create(userID uuid.UUID, req *model.CreateSimpanFaraidhRequest) (*model.SimpanFaraidh, error)
	List(userID uuid.UUID) ([]model.SimpanFaraidh, error)
	Delete(id, userID uuid.UUID) error
}

type simpanFaraidhService struct {
	repo repository.SimpanFaraidhRepository
}

func NewSimpanFaraidhService(repo repository.SimpanFaraidhRepository) SimpanFaraidhService {
	return &simpanFaraidhService{repo}
}

func (s *simpanFaraidhService) Create(userID uuid.UUID, req *model.CreateSimpanFaraidhRequest) (*model.SimpanFaraidh, error) {
	sf := &model.SimpanFaraidh{
		BaseUUID:      model.BaseUUID{ID: uuid.New()},
		UserID:        userID,
		Wealth:        req.Wealth,
		Debt:          req.Debt,
		Funeral:       req.Funeral,
		Will:          req.Will,
		HeirsJSON:     req.HeirsJSON,
		ResultSummary: req.ResultSummary,
		Catatan:       req.Catatan,
	}
	return s.repo.Save(sf)
}

func (s *simpanFaraidhService) List(userID uuid.UUID) ([]model.SimpanFaraidh, error) {
	return s.repo.FindByUserID(userID)
}

func (s *simpanFaraidhService) Delete(id, userID uuid.UUID) error {
	_, err := s.repo.FindByID(id, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("record not found")
		}
		return err
	}
	return s.repo.Delete(id, userID)
}
