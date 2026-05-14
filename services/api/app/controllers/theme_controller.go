package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type ThemeController interface {
	Create(ctx *fiber.Ctx) error
	FindAll(ctx *fiber.Ctx) error
	FindById(ctx *fiber.Ctx) error
	FindByBookSlug(ctx *fiber.Ctx) error
	UpdateById(ctx *fiber.Ctx) error
	DeleteById(ctx *fiber.Ctx) error
}

type themeController struct {
	theme service.ThemeService
}

// NewThemeController implements the ThemeController Interface
func NewThemeController(services *service.Services) ThemeController {
	return &themeController{services.Theme}
}

// Create theme
// @Summary Create theme
// @Description Create a new theme entry
// @Accept json
// @Produce json
// @Param body body model.Theme true "Theme data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 409 {object} lib.Response
// @Router /api/v1/themes [post]
// @Tags Themes
func (c *themeController) Create(ctx *fiber.Ctx) error {
	data := new(model.Theme)
	if err := lib.BodyParser(ctx, data); nil != err {
		return lib.ErrorBadRequest(ctx, err)
	}
	if _, err := c.theme.Create(data); err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, data)
}

// FindAll theme
// @Summary List all themes
// @Description Get paginated list of all themes
// @Accept json
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Router /api/v1/themes [get]
// @Tags Themes
func (c *themeController) FindAll(ctx *fiber.Ctx) error {
	page := c.theme.FindAll(ctx)
	return lib.OK(ctx, page)
}

// FindById theme
// @Summary Get theme by ID
// @Description Get a single theme by its ID
// @Accept json
// @Produce json
// @Param id path int true "Theme ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/themes/{id} [get]
// @Tags Themes
func (c *themeController) FindById(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.theme.FindById(&id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

// FindByBookSlug theme
// @Summary Get themes by book slug
// @Description Get themes filtered by book slug
// @Accept json
// @Produce json
// @Param slug path string true "Book slug"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/themes/book/{slug} [get]
// @Tags Themes
func (c *themeController) FindByBookSlug(ctx *fiber.Ctx) error {
	slug := ctx.Params("slug")
	data, err := c.theme.FindByBookSlug(ctx, &slug)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

// UpdateById theme
// @Summary Update theme
// @Description Update theme by ID
// @Accept json
// @Produce json
// @Param id path int true "Theme ID"
// @Param body body model.Theme true "Theme data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/themes/{id} [put]
// @Tags Themes
func (c *themeController) UpdateById(ctx *fiber.Ctx) error {
	data := new(model.Theme)
	if err := lib.BodyParser(ctx, data); nil != err {
		return lib.ErrorBadRequest(ctx, err)
	}
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if _, err = c.theme.UpdateById(&id, data); err != nil {
		return lib.ErrorNotFound(ctx, err.Error())
	}
	return lib.OK(ctx, data)
}

// DeleteById theme
// @Summary Delete theme
// @Description Delete theme by ID
// @Accept json
// @Produce json
// @Param id path int true "Theme ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/themes/{id} [delete]
// @Tags Themes
func (c *themeController) DeleteById(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	scoped := ctx.Params("scoped")
	err = c.theme.DeleteById(&id, &scoped)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
