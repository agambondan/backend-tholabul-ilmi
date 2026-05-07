package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type PerawiController interface {
	Create(ctx *fiber.Ctx) error
	FindAll(ctx *fiber.Ctx) error
	FindByID(ctx *fiber.Ctx) error
	FindByTabaqah(ctx *fiber.Ctx) error
	Search(ctx *fiber.Ctx) error
	FindGuru(ctx *fiber.Ctx) error
	FindMurid(ctx *fiber.Ctx) error
	UpdateByID(ctx *fiber.Ctx) error
	DeleteByID(ctx *fiber.Ctx) error
}

type perawiController struct {
	svc service.PerawiService
}

func NewPerawiController(services *service.Services) PerawiController {
	return &perawiController{services.Perawi}
}

func (c *perawiController) Create(ctx *fiber.Ctx) error {
	data := new(model.Perawi)
	if err := lib.BodyParser(ctx, data); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	result, err := c.svc.Create(data)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, result)
}

func (c *perawiController) FindAll(ctx *fiber.Ctx) error {
	page := c.svc.FindAll(ctx)
	return lib.OK(ctx, page)
}

func (c *perawiController) FindByID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	data, err := c.svc.FindByID(&id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

func (c *perawiController) FindByTabaqah(ctx *fiber.Ctx) error {
	tabaqah := ctx.Params("tabaqah")
	page := c.svc.FindByTabaqah(ctx, tabaqah)
	return lib.OK(ctx, page)
}

func (c *perawiController) Search(ctx *fiber.Ctx) error {
	q := ctx.Query("q")
	if q == "" {
		return lib.ErrorBadRequest(ctx, "query param 'q' is required")
	}
	page := c.svc.Search(ctx, q)
	return lib.OK(ctx, page)
}

func (c *perawiController) FindGuru(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	list, err := c.svc.FindGuru(&id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, list)
}

func (c *perawiController) FindMurid(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	list, err := c.svc.FindMurid(&id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, list)
}

func (c *perawiController) UpdateByID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	data := new(model.Perawi)
	if err := lib.BodyParser(ctx, data); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	result, err := c.svc.UpdateByID(&id, data)
	if err != nil {
		return lib.ErrorNotFound(ctx, err.Error())
	}
	return lib.OK(ctx, result)
}

func (c *perawiController) DeleteByID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.DeleteByID(&id); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
