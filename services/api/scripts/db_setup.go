//go:build ignore

// db_setup.go — jalankan migration + seeder lalu exit.
// Gunakan ini untuk setup DB dari nol tanpa menjalankan HTTP server.
//
// Usage:
//
//	go run scripts/db_setup.go                      # baca .env.local
//	go run scripts/db_setup.go -environment docker  # baca env var OS (docker / k8s)
//	go run scripts/db_setup.go -environment development
//
// Working directory harus di services/api/ supaya data/ bisa ditemukan.

package main

import (
	"flag"
	"log"
	"os"
	"time"

	"github.com/agambondan/islamic-explorer/app/config"
	"github.com/agambondan/islamic-explorer/app/db"
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/go-redis/redis/v8"
	"github.com/spf13/viper"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	envFlag := flag.String("environment", "", "local (default) | development | docker | staging | production")
	flag.Parse()

	switch *envFlag {
	case "development":
		if err := lib.LoadEnvironmentLocalFlag(".env.development"); err != nil {
			log.Fatalf("load .env.development: %v", err)
		}
	case "staging":
		if err := lib.LoadEnvironmentLocalFlag(".env.staging"); err != nil {
			log.Fatalf("load .env.staging: %v", err)
		}
	case "production":
		if err := lib.LoadEnvironmentLocalFlag(".env.production"); err != nil {
			log.Fatalf("load .env.production: %v", err)
		}
	case "docker", "container":
		viper.AutomaticEnv()
	default:
		if err := lib.LoadEnvironmentLocalFlag(".env.local"); err != nil {
			log.Printf("warn: .env.local tidak ditemukan, lanjut dari OS env: %v", err)
			viper.AutomaticEnv()
		}
	}

	env := config.Environment{}
	dbEnv := env.Init()

	// Redis opsional — cache saja, seeder tetap jalan tanpa Redis.
	var redisClient *redis.Client
	redisSvc, err := db.NewRedisDB(dbEnv)
	if err != nil {
		log.Printf("[db-setup] warn: Redis tidak tersedia (%v) — lanjut tanpa cache", err)
	} else {
		redisClient = redisSvc.Client
	}

	log.Println("[db-setup] Membuka koneksi database...")
	gormDB := db.NewPostgresql(dbEnv)

	repos, err := repository.NewRepositories(gormDB, redisClient)
	if err != nil {
		log.Fatalf("[db-setup] NewRepositories gagal: %v", err)
	}

	log.Println("[db-setup] Menjalankan AutoMigrate...")
	t := time.Now()
	if err := repos.Migrations(); err != nil {
		log.Fatalf("[db-setup] Migrations gagal: %v", err)
	}
	log.Printf("[db-setup] Migrations selesai (%.1fs)", time.Since(t).Seconds())

	log.Println("[db-setup] Menjalankan Seeder...")
	t = time.Now()
	if err := repos.Seeder(); err != nil {
		log.Fatalf("[db-setup] Seeder gagal: %v", err)
	}
	log.Printf("[db-setup] Seeder selesai (%.1fs)", time.Since(t).Seconds())

	log.Println("[db-setup] Selesai. Database siap.")
	os.Exit(0)
}
