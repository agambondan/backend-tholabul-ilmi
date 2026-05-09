package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type DzikirController interface {
	FindAll(ctx *fiber.Ctx) error
	FindByID(ctx *fiber.Ctx) error
	FindByCategory(ctx *fiber.Ctx) error
	FindByOccasion(ctx *fiber.Ctx) error
}

type dzikirController struct {
	svc service.DzikirService
}

func NewDzikirController(services *service.Services) DzikirController {
	return &dzikirController{services.Dzikir}
}

func (c *dzikirController) FindAll(ctx *fiber.Ctx) error {
	list, err := c.svc.FindAll()
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	for i := range list {
		list[i].Translation.FilterByLang(lang)
	}
	return lib.OK(ctx, list)
}

func (c *dzikirController) FindByID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	d, err := c.svc.FindByID(id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	d.Translation.FilterByLang(lib.GetPreferredLang(ctx))
	return lib.OK(ctx, d)
}

func (c *dzikirController) FindByCategory(ctx *fiber.Ctx) error {
	category := ctx.Params("category")
	list, err := c.svc.FindByCategory(category)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	for i := range list {
		list[i].Translation.FilterByLang(lang)
	}
	return lib.OK(ctx, list)
}

func (c *dzikirController) FindByOccasion(ctx *fiber.Ctx) error {
	occasion := ctx.Params("occasion")
	list, err := c.svc.FindByOccasion(occasion)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	for i := range list {
		list[i].Translation.FilterByLang(lang)
	}
	return lib.OK(ctx, list)
}
