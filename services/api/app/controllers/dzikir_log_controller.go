package controllers

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type DzikirLogController interface {
	Log(ctx *fiber.Ctx) error
	GetToday(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
}

type dzikirLogController struct {
	svc service.DzikirLogService
}

func NewDzikirLogController(services *service.Services) DzikirLogController {
	return &dzikirLogController{services.DzikirLog}
}

func (c *dzikirLogController) Log(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	var req model.LogDzikirRequest
	if err := ctx.BodyParser(&req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if req.DzikirID == 0 {
		return lib.ErrorBadRequest(ctx, fiber.NewError(400, "dzikir_id required"))
	}
	log, err := c.svc.Log(userID, req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, log)
}

func (c *dzikirLogController) GetToday(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	logs, err := c.svc.GetToday(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, logs)
}

func (c *dzikirLogController) Delete(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	logID, err := uuid.Parse(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if err := c.svc.Delete(logID, userID); err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, fiber.Map{"deleted": true})
}
