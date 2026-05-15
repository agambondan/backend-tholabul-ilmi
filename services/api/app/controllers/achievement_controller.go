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

// @Summary Get all achievements
// @Tags Personal
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /achievements [get]
func (c *achievementController) GetAll(ctx *fiber.Ctx) error {
	list, err := c.svc.GetAll()
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, list)
}

// @Summary Get my earned achievements
// @Tags Personal
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /achievements/mine [get]
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

// @Summary Get my achievement points
// @Tags Personal
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /achievements/points [get]
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
