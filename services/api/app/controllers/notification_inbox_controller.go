package controllers

import (
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type notificationInboxController struct {
	svc service.NotificationInboxService
}

func NewNotificationInboxController(svc *service.Services) *notificationInboxController {
	return &notificationInboxController{svc.NotificationInbox}
}

// @Summary List notification inbox
// @Tags Personal
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/notifications/inbox [get]
func (c *notificationInboxController) List(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}
	items, err := c.svc.List(userID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	unread, _ := c.svc.UnreadCount(userID)
	return ctx.JSON(fiber.Map{"items": items, "unread_count": unread})
}

// @Summary Mark notification as read
// @Tags Personal
// @Produce json
// @Param id path string true "Notification ID (UUID)"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/notifications/inbox/{id}/read [put]
func (c *notificationInboxController) MarkRead(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}
	id, err := uuid.Parse(ctx.Params("id"))
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}
	if err := c.svc.MarkRead(id, userID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.JSON(fiber.Map{"ok": true})
}

// @Summary Mark all notifications as read
// @Tags Personal
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/notifications/inbox/read-all [put]
func (c *notificationInboxController) MarkAllRead(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}
	if err := c.svc.MarkAllRead(userID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.JSON(fiber.Map{"ok": true})
}
