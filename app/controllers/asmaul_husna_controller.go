package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type AsmaUlHusnaController interface {
	FindAll(ctx *fiber.Ctx) error
	FindByNumber(ctx *fiber.Ctx) error
}

type asmaUlHusnaController struct {
	svc service.AsmaUlHusnaService
}

func NewAsmaUlHusnaController(services *service.Services) AsmaUlHusnaController {
	return &asmaUlHusnaController{services.AsmaUlHusna}
}

func (c *asmaUlHusnaController) FindAll(ctx *fiber.Ctx) error {
	list, err := c.svc.FindAll()
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, list)
}

func (c *asmaUlHusnaController) FindByNumber(ctx *fiber.Ctx) error {
	number, err := strconv.Atoi(ctx.Params("number"))
	if err != nil || number < 1 || number > 99 {
		return lib.ErrorBadRequest(ctx, "number must be between 1 and 99")
	}
	asma, err := c.svc.FindByNumber(number)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, asma)
}
