package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type MurojaahController interface {
	GetSession(ctx *fiber.Ctx) error
	RecordSession(ctx *fiber.Ctx) error
	GetHistory(ctx *fiber.Ctx) error
	GetStats(ctx *fiber.Ctx) error
}

type murojaahController struct {
	svc service.MurojaahService
}

func NewMurojaahController(services *service.Services) MurojaahController {
	return &murojaahController{services.Murojaah}
}

func (c *murojaahController) GetSession(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	count, _ := strconv.Atoi(ctx.Query("count", "10"))
	ayahs, err := c.svc.GetSession(userID, count)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, ayahs)
}

func (c *murojaahController) RecordSession(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.RecordMurojaahRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	session, err := c.svc.RecordSession(userID, req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, session)
}

func (c *murojaahController) GetHistory(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	limit, _ := strconv.Atoi(ctx.Query("limit", "20"))
	sessions, err := c.svc.GetHistory(userID, limit)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, sessions)
}

func (c *murojaahController) GetStats(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	stats, err := c.svc.GetStats(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, stats)
}
