package main

import (
	"fmt"
	"log"

	"github.com/agambondan/islamic-explorer/app/model"
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
		log.Fatal(err)
	}

	var user model.User
	if err := db.First(&user).Error; err != nil {
		fmt.Println("No users found")
	} else {
		fmt.Printf("User found: %s (%s)\n", user.ID, *user.Email)
	}

	var ayah model.Ayah
	if err := db.First(&ayah).Error; err != nil {
		fmt.Println("No ayahs found")
	} else {
		fmt.Printf("Ayah found: ID=%d, Number=%d\n", *ayah.ID, *ayah.Number)
	}
}
