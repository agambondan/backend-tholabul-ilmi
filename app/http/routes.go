package http

import (
	"encoding/json"
	"os"

	"github.com/agambondan/islamic-explorer/app/controllers"
	"github.com/agambondan/islamic-explorer/app/http/middlewares"
	"github.com/agambondan/islamic-explorer/app/repository"
	service "github.com/agambondan/islamic-explorer/app/services"
	_ "github.com/agambondan/islamic-explorer/docs"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/swagger"
	"github.com/spf13/viper"
)

// Handle all request to route to controller
func Handle(app *fiber.App, repo *repository.Repositories) {
	app.Use(recover.New(recover.Config{EnableStackTrace: true}))
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

	master := app.Group(viper.GetString("ENDPOINT"))
	master.Get("/", controllers.GetAPIIndex)
	master.Get("/info", controllers.GetAPIInfo)
	master.Get("/swagger.json", func(c *fiber.Ctx) error {
		response := make(map[string]interface{})
		b, err := os.ReadFile(`docs/swagger.json`)
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

	// Auth (public)
	master.Post("/auth/register", newUserController.Register)
	master.Post("/auth/login", newUserController.Login)

	// Search (public)
	master.Get("/search", newSearchController.Search)

	// Ayah
	master.Post("/ayah", newAyahController.Create)
	master.Get("/ayah", newAyahController.FindAll)
	master.Get("/ayah/:id", newAyahController.FindById)
	master.Get("/ayah/number/:number", newAyahController.FindByNumber)
	master.Get("/ayah/surah/number/:number", newAyahController.FindBySurahNumber)
	master.Put("/ayah/:id", newAyahController.UpdateById)
	master.Delete("/ayah/:id/:scoped", newAyahController.DeleteById)

	// Surah
	master.Post("/surah", newSurahController.Create)
	master.Get("/surah", newSurahController.FindAll)
	master.Get("/surah/:id", newSurahController.FindById)
	master.Get("/surah/number/:number", newSurahController.FindByNumber)
	master.Get("/surah/name/:name", newSurahController.FindByName)
	master.Put("/surah/:id", newSurahController.UpdateById)
	master.Delete("/surah/:id/:scoped", newSurahController.DeleteById)

	// Juz
	master.Post("/juz", newJuzController.Create)
	master.Get("/juz", newJuzController.FindAll)
	master.Get("/juz/:id", newJuzController.FindById)
	master.Get("/juz/surah/:name", newJuzController.FindBySurahName)
	master.Put("/juz/:id", newJuzController.UpdateById)
	master.Delete("/juz/:id/:scoped", newJuzController.DeleteById)

	// Book
	master.Post("/books", newBookController.Create)
	master.Get("/books", newBookController.FindAll)
	master.Get("/books/:id", newBookController.FindById)
	master.Get("/books/slug/:slug", newBookController.FindBySlug)
	master.Put("/books/:id", newBookController.UpdateById)
	master.Delete("/books/:id", newBookController.DeleteById)

	// Theme
	master.Post("/themes", newThemeController.Create)
	master.Get("/themes", newThemeController.FindAll)
	master.Get("/themes/:id", newThemeController.FindById)
	master.Get("/themes/book/:slug", newThemeController.FindByBookSlug)
	master.Put("/themes/:id", newThemeController.UpdateById)
	master.Delete("/themes/:id", newThemeController.DeleteById)

	// Chapter
	master.Post("/chapters", newChapterController.Create)
	master.Get("/chapters", newChapterController.FindAll)
	master.Get("/chapters/:id", newChapterController.FindById)
	master.Get("/chapters/book/:slug/theme/:themeId", newChapterController.FindByBookSlugThemeId)
	master.Get("/chapters/theme/:id", newChapterController.FindByThemeId)
	master.Put("/chapters/:id", newChapterController.UpdateById)
	master.Delete("/chapters/:id", newChapterController.DeleteById)

	// Hadith
	master.Post("/hadiths", newHadithController.Create)
	master.Get("/hadiths", newHadithController.FindAll)
	master.Get("/hadiths/:id", newHadithController.FindById)
	master.Get("/hadiths/book/:slug", newHadithController.FindByBookSlug)
	master.Get("/hadiths/theme/:id", newHadithController.FindByThemeId)
	master.Get("/hadiths/theme/slug/:slug", newHadithController.FindByThemeName)
	master.Get("/hadiths/book/:slug/theme/:themeId", newHadithController.FindByBookSlugThemeId)
	master.Get("/hadiths/chapter/:id", newHadithController.FindByChapterId)
	master.Get("/hadiths/book/slug/chapter/:id", newHadithController.FindByBookSlugChapterId)
	master.Get("/hadiths/theme/:themeId/chapter/:chapterId", newHadithController.FindByThemeIdChapterId)
	master.Get("/hadiths/book/:slug/theme/:themeId/chapter/:chapterId", newHadithController.FindByBookSlugThemeIdChapterId)
	master.Put("/hadiths/:id", newHadithController.UpdateById)
	master.Delete("/hadiths/:id", newHadithController.DeleteById)

	// Protected routes (JWT required)
	jwt := middlewares.JWTAuth()

	// Auth & Users
	master.Get("/auth/me", jwt, newUserController.Me)
	master.Put("/auth/password", jwt, newUserController.UpdatePassword)
	master.Get("/users", jwt, newUserController.FindAll)
	master.Get("/users/:id", jwt, newUserController.FindById)
	master.Put("/users/:id", jwt, newUserController.UpdateById)
	master.Delete("/users/:id", jwt, newUserController.DeleteById)

	// Bookmark
	master.Post("/bookmarks", jwt, newBookmarkController.Add)
	master.Get("/bookmarks", jwt, newBookmarkController.FindAll)
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
}
