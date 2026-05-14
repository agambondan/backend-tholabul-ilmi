package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type MufrodatController interface {
	FindByAyahID(ctx *fiber.Ctx) error
	FindBySurahNumber(ctx *fiber.Ctx) error
	FindBySurahAndAyahNumber(ctx *fiber.Ctx) error
	FindByPage(ctx *fiber.Ctx) error
	FindByRootWord(ctx *fiber.Ctx) error
}

type mufrodatController struct {
	svc service.MufrodatService
}

func NewMufrodatController(services *service.Services) MufrodatController {
	return &mufrodatController{services.Mufrodat}
}

// FindByAyahID mufrodat
// @Summary Get mufrodat by ayah ID
// @Description Get word-by-word translation for a specific ayah
// @Accept json
// @Produce json
// @Param id path int true "Ayah ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/mufrodat/ayah/{id} [get]
// @Tags Mufrodat
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

// FindBySurahNumber mufrodat
// @Summary Get mufrodat by surah number
// @Description Get word-by-word translations for all ayah in a surah
// @Accept json
// @Produce json
// @Param number path int true "Surah number"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/mufrodat/surah/{number} [get]
// @Tags Mufrodat
func (c *mufrodatController) FindBySurahNumber(ctx *fiber.Ctx) error {
	number, err := strconv.Atoi(ctx.Params("number"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid surah number")
	}
	items, err := c.svc.FindBySurahNumber(number)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, items)
}

// FindBySurahAndAyahNumber mufrodat
// @Summary Get mufrodat by surah and ayah number
// @Description Get word-by-word translation for a specific ayah by surah and ayah number
// @Accept json
// @Produce json
// @Param surah path int true "Surah number"
// @Param ayah path int true "Ayah number"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/mufrodat/surah/{surah}/ayah/{ayah} [get]
// @Tags Mufrodat
func (c *mufrodatController) FindBySurahAndAyahNumber(ctx *fiber.Ctx) error {
	surahNumber, err := strconv.Atoi(ctx.Params("surah"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid surah number")
	}
	ayahNumber, err := strconv.Atoi(ctx.Params("ayah"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid ayah number")
	}
	items, err := c.svc.FindBySurahAndAyahNumber(surahNumber, ayahNumber)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, items)
}

// FindByPage mufrodat
// @Summary Get mufrodat by page
// @Description Get word-by-word translations for all ayah on a specific page
// @Accept json
// @Produce json
// @Param page path int true "Page number"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/mufrodat/page/{page} [get]
// @Tags Mufrodat
func (c *mufrodatController) FindByPage(ctx *fiber.Ctx) error {
	page, err := strconv.Atoi(ctx.Params("page"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid page")
	}
	items, err := c.svc.FindByPage(page)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, items)
}

// FindByRootWord mufrodat
// @Summary Get mufrodat by root word
// @Description Search word-by-word translations by Arabic root word
// @Accept json
// @Produce json
// @Param word path string true "Root word"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/mufrodat/root/{word} [get]
// @Tags Mufrodat
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
