package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type HistoryController interface {
	FindAll(ctx *fiber.Ctx) error
	FindBySlug(ctx *fiber.Ctx) error
	Create(ctx *fiber.Ctx) error
	Update(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
}

type historyController struct{ svc service.HistoryService }

func NewHistoryController(services *service.Services) HistoryController {
	return &historyController{services.History}
}

func (c *historyController) FindAll(ctx *fiber.Ctx) error {
	category := ctx.Query("category")
	yearFrom, _ := strconv.Atoi(ctx.Query("year_from"))
	yearTo, _ := strconv.Atoi(ctx.Query("year_to"))
	items, err := c.svc.FindAll(category, yearFrom, yearTo)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	for i := range items {
		items[i].Translation.FilterByLang(lang)
	}
	return lib.OK(ctx, items)
}

func (c *historyController) FindBySlug(ctx *fiber.Ctx) error {
	item, err := c.svc.FindBySlug(ctx.Params("slug"))
	if err != nil {
		return lib.ErrorNotFound(ctx, "history event tidak ditemukan")
	}
	item.Translation.FilterByLang(lib.GetPreferredLang(ctx))
	return lib.OK(ctx, item)
}

func (c *historyController) Create(ctx *fiber.Ctx) error {
	req := new(model.CreateHistoryEventRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.Create(req)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, item)
}

func (c *historyController) Update(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "id tidak valid")
	}
	req := new(model.CreateHistoryEventRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.Update(id, req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, item)
}

func (c *historyController) Delete(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "id tidak valid")
	}
	if err := c.svc.Delete(id); err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, nil)
}
