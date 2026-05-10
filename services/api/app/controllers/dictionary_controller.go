package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type DictionaryController interface {
	FindAll(ctx *fiber.Ctx) error
	FindByTerm(ctx *fiber.Ctx) error
	FindByCategory(ctx *fiber.Ctx) error
	Create(ctx *fiber.Ctx) error
	Update(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
}

type dictionaryController struct{ svc service.DictionaryService }

func NewDictionaryController(services *service.Services) DictionaryController {
	return &dictionaryController{services.Dictionary}
}

func (c *dictionaryController) FindAll(ctx *fiber.Ctx) error {
	category := ctx.Query("category")
	search := ctx.Query("q")
	items, err := c.svc.FindAll(category, search)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	for i := range items {
		items[i].Translation.FilterByLang(lang)
	}
	return lib.OK(ctx, items)
}

func (c *dictionaryController) FindByTerm(ctx *fiber.Ctx) error {
	item, err := c.svc.FindByTerm(ctx.Params("term"))
	if err != nil {
		return lib.ErrorNotFound(ctx, "istilah tidak ditemukan")
	}
	item.Translation.FilterByLang(lib.GetPreferredLang(ctx))
	return lib.OK(ctx, item)
}

func (c *dictionaryController) FindByCategory(ctx *fiber.Ctx) error {
	items, err := c.svc.FindByCategory(model.TermCategory(ctx.Params("category")))
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	for i := range items {
		items[i].Translation.FilterByLang(lang)
	}
	return lib.OK(ctx, items)
}

func (c *dictionaryController) Create(ctx *fiber.Ctx) error {
	req := new(model.CreateIslamicTermRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.Create(req)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, item)
}

func (c *dictionaryController) Update(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "id tidak valid")
	}
	req := new(model.CreateIslamicTermRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.Update(id, req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, item)
}

func (c *dictionaryController) Delete(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "id tidak valid")
	}
	if err := c.svc.Delete(id); err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, nil)
}
