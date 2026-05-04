package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type LeaderboardController interface {
	TopStreak(ctx *fiber.Ctx) error
	TopHafalan(ctx *fiber.Ctx) error
	MyRank(ctx *fiber.Ctx) error
}

type leaderboardController struct {
	svc service.LeaderboardService
}

func NewLeaderboardController(services *service.Services) LeaderboardController {
	return &leaderboardController{services.Leaderboard}
}

func (c *leaderboardController) TopStreak(ctx *fiber.Ctx) error {
	limit, _ := strconv.Atoi(ctx.Query("limit", "20"))
	if limit > 100 {
		limit = 100
	}
	list, err := c.svc.TopStreak(limit)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, list)
}

func (c *leaderboardController) TopHafalan(ctx *fiber.Ctx) error {
	limit, _ := strconv.Atoi(ctx.Query("limit", "20"))
	if limit > 100 {
		limit = 100
	}
	list, err := c.svc.TopHafalan(limit)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, list)
}

func (c *leaderboardController) MyRank(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	ranks, err := c.svc.MyRank(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, ranks)
}
