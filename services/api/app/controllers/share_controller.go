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

// ShareAyah Get ayah sharing metadata
// @Summary Get ayah sharing metadata
// @Tags Share
// @Accept json
// @Produce json
// @Param id path int true "Ayah ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /share/ayah/{id} [get]
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

// ShareHadith Get hadith sharing metadata
// @Summary Get hadith sharing metadata
// @Tags Share
// @Accept json
// @Produce json
// @Param id path int true "Hadith ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /share/hadith/{id} [get]
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
