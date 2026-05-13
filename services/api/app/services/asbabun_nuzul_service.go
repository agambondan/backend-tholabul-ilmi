package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type AsbabunNuzulService interface {
	FindAll(page, size int) ([]model.AsbabunNuzul, error)
	FindByAyahID(ayahID int) ([]model.AsbabunNuzul, error)
	FindBySurahNumber(surahNumber int) ([]model.AsbabunNuzul, error)
	ResolveAyahIDs(refs []model.AyahReference) ([]int, error)
	Create(a *model.AsbabunNuzul) (*model.AsbabunNuzul, error)
	CreateWithAyahs(a *model.AsbabunNuzul, ayahIDs []int) (*model.AsbabunNuzul, error)
	Update(id int, a *model.AsbabunNuzul) (*model.AsbabunNuzul, error)
	UpdateWithAyahs(id int, a *model.AsbabunNuzul, ayahIDs []int) (*model.AsbabunNuzul, error)
	Delete(id int) error
}

type asbabunNuzulService struct {
	repo repository.AsbabunNuzulRepository
}

func NewAsbabunNuzulService(repo repository.AsbabunNuzulRepository) AsbabunNuzulService {
	return &asbabunNuzulService{repo}
}

func (s *asbabunNuzulService) FindAll(page, size int) ([]model.AsbabunNuzul, error) {
	return s.repo.FindAll(page, size)
}

func (s *asbabunNuzulService) FindByAyahID(ayahID int) ([]model.AsbabunNuzul, error) {
	return s.repo.FindByAyahID(ayahID)
}

func (s *asbabunNuzulService) FindBySurahNumber(surahNumber int) ([]model.AsbabunNuzul, error) {
	return s.repo.FindBySurahNumber(surahNumber)
}

func (s *asbabunNuzulService) ResolveAyahIDs(refs []model.AyahReference) ([]int, error) {
	return s.repo.FindAyahIDsByReferences(refs)
}

func (s *asbabunNuzulService) Create(a *model.AsbabunNuzul) (*model.AsbabunNuzul, error) {
	return s.repo.Create(a)
}

func (s *asbabunNuzulService) CreateWithAyahs(a *model.AsbabunNuzul, ayahIDs []int) (*model.AsbabunNuzul, error) {
	return s.repo.CreateWithAyahs(a, ayahIDs)
}

func (s *asbabunNuzulService) Update(id int, a *model.AsbabunNuzul) (*model.AsbabunNuzul, error) {
	return s.repo.Update(id, a)
}

func (s *asbabunNuzulService) UpdateWithAyahs(id int, a *model.AsbabunNuzul, ayahIDs []int) (*model.AsbabunNuzul, error) {
	return s.repo.UpdateWithAyahs(id, a, ayahIDs)
}

func (s *asbabunNuzulService) Delete(id int) error {
	return s.repo.Delete(id)
}
