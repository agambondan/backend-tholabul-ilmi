package controllers

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type ZakatController interface {
	CalculateMaal(ctx *fiber.Ctx) error
	CalculateFitrah(ctx *fiber.Ctx) error
	GetNishab(ctx *fiber.Ctx) error
}

type zakatController struct {
	svc service.ZakatService
}

func NewZakatController(services *service.Services) ZakatController {
	return &zakatController{services.Zakat}
}

func (c *zakatController) CalculateMaal(ctx *fiber.Ctx) error {
	req := new(service.ZakatMaalRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	return lib.OK(ctx, c.svc.CalculateMaal(req))
}

func (c *zakatController) CalculateFitrah(ctx *fiber.Ctx) error {
	req := new(service.ZakatFitrahRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	return lib.OK(ctx, c.svc.CalculateFitrah(req))
}

func (c *zakatController) GetNishab(ctx *fiber.Ctx) error {
	return lib.OK(ctx, c.svc.GetNishab())
}
