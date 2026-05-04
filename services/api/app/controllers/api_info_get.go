package controllers

import (
	"github.com/agambondan/islamic-explorer/app/lib"

	"github.com/gofiber/fiber/v2"
)

// GetAPIIndex index page
// @Summary show basic response
// @Description show basic response
// @Accept  application/json
// @Produce  application/json
// @Success 200 {object} lib.Response "success"
// @Failure 400 {object} lib.Response "bad request"
// @Failure 404 {object} lib.Response "not found"
// @Failure 409 {object} lib.Response "conflict"
// @Failure 500 {object} lib.Response "internal error"
// @Router /master/ [get]
// @Tags API
func GetAPIIndex(c *fiber.Ctx) error {
	return lib.OK(c)
}

// GetAPIInfo func
// @Summary show info response
// @Description show info response
// @Accept  application/json
// @Produce  application/json
// @Success 200 {object} map[string]interface{} "success"
// @Failure 400 {object} lib.Response "bad request"
// @Failure 404 {object} lib.Response "not found"
// @Failure 409 {object} lib.Response "conflict"
// @Failure 500 {object} lib.Response "internal error"
// @Router /master/info [get]
// @Tags API
func GetAPIInfo(c *fiber.Ctx) error {
	info := fiber.Map{
		"id":           "app_id",
		"version":      "v1.0.0",
		"name":         "wedding web",
		"description":  "wedding web is a platform to share e invitation to your friend, family, etc.",
		"dependencies": fiber.Map{},
	}

	return lib.OK(c, info)
}

// GetHealth func
// @Summary show info response
// @Description show info response
// @Accept  application/json
// @Produce  application/json
// @Success 200 {object} map[string]interface{} "success"
// @Failure 400 {object} lib.Response "bad request"
// @Failure 404 {object} lib.Response "not found"
// @Failure 409 {object} lib.Response "conflict"
// @Failure 500 {object} lib.Response "internal error"
// @Router /master/health [get]
// @Tags API
func GetHealth(c *fiber.Ctx) error {
	info := fiber.Map{
		"id":           "app_id",
		"version":      "v1.0.0",
		"name":         "wedding web",
		"description":  "wedding web is a platform to share e invitation to your friend, family, etc.",
		"dependencies": fiber.Map{},
	}

	return lib.OK(c, info)
}
