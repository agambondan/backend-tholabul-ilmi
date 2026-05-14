package controllers

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type StreakController interface {
	Record(ctx *fiber.Ctx) error
	GetStreak(ctx *fiber.Ctx) error
	GetWeekly(ctx *fiber.Ctx) error
}

type streakController struct {
	svc service.StreakService
}

func NewStreakController(services *service.Services) StreakController {
	return &streakController{services.Streak}
}

// @Summary Record activity for streak
// @Tags Personal
// @Accept json
// @Produce json
// @Param body body model.RecordActivityRequest true "Activity data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/activity [post]
func (c *streakController) Record(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.RecordActivityRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if err := c.svc.Record(userID, req.Type); err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx)
}

// @Summary Get user streak
// @Tags Personal
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/streak [get]
func (c *streakController) GetStreak(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	streak, err := c.svc.GetStreak(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, streak)
}

// @Summary Get weekly streak data
// @Tags Personal
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/streak/weekly [get]
func (c *streakController) GetWeekly(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	weekly, err := c.svc.GetWeekly(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, weekly)
}
