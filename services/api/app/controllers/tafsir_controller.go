package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type TafsirController interface {
	FindByAyahID(ctx *fiber.Ctx) error
	FindBySurahNumber(ctx *fiber.Ctx) error
	Search(ctx *fiber.Ctx) error
	Save(ctx *fiber.Ctx) error
	UpdateByAyahID(ctx *fiber.Ctx) error
}

type tafsirController struct {
	svc service.TafsirService
}

func NewTafsirController(services *service.Services) TafsirController {
	return &tafsirController{services.Tafsir}
}

// FindByAyahID tafsir
// @Summary Get tafsir by ayah ID
// @Description Get tafsir (interpretation) for a specific ayah
// @Accept json
// @Produce json
// @Param id path int true "Ayah ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /tafsir/ayah/{id} [get]
// @Tags Tafsir
func (c *tafsirController) FindByAyahID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid ayah id")
	}
	t, err := c.svc.FindByAyahID(id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, t)
}

// FindBySurahNumber tafsir
// @Summary Get tafsir by surah number
// @Description Get tafsir (interpretation) for all ayah in a surah
// @Accept json
// @Produce json
// @Param number path int true "Surah number"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /tafsir/surah/{number} [get]
// @Tags Tafsir
func (c *tafsirController) FindBySurahNumber(ctx *fiber.Ctx) error {
	number, err := strconv.Atoi(ctx.Params("number"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid surah number")
	}
	limit, offset := lib.GetLimitOffset(ctx)
	if limit > 100 {
		limit = 100
	}
	list, err := c.svc.FindBySurahNumber(number, lib.FetchLimitForMeta(ctx, limit), offset)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	list, hasMore := lib.TrimPaginationItems(list, limit)
	return lib.OKPaginated(ctx, list, limit, offset, hasMore)
}

// Search tafsir
// @Summary Search tafsir text
// @Description Search across tafsir (Kemenag + Ibnu Katsir) by keyword
// @Accept json
// @Produce json
// @Param q query string true "Search keyword"
// @Param size query int false "Limit (default 20, max 100)"
// @Param page query int false "Page (0-based)"
// @Success 200 {object} lib.Response
// @Router /tafsir/search [get]
// @Tags Tafsir
func (c *tafsirController) Search(ctx *fiber.Ctx) error {
	q := ctx.Query("q")
	if q == "" {
		return lib.ErrorBadRequest(ctx, "query parameter 'q' is required")
	}
	limit, offset := lib.GetLimitOffset(ctx)
	if limit > 100 {
		limit = 100
	}
	list, err := c.svc.Search(q, lib.FetchLimitForMeta(ctx, limit), offset)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	list, hasMore := lib.TrimPaginationItems(list, limit)
	return lib.OKPaginated(ctx, list, limit, offset, hasMore)
}

// Save tafsir
// @Summary Create tafsir
// @Description Create a new tafsir entry
// @Accept json
// @Produce json
// @Param body body model.Tafsir true "Tafsir data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 409 {object} lib.Response
// @Router /tafsir [post]
// @Tags Tafsir
func (c *tafsirController) Save(ctx *fiber.Ctx) error {
	t := new(model.Tafsir)
	if err := lib.BodyParser(ctx, t); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	result, err := c.svc.Save(t)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, result)
}

// UpdateByAyahID tafsir
// @Summary Update tafsir by ayah ID
// @Description Update tafsir entry for a specific ayah
// @Accept json
// @Produce json
// @Param id path int true "Ayah ID"
// @Param body body model.Tafsir true "Tafsir data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /tafsir/ayah/{id} [put]
// @Tags Tafsir
func (c *tafsirController) UpdateByAyahID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid ayah id")
	}
	t := new(model.Tafsir)
	if err := lib.BodyParser(ctx, t); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	result, err := c.svc.UpdateByAyahID(id, t)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, result)
}
