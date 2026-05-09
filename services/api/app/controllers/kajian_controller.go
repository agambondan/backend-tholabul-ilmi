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
