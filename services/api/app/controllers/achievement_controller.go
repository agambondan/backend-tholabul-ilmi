package controllers

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type AchievementController interface {
	GetAll(ctx *fiber.Ctx) error
	GetMine(ctx *fiber.Ctx) error
	GetMyPoints(ctx *fiber.Ctx) error
}

type achievementController struct {
	svc service.AchievementService
}

func NewAchievementController(services *service.Services) AchievementController {
	return &achievementController{services.Achievement}
}

func (c *achievementController) GetAll(ctx *fiber.Ctx) error {
	list, err := c.svc.GetAll()
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, list)
}

func (c *achievementController) GetMine(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	list, err := c.svc.GetUserAchievements(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, list)
}

func (c *achievementController) GetMyPoints(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	pts, err := c.svc.GetUserPoints(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, pts)
}
