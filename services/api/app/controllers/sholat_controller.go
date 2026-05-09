package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type SholatController interface {
	LogPrayer(ctx *fiber.Ctx) error
	GetToday(ctx *fiber.Ctx) error
	GetHistory(ctx *fiber.Ctx) error
	GetStats(ctx *fiber.Ctx) error
	GetAllGuides(ctx *fiber.Ctx) error
	GetGuideByStep(ctx *fiber.Ctx) error
}

type sholatController struct {
	svc service.SholatService
}

func NewSholatController(services *service.Services) SholatController {
	return &sholatController{services.Sholat}
}

func (c *sholatController) LogPrayer(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.LogSholatRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	log, err := c.svc.LogPrayer(userID, req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, log)
}

func (c *sholatController) GetToday(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	status, err := c.svc.GetToday(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, status)
}

func (c *sholatController) GetHistory(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	from := ctx.Query("from")
	to := ctx.Query("to")
	logs, err := c.svc.GetHistory(userID, from, to)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, logs)
}

func (c *sholatController) GetStats(ctx *fiber.Ctx) error {
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

func (c *sholatController) GetAllGuides(ctx *fiber.Ctx) error {
	guides, err := c.svc.GetAllGuides()
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	for i := range guides {
		guides[i].Translation.FilterByLang(lang)
	}
	return lib.OK(ctx, guides)
}

func (c *sholatController) GetGuideByStep(ctx *fiber.Ctx) error {
	step, err := strconv.Atoi(ctx.Params("step"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid step")
	}
	guide, err := c.svc.GetGuideByStep(step)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	guide.Translation.FilterByLang(lib.GetPreferredLang(ctx))
	return lib.OK(ctx, guide)
}
