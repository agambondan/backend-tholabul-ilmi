package main

import (
	"flag"
	"log"

	"github.com/agambondan/islamic-explorer/app/config"
	"github.com/agambondan/islamic-explorer/app/db"
	"github.com/agambondan/islamic-explorer/app/http"
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/repository"
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
	// it shows your line code while print
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	environment := config.Environment{}
	env := environment.Init()

	log.Println(lib.ConvertJsonToStr(env))

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

	app := fiber.New(fiber.Config{
		Prefork: viper.GetString("PREFORK") == "true",
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
	default:
		if err := lib.LoadEnvironmentLocalFlag(".env.local"); err != nil {
			panic(err)
		}
	}
}
