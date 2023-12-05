package service

import (
	"github.com/agambondan/islamic-explorer/app/repository"
)

type Services struct {
	Ayah  AyahService
	Surah SurahService
	Juz   JuzService
	Book  BookService
	Theme ThemeService
}

func NewServices(repo *repository.Repositories) *Services {
	return &Services{
		Ayah:  NewAyahService(repo.Ayah),
		Surah: NewSurahService(repo.Surah),
		Juz:   NewJuzService(repo.Juz),
		Book:  NewBookService(repo.Book),
		Theme: NewThemeService(repo.Theme),
	}
}
