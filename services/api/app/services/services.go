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
	Mufrodat        MufrodatService
	Notification    NotificationService
	Feed            FeedService
	Tafsir          TafsirService
	Doa             DoaService
	AsmaUlHusna     AsmaUlHusnaService
	Audio           AudioService
	Siroh           SirohService
	Blog            BlogService
	Stats           StatsService
	Tilawah         TilawahService
	Amalan          AmalanService
	Dzikir          DzikirService
	Leaderboard     LeaderboardService
	Zakat           ZakatService
	Sholat          SholatService
	Murojaah        MurojaahService
	Fiqh            FiqhService
	Tahlil          TahlilService
	Kajian          KajianService
	Muhasabah       MuhasabahService
	Goal            GoalService
	Hijri           HijriService
	AsbabunNuzul    AsbabunNuzulService
	Kiblat          KiblatService
	PrayerTimes     PrayerTimesService
	History         HistoryService
	Manasik         ManasikService
	Quiz            QuizService
	Note            NoteService
	Dictionary      DictionaryService
	Comment         CommentService
	APIKey          APIKeyService
}

func NewServices(repo *repository.Repositories) *Services {
	if repo == nil {
		return &Services{}
	}
	streak := NewStreakService(repo.UserActivity)
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
		Streak:          streak,
		Search:          NewSearchService(repo.Search),
		Mufrodat:        NewMufrodatService(repo.Mufrodat),
		Notification:    NewNotificationService(repo.Notification),
		Feed:            NewFeedService(repo.Feed, NewAyahService(repo.Ayah), NewHadithService(repo.Hadith)),
		Tafsir:          NewTafsirService(repo.Tafsir),
		Doa:             NewDoaService(repo.Doa),
		AsmaUlHusna:     NewAsmaUlHusnaService(repo.AsmaUlHusna),
		Audio:           NewAudioService(repo.Audio),
		Siroh:           NewSirohService(repo.Siroh),
		Blog:            NewBlogService(repo.Blog),
		Stats:           NewStatsServiceWithTilawah(repo.Bookmark, repo.Hafalan, repo.UserActivity, repo.Tilawah, streak),
		Tilawah:         NewTilawahService(repo.Tilawah),
		Amalan:          NewAmalanService(repo.Amalan),
		Dzikir:          NewDzikirService(repo.Dzikir),
		Leaderboard:     NewLeaderboardService(repo.Leaderboard),
		Zakat:           NewZakatService(),
		Sholat:          NewSholatService(repo.Sholat),
		Murojaah:        NewMurojaahService(repo.Murojaah, repo.Hafalan),
		Fiqh:            NewFiqhService(repo.Fiqh),
		Tahlil:          NewTahlilService(repo.Tahlil),
		Kajian:          NewKajianService(repo.Kajian),
		Muhasabah:       NewMuhasabahService(repo.Muhasabah),
		Goal:            NewGoalService(repo.Goal),
		Hijri:           NewHijriService(repo.IslamicEvent),
		AsbabunNuzul:    NewAsbabunNuzulService(repo.AsbabunNuzul),
		Kiblat:          NewKiblatService(),
		PrayerTimes:     NewPrayerTimesService(),
		History:         NewHistoryService(repo.History),
		Manasik:         NewManasikService(repo.Manasik),
		Quiz:            NewQuizService(repo.Quiz),
		Note:            NewNoteService(repo.Note),
		Dictionary:      NewDictionaryService(repo.Dictionary),
		Comment:         NewCommentService(repo.Comment),
		APIKey:          NewAPIKeyService(repo.APIKey),
	}
}
