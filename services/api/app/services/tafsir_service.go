package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type TafsirService interface {
	FindByAyahID(int) (*model.Tafsir, error)
	FindBySurahNumber(int, int, int) ([]model.Tafsir, error)
	Save(*model.Tafsir) (*model.Tafsir, error)
	UpdateByAyahID(int, *model.Tafsir) (*model.Tafsir, error)
}

type tafsirService struct {
	repo repository.TafsirRepository
}

func NewTafsirService(repo repository.TafsirRepository) TafsirService {
	return &tafsirService{repo}
}

func (s *tafsirService) FindByAyahID(ayahID int) (*model.Tafsir, error) {
	return s.repo.FindByAyahID(ayahID)
}

func (s *tafsirService) FindBySurahNumber(surahNumber, limit, offset int) ([]model.Tafsir, error) {
	return s.repo.FindBySurahNumber(surahNumber, limit, offset)
}

func (s *tafsirService) Save(t *model.Tafsir) (*model.Tafsir, error) {
	return s.repo.Save(t)
}

func (s *tafsirService) UpdateByAyahID(ayahID int, t *model.Tafsir) (*model.Tafsir, error) {
	return s.repo.UpdateByAyahID(ayahID, t)
}
