package controllers

import (
	"net/url"
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type HadithController interface {
	Create(ctx *fiber.Ctx) error
	FindAll(ctx *fiber.Ctx) error
	FindById(ctx *fiber.Ctx) error
	FindByBookSlug(ctx *fiber.Ctx) error
	FindByThemeId(ctx *fiber.Ctx) error
	FindByThemeName(ctx *fiber.Ctx) error
	FindByBookSlugThemeId(ctx *fiber.Ctx) error
	FindByChapterId(ctx *fiber.Ctx) error
	FindByBookSlugChapterId(ctx *fiber.Ctx) error
	FindByThemeIdChapterId(ctx *fiber.Ctx) error
	FindByBookSlugThemeIdChapterId(ctx *fiber.Ctx) error
	UpdateById(ctx *fiber.Ctx) error
	DeleteById(ctx *fiber.Ctx) error
}

type hadithController struct {
	hadith service.HadithService
}

// NewHadithController implements the HadithController Interface
func NewHadithController(services *service.Services) HadithController {
	return &hadithController{services.Hadith}
}

func (c *hadithController) Create(ctx *fiber.Ctx) error {
	data := new(model.Hadith)
	if err := lib.BodyParser(ctx, data); nil != err {
		return lib.ErrorBadRequest(ctx, err)
	}
	if _, err := c.hadith.Create(data); err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, data)
}

func (c *hadithController) FindAll(ctx *fiber.Ctx) error {
	page := c.hadith.FindAll(ctx)
	return lib.OK(ctx, page)
}

func (c *hadithController) FindById(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.hadith.FindById(&id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

func (c *hadithController) FindByBookSlug(ctx *fiber.Ctx) error {
	bookSlug := ctx.Params("slug")
	data, err := c.hadith.FindByBookSlug(ctx, &bookSlug)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

func (c *hadithController) FindByThemeId(ctx *fiber.Ctx) error {
	themeId, err := strconv.Atoi(ctx.Params("themeId"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.hadith.FindByThemeId(ctx, &themeId)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

func (c *hadithController) FindByThemeName(ctx *fiber.Ctx) error {
	name, err := url.QueryUnescape(ctx.Params("slug"))
	if err != nil {
		return lib.ErrorBadRequest(ctx)
	}
	data, err := c.hadith.FindByThemeName(ctx, &name)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

func (c *hadithController) FindByBookSlugThemeId(ctx *fiber.Ctx) error {
	bookSlug := ctx.Params("slug")
	themeId, err := strconv.Atoi(ctx.Params("themeId"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.hadith.FindByBookSlugThemeId(ctx, &bookSlug, &themeId)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

func (c *hadithController) FindByChapterId(ctx *fiber.Ctx) error {
	chapterId, err := strconv.Atoi(ctx.Params("chapterId"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.hadith.FindByChapterId(ctx, &chapterId)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

func (c *hadithController) FindByBookSlugChapterId(ctx *fiber.Ctx) error {
	bookSlug := ctx.Params("slug")
	chapterId, err := strconv.Atoi(ctx.Params("chapterId"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.hadith.FindByBookSlugChapterId(ctx, &bookSlug, &chapterId)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

func (c *hadithController) FindByThemeIdChapterId(ctx *fiber.Ctx) error {
	chapterId, err := strconv.Atoi(ctx.Params("chapterId"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	themeId, err := strconv.Atoi(ctx.Params("themeId"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.hadith.FindByThemeIdChapterId(ctx, &themeId, &chapterId)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

func (c *hadithController) FindByBookSlugThemeIdChapterId(ctx *fiber.Ctx) error {
	bookSlug := ctx.Params("slug")
	chapterId, err := strconv.Atoi(ctx.Params("chapterId"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	themeId, err := strconv.Atoi(ctx.Params("themeId"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.hadith.FindByBookSlugThemeIdChapterId(ctx, &bookSlug, &themeId, &chapterId)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

func (c *hadithController) UpdateById(ctx *fiber.Ctx) error {
	data := new(model.Hadith)
	if err := lib.BodyParser(ctx, data); nil != err {
		return lib.ErrorBadRequest(ctx, err)
	}
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if _, err = c.hadith.UpdateById(&id, data); err != nil {
		return lib.ErrorNotFound(ctx, err.Error())
	}
	return lib.OK(ctx, data)
}

func (c *hadithController) DeleteById(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	scoped := ctx.Params("scoped")
	err = c.hadith.DeleteById(&id, &scoped)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
