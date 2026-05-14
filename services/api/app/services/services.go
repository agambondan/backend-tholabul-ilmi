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
	Sync              SyncService
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
	doaSvc := NewDoaServiceWithCache(repo.Doa, cache)
	dzikirSvc := NewDzikirServiceWithCache(repo.Dzikir, cache)
	asmaulHusnaSvc := NewAsmaUlHusnaServiceWithCache(repo.AsmaUlHusna, cache)
	return &Services{
		User:              NewUserService(repo.User),
		Ayah:              NewAyahService(repo.Ayah),
		Surah:             NewSurahServiceWithCache(repo.Surah, cache),
		Juz:               NewJuzService(repo.Juz),
		Book:              NewBookServiceWithCache(repo.Book, cache),
		Theme:             NewThemeServiceWithCache(repo.Theme, cache),
		Chapter:           NewChapterServiceWithCache(repo.Chapter, cache),
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
		Tafsir:            NewTafsirServiceWithCache(repo.Tafsir, cache),
		Doa:               doaSvc,
		AsmaUlHusna:       asmaulHusnaSvc,
		Audio:             NewAudioService(repo.Audio),
		Siroh:             NewSirohServiceWithCache(repo.Siroh, cache),
		Blog:              NewBlogService(repo.Blog),
		Stats:             NewStatsServiceWithTilawah(repo.Bookmark, repo.Hafalan, repo.UserActivity, repo.Tilawah, streak),
		Tilawah:           NewTilawahService(repo.Tilawah),
		Amalan:            NewAmalanService(repo.Amalan),
		Dzikir:            dzikirSvc,
		DzikirLog:         NewDzikirLogService(repo.DzikirLog),
		Achievement:       NewAchievementService(repo.Achievement),
		Leaderboard:       NewLeaderboardService(repo.Leaderboard),
		Zakat:             NewZakatService(),
		Sholat:            NewSholatService(repo.Sholat),
		Murojaah:          NewMurojaahService(repo.Murojaah, repo.Hafalan),
		Fiqh:              NewFiqhServiceWithCache(repo.Fiqh, cache),
		Tahlil:            NewTahlilServiceWithCache(repo.Tahlil, cache),
		Kajian:            NewKajianServiceWithCache(repo.Kajian, cache),
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
		Perawi:            NewPerawiServiceWithCache(repo.Perawi, cache),
		JarhTadil:         NewJarhTadilService(repo.JarhTadil),
		Sanad:             NewSanadService(repo.Sanad),
		Takhrij:           NewTakhrijService(repo.Takhrij),
		Sync:              NewSyncService(db, cache, doaSvc, dzikirSvc, asmaulHusnaSvc),
	}
}
