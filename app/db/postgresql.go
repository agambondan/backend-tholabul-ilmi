package db

import (
	"database/sql"
	"fmt"

	"github.com/agambondan/islamic-explorer/app/config"
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/spf13/viper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

func NewPostgresql(env *config.Environment) *gorm.DB {
	logLevel := logger.Info

	switch viper.GetString("ENVIRONMENT") {
	case "staging":
		logLevel = logger.Error
	case "production":
		logLevel = logger.Silent
	}

	if env == nil {
		env.DBTablePrefix = lib.Strptr(viper.GetString("DB_TABLE_PREFIX"))
	}

	config := gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		NamingStrategy: schema.NamingStrategy{
			TablePrefix:   viper.GetString("DB_TABLE_PREFIX"),
			SingularTable: true,
		},
		DisableForeignKeyConstraintWhenMigrating: false,
	}

	var dsn string

	if env != nil {
		dsn = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Jakarta",
			*env.DBHost,
			*env.DBPort,
			*env.DBUser,
			*env.DBPassword,
			*env.DBName,
		)
	} else {
		dsn = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Jakarta",
			viper.GetString("DB_HOST"),
			viper.GetString("DB_PORT"),
			viper.GetString("DB_USER"),
			viper.GetString("DB_PASS"),
			viper.GetString("DB_NAME"),
		)
	}

	sqlDB, err := sql.Open("pgx", dsn)
	if err != nil {
		panic(err)
	}
	// https://aws.amazon.com/blogs/database/performance-impact-of-idle-postgresql-connections
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetMaxIdleConns(10)

	db, err := gorm.Open(postgres.New(postgres.Config{
		Conn: sqlDB,
	}), &config)

	if nil != err {
		panic(err)
	}

	return db
}
