package controllers

import (
	"net/url"
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type JuzController interface {
	Create(ctx *fiber.Ctx) error
	FindAll(ctx *fiber.Ctx) error
	FindById(ctx *fiber.Ctx) error
	FindBySurahName(ctx *fiber.Ctx) error
	UpdateById(ctx *fiber.Ctx) error
	DeleteById(ctx *fiber.Ctx) error
}

type juzController struct {
	juz service.JuzService
}

// NewJuzController implements the JuzController Interface
func NewJuzController(services *service.Services) JuzController {
	return &juzController{services.Juz}
}

// Create juz
// @Summary Create juz
// @Description Create a new juz entry
// @Accept json
// @Produce json
// @Param body body model.Juz true "Juz data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 409 {object} lib.Response
// @Router /juz [post]
// @Tags Juz
func (c *juzController) Create(ctx *fiber.Ctx) error {
	data := new(model.Juz)
	if err := lib.BodyParser(ctx, data); nil != err {
		return lib.ErrorBadRequest(ctx, err)
	}
	if _, err := c.juz.Create(data); err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, data)
}

// FindAll juz
// @Summary List all juz
// @Description Get paginated list of all juz
// @Accept json
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Router /juz [get]
// @Tags Juz
func (c *juzController) FindAll(ctx *fiber.Ctx) error {
	page := c.juz.FindAll(ctx)
	return lib.OK(ctx, page)
}

// FindById juz
// @Summary Get juz by ID
// @Description Get a single juz by its ID
// @Accept json
// @Produce json
// @Param id path int true "Juz ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /juz/{id} [get]
// @Tags Juz
func (c *juzController) FindById(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.juz.FindById(&id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

// FindBySurahName juz
// @Summary Get juz by surah name
// @Description Find which juz contains a surah by name
// @Accept json
// @Produce json
// @Param name path string true "Surah name"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /juz/surah/{name} [get]
// @Tags Juz
func (c *juzController) FindBySurahName(ctx *fiber.Ctx) error {
	decodedString, err := url.QueryUnescape(ctx.Params("name"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.juz.FindBySurahName(ctx, lib.Strptr(decodedString))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

// UpdateById juz
// @Summary Update juz
// @Description Update juz by ID
// @Accept json
// @Produce json
// @Param id path int true "Juz ID"
// @Param body body model.Juz true "Juz data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /juz/{id} [put]
// @Tags Juz
func (c *juzController) UpdateById(ctx *fiber.Ctx) error {
	data := new(model.Juz)
	if err := lib.BodyParser(ctx, data); nil != err {
		return lib.ErrorBadRequest(ctx, err)
	}
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if _, err = c.juz.UpdateById(&id, data); err != nil {
		return lib.ErrorNotFound(ctx, err.Error())
	}
	return lib.OK(ctx, data)
}

// DeleteById juz
// @Summary Delete juz
// @Description Soft delete juz by ID and scope
// @Accept json
// @Produce json
// @Param id path int true "Juz ID"
// @Param scoped path string true "Delete scope (soft/hard)"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /juz/{id}/{scoped} [delete]
// @Tags Juz
func (c *juzController) DeleteById(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	scoped := ctx.Params("scoped")
	err = c.juz.DeleteById(&id, &scoped)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
