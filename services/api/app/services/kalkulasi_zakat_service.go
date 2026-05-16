package service

import (
	"errors"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type KalkulasiZakatService interface {
	Create(userID uuid.UUID, req *model.CreateKalkulasiZakatRequest) (*model.KalkulasiZakat, error)
	List(userID uuid.UUID) ([]model.KalkulasiZakat, error)
	Delete(id, userID uuid.UUID) error
}

type kalkulasiZakatService struct {
	repo repository.KalkulasiZakatRepository
}

func NewKalkulasiZakatService(repo repository.KalkulasiZakatRepository) KalkulasiZakatService {
	return &kalkulasiZakatService{repo}
}

func (s *kalkulasiZakatService) Create(userID uuid.UUID, req *model.CreateKalkulasiZakatRequest) (*model.KalkulasiZakat, error) {
	k := &model.KalkulasiZakat{
		BaseUUID:     model.BaseUUID{ID: uuid.New()},
		UserID:       userID,
		Jenis:        req.Jenis,
		NamaJenis:    req.NamaJenis,
		JumlahZakat:  req.JumlahZakat,
		NilaiHarta:   req.NilaiHarta,
		Nisab:        req.Nisab,
		Rate:         req.Rate,
		Haul:         req.Haul,
		Catatan:      req.Catatan,
		SudahDibayar: req.SudahDibayar,
		TanggalBayar: req.TanggalBayar,
	}
	return s.repo.Save(k)
}

func (s *kalkulasiZakatService) List(userID uuid.UUID) ([]model.KalkulasiZakat, error) {
	return s.repo.FindByUserID(userID)
}

func (s *kalkulasiZakatService) Delete(id, userID uuid.UUID) error {
	_, err := s.repo.FindByID(id, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("record not found")
		}
		return err
	}
	return s.repo.Delete(id, userID)
}
