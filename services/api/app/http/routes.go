package http

import (
	"encoding/json"
	"os"
	"time"

	"github.com/agambondan/islamic-explorer/app/controllers"
	"github.com/agambondan/islamic-explorer/app/http/middlewares"
	"github.com/agambondan/islamic-explorer/app/repository"
	service "github.com/agambondan/islamic-explorer/app/services"
	_ "github.com/agambondan/islamic-explorer/docs"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/swagger"
	"github.com/spf13/viper"
)

// Handle all request to route to controller
func Handle(app *fiber.App, repo *repository.Repositories) {
	app.Use(recover.New(recover.Config{EnableStackTrace: true}))
	app.Use(compress.New())
	app.Use(logger.New())
	app.Use(middlewares.SecurityHeaders())
	app.Use(middlewares.Cors())

	newServices := service.NewServices(repo)
	newUserController := controllers.NewUserController(newServices)
	newAyahController := controllers.NewAyahController(newServices)
	newSurahController := controllers.NewSurahController(newServices)
	newJuzController := controllers.NewJuzController(newServices)
	newBookController := controllers.NewBookController(newServices)
	newThemeController := controllers.NewThemeController(newServices)
	newChapterController := controllers.NewChapterController(newServices)
	newHadithController := controllers.NewHadithController(newServices)
	newBookmarkController := controllers.NewBookmarkController(newServices)
	newReadingProgressController := controllers.NewReadingProgressController(newServices)
	newHafalanController := controllers.NewHafalanController(newServices)
	newStreakController := controllers.NewStreakController(newServices)
	newSearchController := controllers.NewSearchController(newServices)
	newMufrodatController := controllers.NewMufrodatController(newServices)
	newNotificationController := controllers.NewNotificationController(newServices)
	newNotificationInboxController := controllers.NewNotificationInboxController(newServices)
	newFeedController := controllers.NewFeedController(newServices)
	newTafsirController := controllers.NewTafsirController(newServices)
	newDoaController := controllers.NewDoaController(newServices)
	newAsmaUlHusnaController := controllers.NewAsmaUlHusnaController(newServices)
	newAudioController := controllers.NewAudioController(newServices)
	newSirohController := controllers.NewSirohController(newServices)
	newBlogController := controllers.NewBlogController(newServices)
	newStatsController := controllers.NewStatsController(newServices)
	newTilawahController := controllers.NewTilawahController(newServices)
	newAmalanController := controllers.NewAmalanController(newServices)
	newDzikirController := controllers.NewDzikirController(newServices)
	newDzikirLogController := controllers.NewDzikirLogController(newServices)
	newAchievementController := controllers.NewAchievementController(newServices)
	newLeaderboardController := controllers.NewLeaderboardController(newServices)
	newShareController := controllers.NewShareController(newServices)
	newZakatController := controllers.NewZakatController(newServices)
	newSholatController := controllers.NewSholatController(newServices)
	newMurojaahController := controllers.NewMurojaahController(newServices)
	newFiqhController := controllers.NewFiqhController(newServices)
	newTahlilController := controllers.NewTahlilController(newServices)
	newKajianController := controllers.NewKajianController(newServices)
	newMuhasabahController := controllers.NewMuhasabahController(newServices)
	newGoalController := controllers.NewGoalController(newServices)
	newKiblatController := controllers.NewKiblatController(newServices)
	newUserWirdController := controllers.NewUserWirdController(newServices)
	newPrayerTimesController := controllers.NewPrayerTimesController(newServices)
	newHistoryController := controllers.NewHistoryController(newServices)
	newManasikController := controllers.NewManasikController(newServices)
	newQuizController := controllers.NewQuizController(newServices)
	newNoteController := controllers.NewNoteController(newServices)
	newDictionaryController := controllers.NewDictionaryController(newServices)
	newCommentController := controllers.NewCommentController(newServices)
	newAPIKeyController := controllers.NewAPIKeyController(newServices)
	newHijriController := controllers.NewHijriController(newServices)
	newAsbabunNuzulController := controllers.NewAsbabunNuzulController(newServices)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	master := app.Group(viper.GetString("ENDPOINT"))
	master.Get("/", controllers.GetAPIIndex)
	master.Get("/info", controllers.GetAPIInfo)
	if viper.GetString("ENVIRONMENT") != "production" {
		master.Get("/swagger.json", func(c *fiber.Ctx) error {
			swaggerPath := viper.GetString("SWAGGER_JSON_PATH")
			if swaggerPath == "" {
				swaggerPath = "docs/swagger.json"
			}
			response := make(map[string]interface{})
			b, err := os.ReadFile(swaggerPath)
			if err != nil {
				return c.Status(500).JSON(err)
			}
			err = json.Unmarshal(b, &response)
			if err != nil {
				return c.Status(500).JSON(err)
			}
			return c.JSON(response)
		})
		master.Get("/swagger/*", swagger.HandlerDefault)
	}

	// Rate limiter for auth endpoints (10 req/min)
	authLimiter := limiter.New(limiter.Config{Max: 10, Expiration: 1 * time.Minute})

	// Auth (public)
	master.Post("/auth/register", authLimiter, newUserController.Register)
	master.Post("/auth/login", authLimiter, newUserController.Login)
	master.Post("/auth/refresh", authLimiter, newUserController.Refresh)
	master.Post("/auth/logout", newUserController.Logout)
	master.Post("/auth/forgot-password", authLimiter, newUserController.ForgotPassword)
	master.Post("/auth/reset-password", authLimiter, newUserController.ResetPassword)

	// Middleware vars — declared early so they can be used on Quran write routes
	jwt := middlewares.JWTAuth()
	admin := middlewares.AdminMiddleware()

	// Search (public)
	master.Get("/search", newSearchController.Search)

	// Mufrodat / Kosakata Quran (public)
	master.Get("/mufrodat/ayah/:id", newMufrodatController.FindByAyahID)
	master.Get("/mufrodat/root/:word", newMufrodatController.FindByRootWord)

	// Ayah (read: public; write: admin)
	master.Post("/ayah", admin, newAyahController.Create)
	master.Get("/ayah", newAyahController.FindAll)
	master.Get("/ayah/:id", newAyahController.FindById)
	master.Get("/ayah/number/:number", newAyahController.FindByNumber)
	master.Get("/ayah/surah/number/:number", newAyahController.FindBySurahNumber)
	master.Get("/ayah/page/:page", newAyahController.FindByPage)
	master.Get("/ayah/hizb/:hizb", newAyahController.FindByHizbQuarter)
	master.Put("/ayah/:id", admin, newAyahController.UpdateById)
	master.Delete("/ayah/:id/:scoped", admin, newAyahController.DeleteById)

	// Surah (read: public; write: admin)
	master.Post("/surah", admin, newSurahController.Create)
	master.Get("/surah", newSurahController.FindAll)
	master.Get("/surah/:id", newSurahController.FindById)
	master.Get("/surah/number/:number", newSurahController.FindByNumber)
	master.Get("/surah/name/:name", newSurahController.FindByName)
	master.Put("/surah/:id", admin, newSurahController.UpdateById)
	master.Delete("/surah/:id/:scoped", admin, newSurahController.DeleteById)

	// Juz (read: public; write: admin)
	master.Post("/juz", admin, newJuzController.Create)
	master.Get("/juz", newJuzController.FindAll)
	master.Get("/juz/:id", newJuzController.FindById)
	master.Get("/juz/surah/:name", newJuzController.FindBySurahName)
	master.Put("/juz/:id", admin, newJuzController.UpdateById)
	master.Delete("/juz/:id/:scoped", admin, newJuzController.DeleteById)

	// Book (read: public; write: admin)
	master.Post("/books", admin, newBookController.Create)
	master.Get("/books", newBookController.FindAll)
	master.Get("/books/:id", newBookController.FindById)
	master.Get("/books/slug/:slug", newBookController.FindBySlug)
	master.Put("/books/:id", admin, newBookController.UpdateById)
	master.Delete("/books/:id", admin, newBookController.DeleteById)

	// Theme (read: public; write: admin)
	master.Post("/themes", admin, newThemeController.Create)
	master.Get("/themes", newThemeController.FindAll)
	master.Get("/themes/:id", newThemeController.FindById)
	master.Get("/themes/book/:slug", newThemeController.FindByBookSlug)
	master.Put("/themes/:id", admin, newThemeController.UpdateById)
	master.Delete("/themes/:id", admin, newThemeController.DeleteById)

	// Chapter (read: public; write: admin)
	master.Post("/chapters", admin, newChapterController.Create)
	master.Get("/chapters", newChapterController.FindAll)
	master.Get("/chapters/:id", newChapterController.FindById)
	master.Get("/chapters/book/:slug/theme/:themeId", newChapterController.FindByBookSlugThemeId)
	master.Get("/chapters/theme/:id", newChapterController.FindByThemeId)
	master.Put("/chapters/:id", admin, newChapterController.UpdateById)
	master.Delete("/chapters/:id", admin, newChapterController.DeleteById)

	// Hadith (read: public; write: admin)
	master.Post("/hadiths", admin, newHadithController.Create)
	master.Get("/hadiths", newHadithController.FindAll)
	master.Get("/hadiths/daily", newHadithController.FindDaily)
	master.Get("/hadiths/:id", newHadithController.FindById)
	master.Get("/hadiths/book/:slug", newHadithController.FindByBookSlug)
	master.Get("/hadiths/theme/:themeId", newHadithController.FindByThemeId)
	master.Get("/hadiths/theme/slug/:slug", newHadithController.FindByThemeName)
	master.Get("/hadiths/book/:slug/theme/:themeId", newHadithController.FindByBookSlugThemeId)
	master.Get("/hadiths/chapter/:id", newHadithController.FindByChapterId)
	master.Get("/hadiths/book/slug/chapter/:id", newHadithController.FindByBookSlugChapterId)
	master.Get("/hadiths/theme/:themeId/chapter/:chapterId", newHadithController.FindByThemeIdChapterId)
	master.Get("/hadiths/book/:slug/theme/:themeId/chapter/:chapterId", newHadithController.FindByBookSlugThemeIdChapterId)
	master.Put("/hadiths/:id", admin, newHadithController.UpdateById)
	master.Delete("/hadiths/:id", admin, newHadithController.DeleteById)

	// Auth & Users (Protected routes)
	master.Get("/auth/me", jwt, newUserController.Me)
	master.Put("/auth/me", jwt, newUserController.UpdateProfile)
	master.Put("/auth/password", jwt, newUserController.UpdatePassword)
	master.Get("/users", admin, newUserController.FindAll)
	master.Get("/users/:id", jwt, newUserController.FindById)
	master.Put("/users/:id", admin, newUserController.UpdateById)
	master.Put("/users/:id/role", admin, newUserController.UpdateRole)
	master.Delete("/users/:id", admin, newUserController.DeleteById)

	// Notifications / Reminder
	master.Get("/notifications/settings", jwt, newNotificationController.FindSettings)
	master.Put("/notifications/settings", jwt, newNotificationController.UpsertSettings)
	master.Put("/notifications/push-token", jwt, newNotificationController.RegisterPushToken)
	// Notification inbox
	master.Get("/notifications/inbox", jwt, newNotificationInboxController.List)
	master.Put("/notifications/inbox/read-all", jwt, newNotificationInboxController.MarkAllRead)
	master.Put("/notifications/inbox/:id/read", jwt, newNotificationInboxController.MarkRead)

	// Share to Feed
	master.Get("/feed", newFeedController.FindAll)
	master.Get("/feed/:id", newFeedController.FindByID)
	master.Post("/feed", jwt, newFeedController.Create)
	master.Post("/feed/:id/like", jwt, newFeedController.Like)
	master.Delete("/feed/:id", jwt, newFeedController.Delete)

	// Bookmark
	master.Post("/bookmarks", jwt, newBookmarkController.Add)
	master.Get("/bookmarks", jwt, newBookmarkController.FindAll)
	master.Put("/bookmarks/:id", jwt, newBookmarkController.Update)
	master.Delete("/bookmarks/:id", jwt, newBookmarkController.Delete)

	// Reading Progress
	master.Put("/progress/quran", jwt, newReadingProgressController.UpdateQuran)
	master.Get("/progress/quran", jwt, newReadingProgressController.GetQuran)
	master.Put("/progress/hadith", jwt, newReadingProgressController.UpdateHadith)
	master.Get("/progress/hadith", jwt, newReadingProgressController.GetHadith)
	master.Get("/progress", jwt, newReadingProgressController.GetAll)

	// Hafalan
	master.Put("/hafalan/surah/:surahId", jwt, newHafalanController.Update)
	master.Get("/hafalan", jwt, newHafalanController.FindAll)
	master.Get("/hafalan/summary", jwt, newHafalanController.Summary)

	// Streak & Activity
	master.Post("/activity", jwt, newStreakController.Record)
	master.Get("/streak", jwt, newStreakController.GetStreak)
	master.Get("/streak/weekly", jwt, newStreakController.GetWeekly)

	// Tafsir (public read, editor/admin write)
	master.Get("/tafsir/ayah/:id", newTafsirController.FindByAyahID)
	master.Get("/tafsir/surah/:number", newTafsirController.FindBySurahNumber)
	master.Post("/tafsir", middlewares.EditorOrAdminMiddleware(), newTafsirController.Save)
	master.Put("/tafsir/ayah/:id", middlewares.EditorOrAdminMiddleware(), newTafsirController.UpdateByAyahID)

	// Doa (public)
	master.Get("/doa", newDoaController.FindAll)
	master.Get("/doa/category/:category", newDoaController.FindByCategory)
	master.Get("/doa/:id", newDoaController.FindByID)

	// Asmaul Husna (public)
	master.Get("/asmaul-husna", newAsmaUlHusnaController.FindAll)
	master.Get("/asmaul-husna/:number", newAsmaUlHusnaController.FindByNumber)

	// Audio Murotal (public read, admin write)
	master.Get("/audio/surah/:surahId", newAudioController.FindSurahAudio)
	master.Get("/audio/ayah/:ayahId", newAudioController.FindAyahAudio)
	master.Post("/audio/surah", admin, newAudioController.AddSurahAudio)
	master.Post("/audio/ayah", admin, newAudioController.AddAyahAudio)
	master.Delete("/audio/surah/:id", admin, newAudioController.DeleteSurahAudio)
	master.Delete("/audio/ayah/:id", admin, newAudioController.DeleteAyahAudio)

	// Siroh (public read, editor/admin write)
	master.Get("/siroh/categories", newSirohController.FindAllCategories)
	master.Get("/siroh/categories/:slug", newSirohController.FindCategoryBySlug)
	master.Get("/siroh/contents", newSirohController.FindAllContents)
	master.Get("/siroh/contents/:slug", newSirohController.FindContentBySlug)
	master.Post("/siroh/categories", middlewares.EditorOrAdminMiddleware(), newSirohController.CreateCategory)
	master.Put("/siroh/categories/:id", middlewares.EditorOrAdminMiddleware(), newSirohController.UpdateCategory)
	master.Delete("/siroh/categories/:id", middlewares.EditorOrAdminMiddleware(), newSirohController.DeleteCategory)
	master.Post("/siroh/contents", middlewares.EditorOrAdminMiddleware(), newSirohController.CreateContent)
	master.Put("/siroh/contents/:id", middlewares.EditorOrAdminMiddleware(), newSirohController.UpdateContent)
	master.Delete("/siroh/contents/:id", middlewares.EditorOrAdminMiddleware(), newSirohController.DeleteContent)

	// Blog (public read; posts: author/admin; categories/tags: admin only)
	master.Get("/blog/posts/popular", newBlogController.FindPopularPosts)
	master.Get("/blog/posts", newBlogController.FindAllPosts)
	master.Get("/blog/posts/:slug", newBlogController.FindPostBySlug)
	master.Get("/blog/posts/:slug/related", newBlogController.FindRelatedPosts)
	master.Get("/blog/posts/:id/preview", middlewares.AuthorOrAdminMiddleware(), newBlogController.PreviewPost)
	master.Post("/blog/posts", middlewares.AuthorOrAdminMiddleware(), newBlogController.CreatePost)
	master.Put("/blog/posts/:id", middlewares.AuthorOrAdminMiddleware(), newBlogController.UpdatePost)
	master.Delete("/blog/posts/:id", middlewares.AuthorOrAdminMiddleware(), newBlogController.DeletePost)
	master.Get("/blog/categories", newBlogController.FindAllCategories)
	master.Get("/blog/categories/:slug/posts", newBlogController.FindPostsByCategorySlug)
	master.Post("/blog/categories", admin, newBlogController.CreateCategory)
	master.Put("/blog/categories/:id", admin, newBlogController.UpdateCategory)
	master.Delete("/blog/categories/:id", admin, newBlogController.DeleteCategory)
	master.Get("/blog/tags", newBlogController.FindAllTags)
	master.Get("/blog/tags/:slug/posts", newBlogController.FindPostsByTagSlug)
	master.Post("/blog/tags", admin, newBlogController.CreateTag)
	master.Delete("/blog/tags/:id", admin, newBlogController.DeleteTag)

	// Stats (protected)
	master.Get("/stats", jwt, newStatsController.GetStats)
	master.Get("/stats/weekly", jwt, newStatsController.GetWeekly)

	// Tilawah Tracker (protected)
	master.Post("/tilawah", jwt, newTilawahController.Add)
	master.Get("/tilawah", jwt, newTilawahController.FindAll)
	master.Get("/tilawah/summary", jwt, newTilawahController.Summary)
	master.Delete("/tilawah/:id", jwt, newTilawahController.Delete)

	// Amalan Harian (items: public; status/toggle/history: protected)
	master.Get("/amalan", newAmalanController.FindAllItems)
	master.Get("/amalan/today", jwt, newAmalanController.GetToday)
	master.Put("/amalan/:id/check", jwt, newAmalanController.Toggle)
	master.Get("/amalan/history", jwt, newAmalanController.GetHistory)

	// Dzikir (public)
	master.Get("/dzikir", newDzikirController.FindAll)
	master.Get("/dzikir/category/:category", newDzikirController.FindByCategory)
	master.Get("/dzikir/:id", newDzikirController.FindByID)

	// Dzikir Log (protected — daily tracker)
	master.Post("/dzikir/log", jwt, newDzikirLogController.Log)
	master.Get("/dzikir/log/today", jwt, newDzikirLogController.GetToday)
	master.Delete("/dzikir/log/:id", jwt, newDzikirLogController.Delete)

	// Leaderboard (public read, my-rank: protected)
	master.Get("/leaderboard/streak", newLeaderboardController.TopStreak)
	master.Get("/leaderboard/hafalan", newLeaderboardController.TopHafalan)
	master.Get("/leaderboard/me", jwt, newLeaderboardController.MyRank)

	// Achievements & Points (badges: public list; earned: protected)
	master.Get("/achievements", newAchievementController.GetAll)
	master.Get("/achievements/mine", jwt, newAchievementController.GetMine)
	master.Get("/achievements/points", jwt, newAchievementController.GetMyPoints)

	// Share / Card Metadata (public)
	master.Get("/share/ayah/:id", newShareController.ShareAyah)
	master.Get("/share/hadith/:id", newShareController.ShareHadith)

	// Stats — monthly & yearly recap (protected)
	master.Get("/stats/monthly", jwt, newStatsController.GetMonthly)
	master.Get("/stats/yearly", jwt, newStatsController.GetYearly)

	// Zakat Calculator (public, no DB)
	master.Post("/zakat/maal", newZakatController.CalculateMaal)
	master.Post("/zakat/fitrah", newZakatController.CalculateFitrah)
	master.Get("/zakat/nishab", newZakatController.GetNishab)

	// Prayer Tracker / Sholat (protected user; panduan: public)
	master.Put("/sholat/today", jwt, newSholatController.LogPrayer)
	master.Get("/sholat/today", jwt, newSholatController.GetToday)
	master.Get("/sholat/history", jwt, newSholatController.GetHistory)
	master.Get("/sholat/stats", jwt, newSholatController.GetStats)
	master.Get("/panduan-sholat", newSholatController.GetAllGuides)
	master.Get("/panduan-sholat/:step", newSholatController.GetGuideByStep)

	// Muroja'ah Mode (protected)
	master.Post("/murojaah/result", jwt, newMurojaahController.RecordSession)
	master.Get("/murojaah/history", jwt, newMurojaahController.GetHistory)
	master.Get("/murojaah/stats", jwt, newMurojaahController.GetStats)

	// Fiqh Ringkas (public read, editor/admin write)
	master.Get("/fiqh", newFiqhController.FindAllCategories)
	master.Get("/fiqh/categories", newFiqhController.FindAllCategories)
	master.Get("/fiqh/categories/:slug", newFiqhController.FindCategoryBySlug)
	master.Post("/fiqh/categories", middlewares.EditorOrAdminMiddleware(), newFiqhController.CreateCategory)
	master.Put("/fiqh/categories/:id", middlewares.EditorOrAdminMiddleware(), newFiqhController.UpdateCategory)
	master.Delete("/fiqh/categories/:id", middlewares.EditorOrAdminMiddleware(), newFiqhController.DeleteCategory)
	master.Get("/fiqh/:slug/:id", newFiqhController.FindItemByCategoryAndID)
	master.Get("/fiqh/item/:slug", newFiqhController.FindItemBySlug)
	master.Get("/fiqh/:slug", newFiqhController.FindCategoryBySlug)
	master.Post("/fiqh", middlewares.EditorOrAdminMiddleware(), newFiqhController.CreateItem)
	master.Post("/fiqh/items", middlewares.EditorOrAdminMiddleware(), newFiqhController.CreateItem)
	master.Put("/fiqh/items/:id", middlewares.EditorOrAdminMiddleware(), newFiqhController.UpdateItem)
	master.Delete("/fiqh/items/:id", middlewares.EditorOrAdminMiddleware(), newFiqhController.DeleteItem)

	// Tahlil & Yasin (public)
	master.Get("/tahlil", newTahlilController.FindAll)
	master.Get("/tahlil/:id", newTahlilController.FindByID)

	// Koleksi Kajian (public read, editor/admin write)
	master.Get("/kajian", newKajianController.FindAll)
	master.Get("/kajian/:id", newKajianController.FindByID)
	master.Post("/kajian", middlewares.EditorOrAdminMiddleware(), newKajianController.Create)
	master.Put("/kajian/:id", middlewares.EditorOrAdminMiddleware(), newKajianController.Update)
	master.Delete("/kajian/:id", middlewares.EditorOrAdminMiddleware(), newKajianController.Delete)

	// Wirid Khusus (public — query dzikir by occasion)
	master.Get("/wirid/occasion/:occasion", newDzikirController.FindByOccasion)

	// User Custom Wirid
	master.Post("/user-wird", jwt, newUserWirdController.Create)
	master.Get("/user-wird", jwt, newUserWirdController.List)
	master.Put("/user-wird/:id", jwt, newUserWirdController.Update)
	master.Delete("/user-wird/:id", jwt, newUserWirdController.Delete)

	// Muhasabah Harian (protected)
	master.Post("/muhasabah", jwt, newMuhasabahController.Create)
	master.Get("/muhasabah", jwt, newMuhasabahController.FindAll)
	master.Get("/muhasabah/:id", jwt, newMuhasabahController.FindByID)
	master.Put("/muhasabah/:id", jwt, newMuhasabahController.Update)
	master.Delete("/muhasabah/:id", jwt, newMuhasabahController.Delete)

	// Target Belajar / Study Goals (protected)
	master.Post("/goals", jwt, newGoalController.Create)
	master.Get("/goals", jwt, newGoalController.FindAll)
	master.Put("/goals/:id", jwt, newGoalController.Update)
	master.Delete("/goals/:id", jwt, newGoalController.Delete)

	// #41 Kiblat Finder (public)
	master.Get("/kiblat", newKiblatController.Calculate)

	// #42 Jadwal Sholat (public)
	master.Get("/sholat-times", newPrayerTimesController.GetByDate)
	master.Get("/sholat-times/week", newPrayerTimesController.GetWeekly)

	// #43 Imsakiyah Ramadan (public)
	master.Get("/imsakiyah", newPrayerTimesController.GetImsakiyah)

	// #44 Islamic History Timeline (public read, editor/admin write)
	master.Get("/history", newHistoryController.FindAll)
	master.Get("/history/:slug", newHistoryController.FindBySlug)
	master.Post("/history", middlewares.EditorOrAdminMiddleware(), newHistoryController.Create)
	master.Put("/history/:id", middlewares.EditorOrAdminMiddleware(), newHistoryController.Update)
	master.Delete("/history/:id", middlewares.EditorOrAdminMiddleware(), newHistoryController.Delete)

	// #45 Manasik Haji & Umrah (public)
	master.Get("/manasik/:type", newManasikController.FindByType)
	master.Get("/manasik/:type/:step", newManasikController.FindByStep)

	// #46 Quiz & Flashcard (session: public; submit/stats: protected; create/delete: admin)
	master.Get("/quiz/session", newQuizController.GetSession)
	master.Post("/quiz/submit", jwt, newQuizController.Submit)
	master.Get("/quiz/stats", jwt, newQuizController.GetStats)
	master.Post("/quiz", admin, newQuizController.Create)
	master.Delete("/quiz/:id", admin, newQuizController.Delete)

	// #47 Notes & Anotasi (protected)
	master.Get("/notes", jwt, newNoteController.FindAll)
	master.Post("/notes", jwt, newNoteController.Create)
	master.Put("/notes/:id", jwt, newNoteController.Update)
	master.Delete("/notes/:id", jwt, newNoteController.Delete)

	// #48 Kamus Istilah Islam (public read, admin write)
	master.Get("/dictionary", newDictionaryController.FindAll)
	master.Get("/dictionary/category/:category", newDictionaryController.FindByCategory)
	master.Get("/dictionary/:term", newDictionaryController.FindByTerm)
	master.Post("/dictionary", admin, newDictionaryController.Create)
	master.Put("/dictionary/:id", admin, newDictionaryController.Update)
	master.Delete("/dictionary/:id", admin, newDictionaryController.Delete)

	// #49 Diskusi & Komentar (public read, protected write)
	master.Get("/comments", newCommentController.FindByRef)
	master.Post("/comments", jwt, newCommentController.Create)
	master.Delete("/comments/:id", jwt, newCommentController.Delete)

	// #50 Open API & Partner Integration (protected — JWT user)
	master.Post("/developer/register", jwt, newAPIKeyController.Register)
	master.Get("/developer/keys", jwt, newAPIKeyController.List)
	master.Post("/developer/keys", jwt, newAPIKeyController.Create)
	master.Delete("/developer/keys/:id", jwt, newAPIKeyController.Revoke)

	apiKeyAuth := func(c *fiber.Ctx) error {
		apiKey := c.Get("X-API-Key")
		if apiKey == "" {
			return c.Status(401).JSON(map[string]interface{}{"error": "unauthorized"})
		}
		if _, err := newServices.APIKey.Validate(apiKey); err != nil {
			return c.Status(401).JSON(map[string]interface{}{"error": "unauthorized"})
		}
		return c.Next()
	}
	apiKeyLimiter := limiter.New(limiter.Config{
		Max:        120,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			if key := c.Get("X-API-Key"); key != "" {
				return key
			}
			return c.IP()
		},
	})
	developer := master.Group("/developer", apiKeyAuth, apiKeyLimiter)
	developer.Get("/content/quran/surah/:number", newSurahController.FindByNumber)
	developer.Get("/content/quran/ayah/:id", newAyahController.FindById)
	developer.Get("/content/hadith/:id", newHadithController.FindById)
	developer.Get("/content/doa", newDoaController.FindAll)
	developer.Get("/content/asmaul-husna", newAsmaUlHusnaController.FindAll)
	developer.Get("/content/dzikir", newDzikirController.FindAll)

	// #24 Kalender Hijriah (public)
	master.Get("/hijri/today", newHijriController.Today)
	master.Get("/hijri/convert", newHijriController.Convert)
	master.Get("/hijri/events", newHijriController.GetEvents)
	master.Get("/hijri/events/:month", newHijriController.GetEventsByMonth)

	// #25 Asbabun Nuzul (public read, editor/admin write)
	master.Get("/asbabun-nuzul/ayah/:id", newAsbabunNuzulController.FindByAyahID)
	master.Get("/asbabun-nuzul/surah/:number", newAsbabunNuzulController.FindBySurahNumber)
	master.Post("/asbabun-nuzul", middlewares.EditorOrAdminMiddleware(), newAsbabunNuzulController.Create)
	master.Put("/asbabun-nuzul/:id", middlewares.EditorOrAdminMiddleware(), newAsbabunNuzulController.Update)
	master.Delete("/asbabun-nuzul/:id", middlewares.EditorOrAdminMiddleware(), newAsbabunNuzulController.Delete)

	// Muroja'ah session (protected)
	master.Get("/murojaah/session", jwt, newMurojaahController.GetSession)

	// Ilmu Rijal: Perawi, Sanad, Jarh wa Ta'dil, Takhrij
	newPerawiController := controllers.NewPerawiController(newServices)
	newJarhTadilController := controllers.NewJarhTadilController(newServices)
	newSanadController := controllers.NewSanadController(newServices)
	newTakhrijController := controllers.NewTakhrijController(newServices)

	// #51 Perawi (public read, editor/admin write)
	master.Get("/perawi", newPerawiController.FindAll)
	master.Get("/perawi/search", newPerawiController.Search)
	master.Get("/perawi/tabaqah/:tabaqah", newPerawiController.FindByTabaqah)
	master.Get("/perawi/:id", newPerawiController.FindByID)
	master.Get("/perawi/:id/guru", newPerawiController.FindGuru)
	master.Get("/perawi/:id/murid", newPerawiController.FindMurid)
	master.Get("/perawi/:id/jarh-tadil", newJarhTadilController.FindByPerawiID)
	master.Post("/perawi", middlewares.EditorOrAdminMiddleware(), newPerawiController.Create)
	master.Put("/perawi/:id", middlewares.EditorOrAdminMiddleware(), newPerawiController.UpdateByID)
	master.Delete("/perawi/:id", middlewares.EditorOrAdminMiddleware(), newPerawiController.DeleteByID)

	// #52 Jarh wa Ta'dil (public read, editor/admin write)
	master.Get("/jarh-tadil", newJarhTadilController.FindAll)
	master.Get("/jarh-tadil/:id", newJarhTadilController.FindByID)
	master.Post("/jarh-tadil", middlewares.EditorOrAdminMiddleware(), newJarhTadilController.Create)
	master.Put("/jarh-tadil/:id", middlewares.EditorOrAdminMiddleware(), newJarhTadilController.UpdateByID)
	master.Delete("/jarh-tadil/:id", middlewares.EditorOrAdminMiddleware(), newJarhTadilController.DeleteByID)

	// hadith sub-resources (sanad & takhrij)
	master.Get("/hadiths/:id/sanad", newSanadController.FindByHadithID)
	master.Get("/hadiths/:id/takhrij", newTakhrijController.FindByHadithID)

	// #53 Sanad & Mata Sanad (public read, editor/admin write)
	master.Get("/sanad/:id", newSanadController.FindByID)
	master.Post("/sanad", middlewares.EditorOrAdminMiddleware(), newSanadController.Create)
	master.Put("/sanad/:id", middlewares.EditorOrAdminMiddleware(), newSanadController.UpdateByID)
	master.Delete("/sanad/:id", middlewares.EditorOrAdminMiddleware(), newSanadController.DeleteByID)
	master.Post("/sanad/:id/mata-sanad", middlewares.EditorOrAdminMiddleware(), newSanadController.AddMataSanad)
	master.Put("/mata-sanad/:id", middlewares.EditorOrAdminMiddleware(), newSanadController.UpdateMataSanad)
	master.Delete("/mata-sanad/:id", middlewares.EditorOrAdminMiddleware(), newSanadController.DeleteMataSanad)

	// #54 Takhrij (public read, editor/admin write)
	master.Get("/takhrij", newTakhrijController.FindAll)
	master.Get("/takhrij/:id", newTakhrijController.FindByID)
	master.Post("/takhrij", middlewares.EditorOrAdminMiddleware(), newTakhrijController.Create)
	master.Put("/takhrij/:id", middlewares.EditorOrAdminMiddleware(), newTakhrijController.UpdateByID)
	master.Delete("/takhrij/:id", middlewares.EditorOrAdminMiddleware(), newTakhrijController.DeleteByID)
}
