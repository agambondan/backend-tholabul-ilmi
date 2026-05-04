package main

import (
	"context"
	"flag"
	"log"
	"log/slog"
	"os"
	"time"

	"github.com/agambondan/islamic-explorer/app/config"
	"github.com/agambondan/islamic-explorer/app/db"
	"github.com/agambondan/islamic-explorer/app/http"
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/repository"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
	"github.com/spf13/viper"
)

// @title Master API
// @version 1.0.0
// @description API Documentation
// @termsOfService https://e-invitation.com/tnc.html
// @contact.name Developer
// @contact.email e-invitation@gmail.com
// @host https://wedding-be-cxvkr667ca-et.a.run.app:9999
// @schemes https http
// @BasePath /api/v1/
// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	if viper.GetString("ENVIRONMENT") == "production" {
		slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
	} else {
		slog.SetDefault(slog.New(slog.NewTextHandler(os.Stdout, nil)))
	}
	environment := config.Environment{}
	env := environment.Init()

	redisDB, err := db.NewRedisDB(env)
	if err != nil {
		panic(err)
	}

	newPostgresql := db.NewPostgresql(env)

	newRepositories, err := repository.NewRepositories(newPostgresql, redisDB.Client)
	if err != nil {
		panic(err)
	}
	err = newRepositories.Migrations()
	if err != nil {
		panic(err)
	}
	err = newRepositories.Seeder()
	if err != nil {
		panic(err)
	}
	err = newRepositories.AddForeignKey()
	if err != nil {
		panic(err)
	}

	services := service.NewServices(newRepositories)
	services.Notification.StartReminderScheduler(context.Background(), time.Minute)

	app := fiber.New(fiber.Config{
		Prefork:   viper.GetString("PREFORK") == "true",
		BodyLimit: 4 * 1024 * 1024, // 4 MB
	})

	http.Handle(app, newRepositories)

	log.Fatal(app.Listen(":" + viper.GetString("PORT")))
}

func init() {
	env := flag.String("environment", "", "set environment")
	flag.Parse()
	switch *env {
	case "development":
		if err := lib.LoadEnvironmentLocalFlag(".env.development"); err != nil {
			panic(err)
		}
	case "staging":
		if err := lib.LoadEnvironmentLocalFlag(".env.staging"); err != nil {
			panic(err)
		}
	case "production":
		if err := lib.LoadEnvironmentLocalFlag(".env.production"); err != nil {
			panic(err)
		}
	case "container":
		// Baca langsung dari OS env vars (docker-compose / k8s)
		viper.AutomaticEnv()
	default:
		if err := lib.LoadEnvironmentLocalFlag(".env.local"); err != nil {
			panic(err)
		}
	}
}
