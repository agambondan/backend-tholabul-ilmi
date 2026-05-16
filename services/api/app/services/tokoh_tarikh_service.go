package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type TokohTarikhService interface {
	Create(req *model.CreateTokohTarikhRequest) (*model.TokohTarikh, error)
	FindAll(search, era, kategori string, limit, offset int) ([]model.TokohTarikh, int64, error)
	FindByID(int) (*model.TokohTarikh, error)
	Delete(int) error
}

type tokohTarikhService struct{ repo repository.TokohTarikhRepository }

func NewTokohTarikhService(repo repository.TokohTarikhRepository) TokohTarikhService {
	return &tokohTarikhService{repo}
}

func (s *tokohTarikhService) Create(req *model.CreateTokohTarikhRequest) (*model.TokohTarikh, error) {
	t := &model.TokohTarikh{
		Nama:       req.Nama,
		Era:        req.Era,
		TahunLahir: req.TahunLahir,
		TahunWafat: req.TahunWafat,
		Biografi:   req.Biografi,
		Kontribusi: req.Kontribusi,
		Kategori:   req.Kategori,
		ImageURL:   req.ImageURL,
	}
	return s.repo.Save(t)
}

func (s *tokohTarikhService) FindAll(search, era, kategori string, limit, offset int) ([]model.TokohTarikh, int64, error) {
	return s.repo.FindAll(search, era, kategori, limit, offset)
}

func (s *tokohTarikhService) FindByID(id int) (*model.TokohTarikh, error) {
	return s.repo.FindByID(id)
}

func (s *tokohTarikhService) Delete(id int) error {
	return s.repo.Delete(id)
}
