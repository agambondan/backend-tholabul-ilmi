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
