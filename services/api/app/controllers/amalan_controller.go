package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type AmalanController interface {
	FindAllItems(ctx *fiber.Ctx) error
	GetToday(ctx *fiber.Ctx) error
	Toggle(ctx *fiber.Ctx) error
	GetHistory(ctx *fiber.Ctx) error
}

type amalanController struct {
	svc service.AmalanService
}

func NewAmalanController(services *service.Services) AmalanController {
	return &amalanController{services.Amalan}
}

func (c *amalanController) FindAllItems(ctx *fiber.Ctx) error {
	items, err := c.svc.FindAllItems()
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, items)
}

func (c *amalanController) GetToday(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	result, err := c.svc.GetTodayStatus(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, result)
}

func (c *amalanController) Toggle(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	var body struct {
		IsDone bool `json:"is_done"`
	}
	if err := lib.BodyParser(ctx, &body); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if err := c.svc.Toggle(userID, id, body.IsDone); err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx)
}

func (c *amalanController) GetHistory(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	from := ctx.Query("from")
	to := ctx.Query("to")
	logs, err := c.svc.GetHistory(userID, from, to)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, logs)
}
