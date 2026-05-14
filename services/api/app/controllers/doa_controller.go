package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type DoaController interface {
	FindAll(ctx *fiber.Ctx) error
	FindByID(ctx *fiber.Ctx) error
	FindByCategory(ctx *fiber.Ctx) error
}

type doaController struct {
	svc service.DoaService
}

func NewDoaController(services *service.Services) DoaController {
	return &doaController{services.Doa}
}

// FindAll Doa
// @Summary Get all doa
// @Tags Doa
// @Accept json
// @Produce json
// @Param limit query int false "Limit"
// @Param offset query int false "Offset"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Router /doa [get]
func (c *doaController) FindAll(ctx *fiber.Ctx) error {
	limit, offset := lib.GetLimitOffset(ctx)
	if limit > 100 {
		limit = 100
	}
	list, err := c.svc.FindAll(lib.FetchLimitForMeta(ctx, limit), offset)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	list, hasMore := lib.TrimPaginationItems(list, limit)
	lang := lib.GetPreferredLang(ctx)
	for i := range list {
		list[i].Translation.FilterByLang(lang)
	}
	return lib.OKPaginated(ctx, list, limit, offset, hasMore)
}

// FindByID Doa
// @Summary Get doa by ID
// @Tags Doa
// @Accept json
// @Produce json
// @Param id path int true "Doa ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /doa/{id} [get]
func (c *doaController) FindByID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	doa, err := c.svc.FindByID(id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	doa.Translation.FilterByLang(lib.GetPreferredLang(ctx))
	return lib.OK(ctx, doa)
}

// FindByCategory Doa
// @Summary Get doa by category
// @Tags Doa
// @Accept json
// @Produce json
// @Param category path string true "Doa category"
// @Param limit query int false "Limit"
// @Param offset query int false "Offset"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Router /doa/category/{category} [get]
func (c *doaController) FindByCategory(ctx *fiber.Ctx) error {
	category := model.DoaCategory(ctx.Params("category"))
	limit, offset := lib.GetLimitOffset(ctx)
	if limit > 100 {
		limit = 100
	}
	list, err := c.svc.FindByCategory(category, lib.FetchLimitForMeta(ctx, limit), offset)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	list, hasMore := lib.TrimPaginationItems(list, limit)
	lang := lib.GetPreferredLang(ctx)
	for i := range list {
		list[i].Translation.FilterByLang(lang)
	}
	return lib.OKPaginated(ctx, list, limit, offset, hasMore)
}
