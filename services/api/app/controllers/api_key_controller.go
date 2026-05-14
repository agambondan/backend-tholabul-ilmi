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

// Register Register for developer API access
// @Summary Register for developer API access
// @Tags Developer
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Router /developer/register [post]
func (c *apiKeyController) Register(ctx *fiber.Ctx) error {
	return c.Create(ctx)
}

// List List developer API keys
// @Summary List developer API keys
// @Tags Developer
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Router /developer/keys [get]
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

// Create Create a new developer API key
// @Summary Create a new developer API key
// @Tags Developer
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param body body model.CreateAPIKeyRequest true "Create API key request"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Router /developer/keys [post]
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

// Revoke Revoke a developer API key
// @Summary Revoke a developer API key
// @Tags Developer
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param id path int true "API Key ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Router /developer/keys/{id} [delete]
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
