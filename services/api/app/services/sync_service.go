package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type SyncResponse struct {
	Surahs        []model.Surah          `json:"surahs"`
	Juzs          []model.Juz            `json:"juzs"`
	Doas          []model.Doa            `json:"doas"`
	Dzikirs       []model.Dzikir         `json:"dzikirs"`
	AsmaulHusnas  []model.AsmaUlHusna    `json:"asmaul_husnas"`
	HadithBooks   []model.Book           `json:"hadith_books"`
	PrayerMethods []map[string]any       `json:"prayer_methods"`
}

type SyncService interface {
	GetInitialSync(lang string) (*SyncResponse, error)
}

type syncService struct {
	db          *gorm.DB
	cache       *lib.CacheService
	doa         DoaService
	dzikir      DzikirService
	asmaulHusna AsmaUlHusnaService
}

func NewSyncService(db *gorm.DB, cache *lib.CacheService, doa DoaService, dzikir DzikirService, asmaulHusna AsmaUlHusnaService) SyncService {
	return &syncService{db, cache, doa, dzikir, asmaulHusna}
}

var syncPrayerMethods = []map[string]any{
	{"id": "kemenag", "name": "Kementerian Agama RI"},
	{"id": "mwl", "name": "Muslim World League"},
	{"id": "isna", "name": "Islamic Society of North America"},
	{"id": "egypt", "name": "Egyptian General Authority of Survey"},
	{"id": "makkah", "name": "Umm Al-Qura University, Makkah"},
	{"id": "karachi", "name": "University of Islamic Sciences, Karachi"},
	{"id": "jakim", "name": "Jabatan Kemajuan Islam Malaysia"},
}

func (s *syncService) GetInitialSync(lang string) (*SyncResponse, error) {
	var resp SyncResponse
	key := "sync:initial:" + lang
	err := s.cache.Remember(key, &resp, func() (interface{}, error) {
		return s.buildSyncData(lang)
	})
	if err != nil {
		return nil, err
	}
	return &resp, nil
}

func (s *syncService) buildSyncData(lang string) (*SyncResponse, error) {
	var surahs []model.Surah
	if err := s.db.Preload("Translation").Order("number").Find(&surahs).Error; err != nil {
		return nil, err
	}
	for i := range surahs {
		surahs[i].Translation.FilterByLang(lang)
	}

	var juzs []model.Juz
	if err := s.db.Preload("StartSurah.Translation").Preload("EndSurah.Translation").
		Preload("StartAyah.Translation").Preload("EndAyah.Translation").
		Order("number").Find(&juzs).Error; err != nil {
		return nil, err
	}
	for i := range juzs {
		if juzs[i].StartSurah != nil {
			juzs[i].StartSurah.Translation.FilterByLang(lang)
		}
		if juzs[i].EndSurah != nil {
			juzs[i].EndSurah.Translation.FilterByLang(lang)
		}
		if juzs[i].StartAyah != nil {
			juzs[i].StartAyah.Translation.FilterByLang(lang)
		}
		if juzs[i].EndAyah != nil {
			juzs[i].EndAyah.Translation.FilterByLang(lang)
		}
	}

	doas, err := s.doa.FindAll(99999, 0)
	if err != nil {
		return nil, err
	}
	for i := range doas {
		doas[i].Translation.FilterByLang(lang)
	}

	dzikirs, err := s.dzikir.FindAll(99999, 0)
	if err != nil {
		return nil, err
	}
	for i := range dzikirs {
		dzikirs[i].Translation.FilterByLang(lang)
	}

	asmaulHusnas, err := s.asmaulHusna.FindAll(99999, 0)
	if err != nil {
		return nil, err
	}
	for i := range asmaulHusnas {
		asmaulHusnas[i].Translation.FilterByLang(lang)
	}

	var books []model.Book
	if err := s.db.Preload("Translation").Preload("Media").Order("id").Find(&books).Error; err != nil {
		return nil, err
	}
	for i := range books {
		books[i].Translation.FilterByLang(lang)
	}

	return &SyncResponse{
		Surahs:        surahs,
		Juzs:          juzs,
		Doas:          doas,
		Dzikirs:       dzikirs,
		AsmaulHusnas:  asmaulHusnas,
		HadithBooks:   books,
		PrayerMethods: syncPrayerMethods,
	}, nil
}
