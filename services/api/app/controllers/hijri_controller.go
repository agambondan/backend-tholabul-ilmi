package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type HijriController interface {
	Today(ctx *fiber.Ctx) error
	Convert(ctx *fiber.Ctx) error
	GetEvents(ctx *fiber.Ctx) error
	GetEventsByMonth(ctx *fiber.Ctx) error
}

type hijriController struct {
	svc service.HijriService
}

func NewHijriController(services *service.Services) HijriController {
	return &hijriController{services.Hijri}
}

func (c *hijriController) Today(ctx *fiber.Ctx) error {
	return lib.OK(ctx, c.svc.Today())
}

func (c *hijriController) Convert(ctx *fiber.Ctx) error {
	year, err1 := strconv.Atoi(ctx.Query("year"))
	month, err2 := strconv.Atoi(ctx.Query("month"))
	day, err3 := strconv.Atoi(ctx.Query("day"))
	if err1 != nil || err2 != nil || err3 != nil || year == 0 || month < 1 || month > 12 || day < 1 || day > 31 {
		return lib.ErrorBadRequest(ctx, "query params year, month, day required")
	}
	return lib.OK(ctx, c.svc.ConvertToHijri(year, month, day))
}

func (c *hijriController) GetEvents(ctx *fiber.Ctx) error {
	category := ctx.Query("category")
	events, err := c.svc.GetEvents(category)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	for i := range events {
		events[i].Translation.FilterByLang(lang)
	}
	return lib.OK(ctx, events)
}

func (c *hijriController) GetEventsByMonth(ctx *fiber.Ctx) error {
	month, err := strconv.Atoi(ctx.Params("month"))
	if err != nil || month < 1 || month > 12 {
		return lib.ErrorBadRequest(ctx, "month must be 1-12")
	}
	events, err := c.svc.GetEventsByMonth(month)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	for i := range events {
		events[i].Translation.FilterByLang(lang)
	}
	return lib.OK(ctx, events)
}
