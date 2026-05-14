package controllers

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type DashboardController interface {
	GetHome(ctx *fiber.Ctx) error
}

type dashboardController struct {
	svc service.DashboardService
}

func NewDashboardController(services *service.Services) DashboardController {
	return &dashboardController{services.Dashboard}
}

func (c *dashboardController) GetHome(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}

	result, err := c.svc.GetHome(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, result)
}
