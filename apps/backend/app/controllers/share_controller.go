package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type ShareController interface {
	ShareAyah(ctx *fiber.Ctx) error
	ShareHadith(ctx *fiber.Ctx) error
}

type shareController struct {
	ayah   service.AyahService
	hadith service.HadithService
}

func NewShareController(services *service.Services) ShareController {
	return &shareController{services.Ayah, services.Hadith}
}

func (c *shareController) ShareAyah(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	ayah, err := c.ayah.FindById(&id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, ayah)
}

func (c *shareController) ShareHadith(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	hadith, err := c.hadith.FindById(&id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, hadith)
}
