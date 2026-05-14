package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type HistoryController interface {
	FindAll(ctx *fiber.Ctx) error
	FindBySlug(ctx *fiber.Ctx) error
	Create(ctx *fiber.Ctx) error
	Update(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
}

type historyController struct{ svc service.HistoryService }

func NewHistoryController(services *service.Services) HistoryController {
	return &historyController{services.History}
}

// @Summary Get all history events
// @Tags Belajar
// @Accept json
// @Produce json
// @Param category query string false "Filter by category"
// @Param year_from query int false "Filter from year"
// @Param year_to query int false "Filter to year"
// @Param limit query int false "Limit (max 100)"
// @Param offset query int false "Offset"
// @Success 200 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /history [get]
func (c *historyController) FindAll(ctx *fiber.Ctx) error {
	category := ctx.Query("category")
	yearFrom, _ := strconv.Atoi(ctx.Query("year_from"))
	yearTo, _ := strconv.Atoi(ctx.Query("year_to"))
	limit, offset := lib.GetLimitOffset(ctx)
	if limit > 100 {
		limit = 100
	}
	items, err := c.svc.FindAll(category, yearFrom, yearTo, lib.FetchLimitForMeta(ctx, limit), offset)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	items, hasMore := lib.TrimPaginationItems(items, limit)
	lang := lib.GetPreferredLang(ctx)
	for i := range items {
		items[i].Translation.FilterByLang(lang)
	}
	return lib.OKPaginated(ctx, items, limit, offset, hasMore)
}

// @Summary Get history event by slug
// @Tags Belajar
// @Accept json
// @Produce json
// @Param slug path string true "Event slug"
// @Success 200 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /history/{slug} [get]
func (c *historyController) FindBySlug(ctx *fiber.Ctx) error {
	item, err := c.svc.FindBySlug(ctx.Params("slug"))
	if err != nil {
		return lib.ErrorNotFound(ctx, "history event tidak ditemukan")
	}
	item.Translation.FilterByLang(lib.GetPreferredLang(ctx))
	return lib.OK(ctx, item)
}

// @Summary Create a history event
// @Tags Belajar
// @Accept json
// @Produce json
// @Param event body model.CreateHistoryEventRequest true "Event data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 409 {object} lib.Response
// @Router /history [post]
func (c *historyController) Create(ctx *fiber.Ctx) error {
	req := new(model.CreateHistoryEventRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.Create(req)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, item)
}

// @Summary Update a history event
// @Tags Belajar
// @Accept json
// @Produce json
// @Param id path int true "Event ID"
// @Param event body model.CreateHistoryEventRequest true "Event data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /history/{id} [put]
func (c *historyController) Update(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "id tidak valid")
	}
	req := new(model.CreateHistoryEventRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.Update(id, req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, item)
}

// @Summary Delete a history event
// @Tags Belajar
// @Accept json
// @Produce json
// @Param id path int true "Event ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /history/{id} [delete]
func (c *historyController) Delete(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "id tidak valid")
	}
	if err := c.svc.Delete(id); err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, nil)
}
