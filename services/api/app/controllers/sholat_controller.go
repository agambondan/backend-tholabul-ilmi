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

// UpdateToday log today's prayer
// @Summary Log prayer for today
// @Tags Ibadah, Sholat
// @Accept json
// @Produce json
// @Param request body model.LogSholatRequest true "Prayer log request"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Router /sholat/today [put]
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

// GetToday get today's prayer status
// @Summary Get today's prayer status
// @Tags Ibadah, Sholat
// @Accept json
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Router /sholat/today [get]
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

// GetHistory get prayer history
// @Summary Get prayer history
// @Tags Ibadah, Sholat
// @Accept json
// @Produce json
// @Param from query string false "Start date YYYY-MM-DD"
// @Param to query string false "End date YYYY-MM-DD"
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Router /sholat/history [get]
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

// GetStats get prayer statistics
// @Summary Get prayer statistics
// @Tags Ibadah, Sholat
// @Accept json
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Router /sholat/stats [get]
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

// GetPanduan get all prayer guides
// @Summary Get all prayer guides
// @Tags Ibadah, Sholat
// @Accept json
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Router /panduan-sholat [get]
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

// GetPanduanStep get prayer guide by step
// @Summary Get prayer guide by step
// @Tags Ibadah, Sholat
// @Accept json
// @Produce json
// @Param step path int true "Step number"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /panduan-sholat/{step} [get]
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
