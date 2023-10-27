//go:build !production
// +build !production

package db

import (
	"github.com/agambondan/islamic-explorer/app/db/migrations"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

// DBConnectTest test
func DBConnectTest(database ...string) *gorm.DB {
	dbPath := "file::memory:"
	if len(database) > 0 {
		dbPath = database[0]
		if dbPath == "" {
			dbPath = "file::memory:"
		}
	}

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger:                                   logger.Default.LogMode(logger.Silent),
		DisableForeignKeyConstraintWhenMigrating: true,
		NamingStrategy:                           schema.NamingStrategy{SingularTable: true},
	})
	if nil != err {
		panic(err)
	}

	err = db.AutoMigrate(migrations.ModelMigrations...)
	if nil != err {
		panic(err)
	}
	//DB = db
	//PG = paginate.New()

	return db
}

// DBConnectAndSeedTest connect and seed
func DBConnectAndSeedTest(database ...string) *gorm.DB {
	db := DBConnectTest(database...)
	DBSeedTest(db)
	return db
}

// DBSeedTest seed sample data
func DBSeedTest(db *gorm.DB) error {
	return db.Transaction(func(tx *gorm.DB) error {
		seeds := migrations.DataSeeds(db)
		for i := range seeds {
			if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(seeds[i]).Error; nil != err {
				return err
			}
		}

		return nil
	})
}
