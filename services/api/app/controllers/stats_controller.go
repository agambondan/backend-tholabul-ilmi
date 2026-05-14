package controllers

import (
	"strconv"
	"time"

	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type StatsController interface {
	GetStats(ctx *fiber.Ctx) error
	GetWeekly(ctx *fiber.Ctx) error
	GetMonthly(ctx *fiber.Ctx) error
	GetYearly(ctx *fiber.Ctx) error
}

type statsController struct {
	svc service.StatsService
}

func NewStatsController(services *service.Services) StatsController {
	return &statsController{services.Stats}
}

// @Summary Get user stats summary
// @Tags Personal
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/stats [get]
func (c *statsController) GetStats(ctx *fiber.Ctx) error {
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

// @Summary Get weekly stats
// @Tags Personal
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/stats/weekly [get]
func (c *statsController) GetWeekly(ctx *fiber.Ctx) error {
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

// @Summary Get monthly stats recap
// @Tags Personal
// @Produce json
// @Param year query int false "Year (default current)"
// @Param month query int false "Month 1-12 (default current)"
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/stats/monthly [get]
func (c *statsController) GetMonthly(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	now := time.Now()
	year, _ := strconv.Atoi(ctx.Query("year", strconv.Itoa(now.Year())))
	month, _ := strconv.Atoi(ctx.Query("month", strconv.Itoa(int(now.Month()))))
	recap, err := c.svc.GetMonthly(userID, year, month)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, recap)
}

// @Summary Get yearly stats recap
// @Tags Personal
// @Produce json
// @Param year query int false "Year (default current)"
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /api/v1/stats/yearly [get]
func (c *statsController) GetYearly(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	year, _ := strconv.Atoi(ctx.Query("year", strconv.Itoa(time.Now().Year())))
	recap, err := c.svc.GetYearly(userID, year)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, recap)
}
