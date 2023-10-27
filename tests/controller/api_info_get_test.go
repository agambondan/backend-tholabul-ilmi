//go:build !integration
// +build !integration

package controller

import (
	"testing"

	"github.com/agambondan/islamic-explorer/app/controllers"
	"github.com/agambondan/islamic-explorer/app/lib"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/utils"
)

func TestGetAPIInfo(t *testing.T) {
	app := fiber.New()
	app.Get("/info.json", controllers.GetAPIInfo)

	response, _, err := lib.GetTest(app, "/info.json", nil)
	utils.AssertEqual(t, nil, err, "GET /info.json")
	utils.AssertEqual(t, 200, response.StatusCode, "HTTP Status")
}
