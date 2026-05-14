package controllers

import (
	"net/url"
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type SurahController interface {
	Create(ctx *fiber.Ctx) error
	FindAll(ctx *fiber.Ctx) error
	FindById(ctx *fiber.Ctx) error
	FindByNumber(ctx *fiber.Ctx) error
	FindByName(ctx *fiber.Ctx) error
	UpdateById(ctx *fiber.Ctx) error
	DeleteById(ctx *fiber.Ctx) error
}

type surahController struct {
	surah service.SurahService
}

// NewSurahController implements the SurahController Interface
func NewSurahController(services *service.Services) SurahController {
	return &surahController{services.Surah}
}

// Create surah
// @Summary Create surah
// @Description Create a new surah entry
// @Accept json
// @Produce json
// @Param body body model.Surah true "Surah data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 409 {object} lib.Response
// @Router /api/v1/surah [post]
// @Tags Surah
func (c *surahController) Create(ctx *fiber.Ctx) error {
	data := new(model.Surah)
	if err := lib.BodyParser(ctx, data); nil != err {
		return lib.ErrorBadRequest(ctx, err)
	}
	if _, err := c.surah.Create(data); err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, data)
}

// FindAll surah
// @Summary List all surah
// @Description Get paginated list of all surah
// @Accept json
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Router /api/v1/surah [get]
// @Tags Surah
func (c *surahController) FindAll(ctx *fiber.Ctx) error {
	page := c.surah.FindAll(ctx)
	return lib.OK(ctx, page)
}

// FindById surah
// @Summary Get surah by ID
// @Description Get a single surah by its ID
// @Accept json
// @Produce json
// @Param id path int true "Surah ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/surah/{id} [get]
// @Tags Surah
func (c *surahController) FindById(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.surah.FindById(ctx, &id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

// FindByNumber surah
// @Summary Get surah by number
// @Description Get a single surah by its number (1-114)
// @Accept json
// @Produce json
// @Param number path int true "Surah number"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/surah/number/{number} [get]
// @Tags Surah
func (c *surahController) FindByNumber(ctx *fiber.Ctx) error {
	number, err := strconv.Atoi(ctx.Params("number"))
	if err != nil {
		return lib.ErrorBadRequest(ctx)
	}
	data, err := c.surah.FindByNumber(ctx, lib.Intptr(number))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

// FindByName surah
// @Summary Get surah by name
// @Description Get surah by its name (Arabic or Latin)
// @Accept json
// @Produce json
// @Param name path string true "Surah name"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/surah/name/{name} [get]
// @Tags Surah
func (c *surahController) FindByName(ctx *fiber.Ctx) error {
	decodedString, err := url.QueryUnescape(ctx.Params("name"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.surah.FindByName(ctx, lib.Strptr(decodedString))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

// UpdateById surah
// @Summary Update surah
// @Description Update surah by ID
// @Accept json
// @Produce json
// @Param id path int true "Surah ID"
// @Param body body model.Surah true "Surah data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/surah/{id} [put]
// @Tags Surah
func (c *surahController) UpdateById(ctx *fiber.Ctx) error {
	data := new(model.Surah)
	if err := lib.BodyParser(ctx, data); nil != err {
		return lib.ErrorBadRequest(ctx, err)
	}
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if _, err = c.surah.UpdateById(&id, data); err != nil {
		return lib.ErrorNotFound(ctx, err.Error())
	}
	return lib.OK(ctx, data)
}

// DeleteById surah
// @Summary Delete surah
// @Description Soft delete surah by ID and scope
// @Accept json
// @Produce json
// @Param id path int true "Surah ID"
// @Param scoped path string true "Delete scope (soft/hard)"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/surah/{id}/{scoped} [delete]
// @Tags Surah
func (c *surahController) DeleteById(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	scoped := ctx.Params("scoped")
	err = c.surah.DeleteById(&id, &scoped)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
