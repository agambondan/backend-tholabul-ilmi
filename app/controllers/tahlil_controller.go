package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type TahlilController interface {
	FindAll(ctx *fiber.Ctx) error
	FindByID(ctx *fiber.Ctx) error
}

type tahlilController struct {
	svc service.TahlilService
}

func NewTahlilController(services *service.Services) TahlilController {
	return &tahlilController{services.Tahlil}
}

func (c *tahlilController) FindAll(ctx *fiber.Ctx) error {
	list, err := c.svc.FindAll()
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, list)
}

func (c *tahlilController) FindByID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	col, err := c.svc.FindByID(id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, col)
}
