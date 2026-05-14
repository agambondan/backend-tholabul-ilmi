package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type KajianController interface {
	FindAll(ctx *fiber.Ctx) error
	FindByID(ctx *fiber.Ctx) error
	Create(ctx *fiber.Ctx) error
	Update(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
}

type kajianController struct {
	svc service.KajianService
}

func NewKajianController(services *service.Services) KajianController {
	return &kajianController{services.Kajian}
}

// @Summary Get all kajian with pagination
// @Tags Belajar
// @Accept json
// @Produce json
// @Param topic query string false "Filter by topic"
// @Param type query string false "Filter by type"
// @Param page query int false "Page number"
// @Param size query int false "Page size"
// @Success 200 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /kajian [get]
func (c *kajianController) FindAll(ctx *fiber.Ctx) error {
	topic := ctx.Query("topic")
	kajianType := ctx.Query("type")
	page := c.svc.FindAll(ctx, topic, kajianType)
	lang := lib.GetPreferredLang(ctx)
	lib.ApplyToPageItems(page, func(k *model.Kajian) {
		k.Translation.FilterByLang(lang)
	})
	return lib.OK(ctx, page)
}

// @Summary Get kajian by ID
// @Tags Belajar
// @Accept json
// @Produce json
// @Param id path int true "Kajian ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /kajian/{id} [get]
func (c *kajianController) FindByID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	k, err := c.svc.FindByID(id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	k.Translation.FilterByLang(lib.GetPreferredLang(ctx))
	go c.svc.IncrementView(id)
	return lib.OK(ctx, k)
}

// @Summary Create a kajian
// @Tags Belajar
// @Accept json
// @Produce json
// @Param kajian body model.CreateKajianRequest true "Kajian data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /kajian [post]
func (c *kajianController) Create(ctx *fiber.Ctx) error {
	req := new(model.CreateKajianRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	k, err := c.svc.Create(req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, k)
}

// @Summary Update a kajian
// @Tags Belajar
// @Accept json
// @Produce json
// @Param id path int true "Kajian ID"
// @Param kajian body model.CreateKajianRequest true "Kajian data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /kajian/{id} [put]
func (c *kajianController) Update(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	req := new(model.CreateKajianRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	k, err := c.svc.Update(id, req)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, k)
}

// @Summary Delete a kajian
// @Tags Belajar
// @Accept json
// @Produce json
// @Param id path int true "Kajian ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /kajian/{id} [delete]
func (c *kajianController) Delete(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.Delete(id); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
