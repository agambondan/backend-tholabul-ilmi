package controllers

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type SimpanFaraidhController interface {
	Create(ctx *fiber.Ctx) error
	List(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
}

type simpanFaraidhController struct {
	svc service.SimpanFaraidhService
}

func NewSimpanFaraidhController(services *service.Services) SimpanFaraidhController {
	return &simpanFaraidhController{services.SimpanFaraidh}
}

func (c *simpanFaraidhController) Create(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}

	req := new(model.CreateSimpanFaraidhRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}

	result, err := c.svc.Create(userID, req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, result)
}

func (c *simpanFaraidhController) List(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}

	items, err := c.svc.List(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, fiber.Map{"items": items})
}

func (c *simpanFaraidhController) Delete(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}

	id, parseErr := uuid.Parse(ctx.Params("id"))
	if parseErr != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}

	if err := c.svc.Delete(id, userID); err != nil {
		if err.Error() == "record not found" {
			return lib.ErrorNotFound(ctx)
		}
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, fiber.Map{"message": "deleted"})
}
