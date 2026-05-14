package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type SearchResult struct {
	Ayahs        []model.Ayah        `json:"ayahs"`
	Hadiths      []model.Hadith      `json:"hadiths"`
	Dictionaries []model.IslamicTerm `json:"dictionaries"`
	Doas         []model.Doa         `json:"doas"`
	Kajians      []model.Kajian      `json:"kajians"`
	Perawis      []model.Perawi      `json:"perawis"`
	Total        int                 `json:"total"`
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
		Ayahs:        []model.Ayah{},
		Hadiths:      []model.Hadith{},
		Dictionaries: []model.IslamicTerm{},
		Doas:         []model.Doa{},
		Kajians:      []model.Kajian{},
		Perawis:      []model.Perawi{},
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
	case "dictionary", "kamus":
		terms, err := s.repo.SearchDictionary(query, limit)
		if err != nil {
			return nil, err
		}
		result.Dictionaries = terms
	case "doa", "dua", "prayer":
		doas, err := s.repo.SearchDoa(query, limit)
		if err != nil {
			return nil, err
		}
		result.Doas = doas
	case "kajian", "study", "lesson":
		kajians, err := s.repo.SearchKajian(query, limit)
		if err != nil {
			return nil, err
		}
		result.Kajians = kajians
	case "perawi", "rawi", "rijal":
		perawis, err := s.repo.SearchPerawi(query, limit)
		if err != nil {
			return nil, err
		}
		result.Perawis = perawis
	default:
		each := limit / 6
		if each < 2 {
			each = 2
		}
		ayahs, err := s.repo.SearchAyah(query, each)
		if err != nil {
			return nil, err
		}
		hadiths, err := s.repo.SearchHadith(query, each)
		if err != nil {
			return nil, err
		}
		terms, err := s.repo.SearchDictionary(query, each)
		if err != nil {
			return nil, err
		}
		doas, err := s.repo.SearchDoa(query, each)
		if err != nil {
			return nil, err
		}
		kajians, err := s.repo.SearchKajian(query, each)
		if err != nil {
			return nil, err
		}
		perawis, err := s.repo.SearchPerawi(query, each)
		if err != nil {
			return nil, err
		}
		result.Ayahs = ayahs
		result.Hadiths = hadiths
		result.Dictionaries = terms
		result.Doas = doas
		result.Kajians = kajians
		result.Perawis = perawis
	}

	result.Total = len(result.Ayahs) + len(result.Hadiths) + len(result.Dictionaries) + len(result.Doas) + len(result.Kajians) + len(result.Perawis)
	return result, nil
}
