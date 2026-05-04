package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type ManasikController interface {
	FindByType(ctx *fiber.Ctx) error
	FindByStep(ctx *fiber.Ctx) error
}

type manasikController struct{ svc service.ManasikService }

func NewManasikController(services *service.Services) ManasikController {
	return &manasikController{services.Manasik}
}

func (c *manasikController) FindByType(ctx *fiber.Ctx) error {
	t := model.ManasikType(ctx.Params("type"))
	if t != model.ManasikTypeHaji && t != model.ManasikTypeUmrah {
		return lib.ErrorBadRequest(ctx, "type harus 'haji' atau 'umrah'")
	}
	steps, err := c.svc.FindByType(t)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, steps)
}

func (c *manasikController) FindByStep(ctx *fiber.Ctx) error {
	t := model.ManasikType(ctx.Params("type"))
	if t != model.ManasikTypeHaji && t != model.ManasikTypeUmrah {
		return lib.ErrorBadRequest(ctx, "type harus 'haji' atau 'umrah'")
	}
	step, err := strconv.Atoi(ctx.Params("step"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "step harus berupa angka")
	}
	s, err := c.svc.FindByTypeAndStep(t, step)
	if err != nil {
		return lib.ErrorNotFound(ctx, "langkah tidak ditemukan")
	}
	return lib.OK(ctx, s)
}
