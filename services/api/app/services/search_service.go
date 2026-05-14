package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type SearchResult struct {
	Ayahs           []model.Ayah        `json:"ayahs"`
	AyahTotal       int64               `json:"ayah_total"`
	Hadiths         []model.Hadith      `json:"hadiths"`
	HadithTotal     int64               `json:"hadith_total"`
	Dictionaries    []model.IslamicTerm `json:"dictionaries"`
	DictionaryTotal int64               `json:"dictionary_total"`
	Doas            []model.Doa         `json:"doas"`
	DoaTotal        int64               `json:"doa_total"`
	Kajians         []model.Kajian      `json:"kajians"`
	KajianTotal     int64               `json:"kajian_total"`
	Perawis         []model.Perawi      `json:"perawis"`
	PerawiTotal     int64               `json:"perawi_total"`
	Total           int                 `json:"total"`
}

type SearchService interface {
	Search(query, searchType string, limit, page int) (*SearchResult, error)
}

type searchService struct {
	repo repository.SearchRepository
}

func NewSearchService(repo repository.SearchRepository) SearchService {
	return &searchService{repo}
}

func (s *searchService) Search(query, searchType string, limit, page int) (*SearchResult, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	offset := page * limit

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
		ayahs, total, err := s.repo.SearchAyah(query, limit, offset)
		if err != nil {
			return nil, err
		}
		result.Ayahs = ayahs
		result.AyahTotal = total
	case "hadith":
		hadiths, total, err := s.repo.SearchHadith(query, limit, offset)
		if err != nil {
			return nil, err
		}
		result.Hadiths = hadiths
		result.HadithTotal = total
	case "dictionary", "kamus":
		terms, total, err := s.repo.SearchDictionary(query, limit, offset)
		if err != nil {
			return nil, err
		}
		result.Dictionaries = terms
		result.DictionaryTotal = total
	case "doa", "dua", "prayer":
		doas, total, err := s.repo.SearchDoa(query, limit, offset)
		if err != nil {
			return nil, err
		}
		result.Doas = doas
		result.DoaTotal = total
	case "kajian", "study", "lesson":
		kajians, total, err := s.repo.SearchKajian(query, limit, offset)
		if err != nil {
			return nil, err
		}
		result.Kajians = kajians
		result.KajianTotal = total
	case "perawi", "rawi", "rijal":
		perawis, total, err := s.repo.SearchPerawi(query, limit, offset)
		if err != nil {
			return nil, err
		}
		result.Perawis = perawis
		result.PerawiTotal = total
	default:
		each := limit / 6
		if each < 2 {
			each = 2
		}
		ayahs, ayahTotal, err := s.repo.SearchAyah(query, each, 0)
		if err != nil {
			return nil, err
		}
		hadiths, hadithTotal, err := s.repo.SearchHadith(query, each, 0)
		if err != nil {
			return nil, err
		}
		terms, dictTotal, err := s.repo.SearchDictionary(query, each, 0)
		if err != nil {
			return nil, err
		}
		doas, doaTotal, err := s.repo.SearchDoa(query, each, 0)
		if err != nil {
			return nil, err
		}
		kajians, kajianTotal, err := s.repo.SearchKajian(query, each, 0)
		if err != nil {
			return nil, err
		}
		perawis, perawiTotal, err := s.repo.SearchPerawi(query, each, 0)
		if err != nil {
			return nil, err
		}
		result.Ayahs = ayahs
		result.AyahTotal = ayahTotal
		result.Hadiths = hadiths
		result.HadithTotal = hadithTotal
		result.Dictionaries = terms
		result.DictionaryTotal = dictTotal
		result.Doas = doas
		result.DoaTotal = doaTotal
		result.Kajians = kajians
		result.KajianTotal = kajianTotal
		result.Perawis = perawis
		result.PerawiTotal = perawiTotal
	}

	result.Total = int(result.AyahTotal + result.HadithTotal + result.DictionaryTotal + result.DoaTotal + result.KajianTotal + result.PerawiTotal)
	return result, nil
}
