package controllers

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type NotificationController interface {
	FindSettings(ctx *fiber.Ctx) error
	UpsertSettings(ctx *fiber.Ctx) error
}

type notificationController struct {
	svc service.NotificationService
}

func NewNotificationController(services *service.Services) NotificationController {
	return &notificationController{services.Notification}
}

func (c *notificationController) FindSettings(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	items, err := c.svc.FindSettings(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, items)
}

func (c *notificationController) UpsertSettings(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.NotificationSettingsUpsertRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	items, err := c.svc.UpsertSettings(userID, req)
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	return lib.OK(ctx, items)
}
