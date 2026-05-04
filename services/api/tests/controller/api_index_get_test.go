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

// TestGetAPIIndex test
func TestGetAPIIndex(t *testing.T) {
	app := fiber.New()
	app.Get("/", controllers.GetAPIIndex)

	response, _, err := lib.GetTest(app, "/", nil)

	utils.AssertEqual(t, nil, err, "GET /")
	utils.AssertEqual(t, 200, response.StatusCode, "HTTP Status")
}
