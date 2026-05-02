package service

import (
	"github.com/agambondan/islamic-explorer/app/repository"
)

type Services struct {
	User            UserService
	Ayah            AyahService
	Surah           SurahService
	Juz             JuzService
	Book            BookService
	Theme           ThemeService
	Chapter         ChapterService
	Hadith          HadithService
	Bookmark        BookmarkService
	ReadingProgress ReadingProgressService
	Hafalan         HafalanService
	Streak          StreakService
	Search          SearchService
}

func NewServices(repo *repository.Repositories) *Services {
	if repo == nil {
		return &Services{}
	}
	return &Services{
		User:            NewUserService(repo.User),
		Ayah:            NewAyahService(repo.Ayah),
		Surah:           NewSurahService(repo.Surah),
		Juz:             NewJuzService(repo.Juz),
		Book:            NewBookService(repo.Book),
		Theme:           NewThemeService(repo.Theme),
		Chapter:         NewChapterService(repo.Chapter),
		Hadith:          NewHadithService(repo.Hadith),
		Bookmark:        NewBookmarkService(repo.Bookmark, repo.Ayah, repo.Hadith),
		ReadingProgress: NewReadingProgressService(repo.ReadingProgress, repo.UserActivity),
		Hafalan:         NewHafalanService(repo.Hafalan),
		Streak:          NewStreakService(repo.UserActivity),
		Search:          NewSearchService(repo.Search),
	}
}
