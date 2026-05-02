package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type SearchResult struct {
	Ayahs   []model.Ayah   `json:"ayahs"`
	Hadiths []model.Hadith `json:"hadiths"`
	Total   int            `json:"total"`
}

type SearchService interface {
	Search(query, searchType string, limit int) (*SearchResult, error)
}

type searchService struct {
	repo repository.SearchRepository
}

func NewSearchService(repo repository.SearchRepository) SearchService {
	return &searchService{repo}
}

func (s *searchService) Search(query, searchType string, limit int) (*SearchResult, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	result := &SearchResult{
		Ayahs:   []model.Ayah{},
		Hadiths: []model.Hadith{},
	}

	switch searchType {
	case "ayah":
		ayahs, err := s.repo.SearchAyah(query, limit)
		if err != nil {
			return nil, err
		}
		result.Ayahs = ayahs
	case "hadith":
		hadiths, err := s.repo.SearchHadith(query, limit)
		if err != nil {
			return nil, err
		}
		result.Hadiths = hadiths
	default:
		half := limit / 2
		if half < 1 {
			half = 1
		}
		ayahs, err := s.repo.SearchAyah(query, half)
		if err != nil {
			return nil, err
		}
		hadiths, err := s.repo.SearchHadith(query, half)
		if err != nil {
			return nil, err
		}
		result.Ayahs = ayahs
		result.Hadiths = hadiths
	}

	result.Total = len(result.Ayahs) + len(result.Hadiths)
	return result, nil
}
