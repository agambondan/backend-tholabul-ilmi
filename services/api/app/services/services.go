package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/spf13/viper"
)

type Services struct {
	User              UserService
	Ayah              AyahService
	Surah             SurahService
	Juz               JuzService
	Book              BookService
	Theme             ThemeService
	Chapter           ChapterService
	Hadith            HadithService
	Bookmark          BookmarkService
	UserWird          UserWirdService
	ReadingProgress   ReadingProgressService
	Hafalan           HafalanService
	Streak            StreakService
	Search            SearchService
	Mufrodat          MufrodatService
	Notification      NotificationService
	NotificationInbox NotificationInboxService
	Feed              FeedService
	Tafsir            TafsirService
	Doa               DoaService
	AsmaUlHusna       AsmaUlHusnaService
	Audio             AudioService
	Siroh             SirohService
	Blog              BlogService
	Stats             StatsService
	Tilawah           TilawahService
	Amalan            AmalanService
	Dzikir            DzikirService
	DzikirLog         DzikirLogService
	Achievement       AchievementService
	Leaderboard       LeaderboardService
	Zakat             ZakatService
	Sholat            SholatService
	Murojaah          MurojaahService
	Fiqh              FiqhService
	Tahlil            TahlilService
	Kajian            KajianService
	Muhasabah         MuhasabahService
	Goal              GoalService
	Hijri             HijriService
	AsbabunNuzul      AsbabunNuzulService
	Kiblat            KiblatService
	PrayerTimes       PrayerTimesService
	History           HistoryService
	Manasik           ManasikService
	Quiz              QuizService
	Note              NoteService
	Dictionary        DictionaryService
	Comment           CommentService
	APIKey            APIKeyService
	Perawi            PerawiService
	JarhTadil         JarhTadilService
	Sanad             SanadService
	Takhrij           TakhrijService
}

func NewServices(repo *repository.Repositories) *Services {
	if repo == nil {
		return &Services{}
	}
	cacheTTL := viper.GetInt64("CACHE_TTL_SECONDS")
	db := repo.GetDB()
	sqlDB, _ := db.DB()
	client := repo.GetRedis()

	var cache *lib.CacheService
	if sqlDB != nil {
		cache = lib.NewCacheService(client, cacheTTL)
	}

	streak := NewStreakService(repo.UserActivity)
	return &Services{
		User:              NewUserService(repo.User),
		Ayah:              NewAyahService(repo.Ayah),
		Surah:             NewSurahServiceWithCache(repo.Surah, cache),
		Juz:               NewJuzService(repo.Juz),
		Book:              NewBookService(repo.Book),
		Theme:             NewThemeService(repo.Theme),
		Chapter:           NewChapterService(repo.Chapter),
		Hadith:            NewHadithService(repo.Hadith),
		Bookmark:          NewBookmarkService(repo.Bookmark, repo.Ayah, repo.Hadith),
		UserWird:          NewUserWirdService(repo.UserWird),
		ReadingProgress:   NewReadingProgressService(repo.ReadingProgress, repo.UserActivity),
		Hafalan:           NewHafalanService(repo.Hafalan),
		Streak:            streak,
		Search:            NewSearchService(repo.Search),
		Mufrodat:          NewMufrodatService(repo.Mufrodat),
		Notification:      NewNotificationService(repo.Notification, repo.NotificationInbox),
		NotificationInbox: NewNotificationInboxService(repo.NotificationInbox),
		Feed:              NewFeedService(repo.Feed, NewAyahService(repo.Ayah), NewHadithService(repo.Hadith)),
		Tafsir:            NewTafsirService(repo.Tafsir),
		Doa:               NewDoaServiceWithCache(repo.Doa, cache),
		AsmaUlHusna:       NewAsmaUlHusnaService(repo.AsmaUlHusna),
		Audio:             NewAudioService(repo.Audio),
		Siroh:             NewSirohService(repo.Siroh),
		Blog:              NewBlogService(repo.Blog),
		Stats:             NewStatsServiceWithTilawah(repo.Bookmark, repo.Hafalan, repo.UserActivity, repo.Tilawah, streak),
		Tilawah:           NewTilawahService(repo.Tilawah),
		Amalan:            NewAmalanService(repo.Amalan),
		Dzikir:            NewDzikirServiceWithCache(repo.Dzikir, cache),
		DzikirLog:         NewDzikirLogService(repo.DzikirLog),
		Achievement:       NewAchievementService(repo.Achievement),
		Leaderboard:       NewLeaderboardService(repo.Leaderboard),
		Zakat:             NewZakatService(),
		Sholat:            NewSholatService(repo.Sholat),
		Murojaah:          NewMurojaahService(repo.Murojaah, repo.Hafalan),
		Fiqh:              NewFiqhServiceWithCache(repo.Fiqh, cache),
		Tahlil:            NewTahlilService(repo.Tahlil),
		Kajian:            NewKajianService(repo.Kajian),
		Muhasabah:         NewMuhasabahService(repo.Muhasabah),
		Goal:              NewGoalService(repo.Goal),
		Hijri:             NewHijriService(repo.IslamicEvent),
		AsbabunNuzul:      NewAsbabunNuzulService(repo.AsbabunNuzul),
		Kiblat:            NewKiblatService(),
		PrayerTimes:       NewPrayerTimesService(),
		History:           NewHistoryService(repo.History),
		Manasik:           NewManasikServiceWithCache(repo.Manasik, cache),
		Quiz:              NewQuizService(repo.Quiz),
		Note:              NewNoteService(repo.Note),
		Dictionary:        NewDictionaryService(repo.Dictionary),
		Comment:           NewCommentService(repo.Comment),
		APIKey:            NewAPIKeyService(repo.APIKey),
		Perawi:            NewPerawiService(repo.Perawi),
		JarhTadil:         NewJarhTadilService(repo.JarhTadil),
		Sanad:             NewSanadService(repo.Sanad),
		Takhrij:           NewTakhrijService(repo.Takhrij),
	}
}
