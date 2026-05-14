package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type ChapterController interface {
	Create(ctx *fiber.Ctx) error
	FindAll(ctx *fiber.Ctx) error
	FindById(ctx *fiber.Ctx) error
	FindByBookSlugThemeId(ctx *fiber.Ctx) error
	FindByThemeId(ctx *fiber.Ctx) error
	UpdateById(ctx *fiber.Ctx) error
	DeleteById(ctx *fiber.Ctx) error
}

type chapterController struct {
	chapter service.ChapterService
}

// NewChapterController implements the ChapterController Interface
func NewChapterController(services *service.Services) ChapterController {
	return &chapterController{services.Chapter}
}

// Create chapter
// @Summary Create chapter
// @Description Create a new chapter entry
// @Accept json
// @Produce json
// @Param body body model.Chapter true "Chapter data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 409 {object} lib.Response
// @Router /api/v1/chapters [post]
// @Tags Chapters
func (c *chapterController) Create(ctx *fiber.Ctx) error {
	data := new(model.Chapter)
	if err := lib.BodyParser(ctx, data); nil != err {
		return lib.ErrorBadRequest(ctx, err)
	}
	if _, err := c.chapter.Create(data); err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, data)
}

// FindAll chapter
// @Summary List all chapters
// @Description Get paginated list of all chapters
// @Accept json
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Router /api/v1/chapters [get]
// @Tags Chapters
func (c *chapterController) FindAll(ctx *fiber.Ctx) error {
	page := c.chapter.FindAll(ctx)
	return lib.OK(ctx, page)
}

// FindById chapter
// @Summary Get chapter by ID
// @Description Get a single chapter by its ID
// @Accept json
// @Produce json
// @Param id path int true "Chapter ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/chapters/{id} [get]
// @Tags Chapters
func (c *chapterController) FindById(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.chapter.FindById(&id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

// FindByBookSlugThemeId chapter
// @Summary Get chapters by book slug and theme ID
// @Description Get chapters filtered by book slug and theme ID
// @Accept json
// @Produce json
// @Param slug path string true "Book slug"
// @Param themeId path int true "Theme ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/chapters/book/{slug}/theme/{themeId} [get]
// @Tags Chapters
func (c *chapterController) FindByBookSlugThemeId(ctx *fiber.Ctx) error {
	bookSlug := ctx.Params("slug")
	themeId, err := strconv.Atoi(ctx.Params("themeId"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.chapter.FindByBookSlugThemeId(ctx, &bookSlug, &themeId)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

// FindByThemeId chapter
// @Summary Get chapters by theme ID
// @Description Get chapters filtered by theme ID
// @Accept json
// @Produce json
// @Param id path int true "Theme ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/chapters/theme/{id} [get]
// @Tags Chapters
func (c *chapterController) FindByThemeId(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.chapter.FindByThemeId(ctx, &id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

// UpdateById chapter
// @Summary Update chapter
// @Description Update chapter by ID
// @Accept json
// @Produce json
// @Param id path int true "Chapter ID"
// @Param body body model.Chapter true "Chapter data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/chapters/{id} [put]
// @Tags Chapters
func (c *chapterController) UpdateById(ctx *fiber.Ctx) error {
	data := new(model.Chapter)
	if err := lib.BodyParser(ctx, data); nil != err {
		return lib.ErrorBadRequest(ctx, err)
	}
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if _, err = c.chapter.UpdateById(&id, data); err != nil {
		return lib.ErrorNotFound(ctx, err.Error())
	}
	return lib.OK(ctx, data)
}

// DeleteById chapter
// @Summary Delete chapter
// @Description Delete chapter by ID
// @Accept json
// @Produce json
// @Param id path int true "Chapter ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/chapters/{id} [delete]
// @Tags Chapters
func (c *chapterController) DeleteById(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	scoped := ctx.Params("scoped")
	err = c.chapter.DeleteById(&id, &scoped)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
