package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type MufrodatService interface {
	FindByAyahID(int) ([]model.Mufrodat, error)
	FindByRootWord(string) ([]model.Mufrodat, error)
}

type mufrodatService struct {
	repo repository.MufrodatRepository
}

func NewMufrodatService(repo repository.MufrodatRepository) MufrodatService {
	return &mufrodatService{repo}
}

func (s *mufrodatService) FindByAyahID(ayahID int) ([]model.Mufrodat, error) {
	return s.repo.FindByAyahID(ayahID)
}

func (s *mufrodatService) FindByRootWord(rootWord string) ([]model.Mufrodat, error) {
	return s.repo.FindByRootWord(rootWord)
}
