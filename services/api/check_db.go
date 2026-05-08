//go:build ignore

package main

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

func main() {
	dsn := "host=localhost port=54320 user=postgres password=postgres dbname=thullabul_ilmi sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{SingularTable: true},
	})
	if err != nil {
		log.Fatalf("db error: %v", err)
	}

	tables := []string{"surah", "ayah", "hadith", "tafsir", "tafsirweb"}
	for _, t := range tables {
		var count int64
		db.Table(t).Count(&count)
		fmt.Printf("%s: %d\n", t, count)
	}
}
