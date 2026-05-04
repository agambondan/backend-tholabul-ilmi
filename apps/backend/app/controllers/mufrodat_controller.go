package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type MufrodatController interface {
	FindByAyahID(ctx *fiber.Ctx) error
	FindByRootWord(ctx *fiber.Ctx) error
}

type mufrodatController struct {
	svc service.MufrodatService
}

func NewMufrodatController(services *service.Services) MufrodatController {
	return &mufrodatController{services.Mufrodat}
}

func (c *mufrodatController) FindByAyahID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	items, err := c.svc.FindByAyahID(id)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, items)
}

func (c *mufrodatController) FindByRootWord(ctx *fiber.Ctx) error {
	word := ctx.Params("word")
	if word == "" {
		return lib.ErrorBadRequest(ctx, "word is required")
	}
	items, err := c.svc.FindByRootWord(word)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, items)
}
