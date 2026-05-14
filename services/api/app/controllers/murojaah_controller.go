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

// @Summary Get murojaah session (random ayahs)
// @Tags Belajar
// @Produce json
// @Param count query int false "Number of ayahs (default 10)"
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/murojaah/session [get]
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

// @Summary Submit murojaah result
// @Tags Belajar
// @Accept json
// @Produce json
// @Param body body model.RecordMurojaahRequest true "Murojaah result"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/murojaah/result [post]
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

// @Summary Get murojaah history
// @Tags Belajar
// @Produce json
// @Param limit query int false "Limit (default 20)"
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/murojaah/history [get]
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

// @Summary Get murojaah stats
// @Tags Belajar
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/murojaah/stats [get]
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
