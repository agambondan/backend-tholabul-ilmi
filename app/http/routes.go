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
	// recover panic
	app.Use(recover.New())
	// for logger in cmd
	app.Use(logger.New())
	// Security Headers like xhr, csrf and many things
	app.Use(middlewares.SecurityHeaders())
	// middleware for resource sharing to public
	app.Use(middlewares.Cors())

	newServices := service.NewServices(repo)
	newAyahController := controllers.NewAyahController(newServices)
	newSurahController := controllers.NewSurahController(newServices)
	newJuzController := controllers.NewJuzController(newServices)

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
}
