package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type MufrodatService interface {
	FindByAyahID(int) ([]model.Mufrodat, error)
	FindBySurahNumber(int) ([]model.Mufrodat, error)
	FindBySurahAndAyahNumber(int, int) ([]model.Mufrodat, error)
	FindByPage(int) ([]model.Mufrodat, error)
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

func (s *mufrodatService) FindBySurahNumber(surahNumber int) ([]model.Mufrodat, error) {
	return s.repo.FindBySurahNumber(surahNumber)
}

func (s *mufrodatService) FindBySurahAndAyahNumber(surahNumber, ayahNumber int) ([]model.Mufrodat, error) {
	return s.repo.FindBySurahAndAyahNumber(surahNumber, ayahNumber)
}

func (s *mufrodatService) FindByPage(page int) ([]model.Mufrodat, error) {
	return s.repo.FindByPage(page)
}

func (s *mufrodatService) FindByRootWord(rootWord string) ([]model.Mufrodat, error) {
	return s.repo.FindByRootWord(rootWord)
}
