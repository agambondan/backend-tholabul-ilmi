package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type APIKeyController interface {
	Register(ctx *fiber.Ctx) error
	List(ctx *fiber.Ctx) error
	Create(ctx *fiber.Ctx) error
	Revoke(ctx *fiber.Ctx) error
}

type apiKeyController struct{ svc service.APIKeyService }

func NewAPIKeyController(services *service.Services) APIKeyController {
	return &apiKeyController{services.APIKey}
}

func (c *apiKeyController) Register(ctx *fiber.Ctx) error {
	return c.Create(ctx)
}

func (c *apiKeyController) List(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	keys, err := c.svc.ListByUser(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, keys)
}

func (c *apiKeyController) Create(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.CreateAPIKeyRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	key, err := c.svc.Create(userID, req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, key)
}

func (c *apiKeyController) Revoke(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "id tidak valid")
	}
	if err := c.svc.Revoke(id, userID); err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, nil)
}
