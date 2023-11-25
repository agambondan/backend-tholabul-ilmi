package repository

import (
	"log"
	"time"

	"github.com/agambondan/islamic-explorer/app/db/migrations"
	"github.com/go-redis/redis/v8"
	"github.com/morkid/gocache"
	cache_redis "github.com/morkid/gocache-redis/v8"
	"github.com/morkid/paginate"
	"github.com/spf13/viper"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Repositories struct {
	Ayah  AyahRepository
	Surah SurahRepository
	Juz   JuzRepository
	db    *gorm.DB
	pg    *paginate.Pagination
}

func NewRepositories(db *gorm.DB, client *redis.Client) (*Repositories, error) {
	var cache *gocache.AdapterInterface
	cacheSeconds := viper.GetInt64("CACHE_TTL_SECONDS")

	if nil != client && cacheSeconds > 0 {
		cache = cache_redis.NewRedisCache(cache_redis.RedisCacheConfig{
			Client:    client,
			ExpiresIn: time.Duration(cacheSeconds) * time.Second,
		})
	}
	log.Println(cache)

	pg := paginate.New(&paginate.Config{
		// CacheAdapter:         cache,
		FieldSelectorEnabled: true,
	})

	return &Repositories{
		Ayah:  NewAyahRepository(db, pg),
		Surah: NewSurahRepository(db, pg),
		Juz:   NewJuzRepository(db, pg),
		db:    db,
		pg:    pg,
	}, nil
}

// Close closes the  database connection
func (s *Repositories) Close() error {
	db, _ := s.db.DB()
	return db.Close()
}

// Migrations convert model to design table
func (s *Repositories) Migrations() error {
	err := s.db.AutoMigrate(migrations.ModelMigrations...)
	if err != nil {
		return err
	}
	err = s.db.Migrator().DropTable("schema_migration")
	if err != nil {
		return err
	}
	return nil
}

// Seeder is insert data to table
func (s *Repositories) Seeder() error {
	seeds := migrations.DataSeeds(s.db)
	for i := range seeds {
		tx := s.db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()

		if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(seeds[i]).Error; nil != err {
			tx.Rollback()
		}

		if err := tx.Commit().Error; nil != err {
			tx.Rollback()
		}
	}
	return nil
}

func (s *Repositories) AddForeignKey() error {
	var err error
	return err
}
