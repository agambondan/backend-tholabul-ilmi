package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type AsmaUlHusnaController interface {
	FindAll(ctx *fiber.Ctx) error
	FindByNumber(ctx *fiber.Ctx) error
}

type asmaUlHusnaController struct {
	svc service.AsmaUlHusnaService
}

func NewAsmaUlHusnaController(services *service.Services) AsmaUlHusnaController {
	return &asmaUlHusnaController{services.AsmaUlHusna}
}

// FindAll Asmaul Husna
// @Summary Get all Asmaul Husna
// @Tags Ibadah, Asmaul Husna
// @Accept json
// @Produce json
// @Param limit query int false "Limit"
// @Param offset query int false "Offset"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Router /asmaul-husna [get]
func (c *asmaUlHusnaController) FindAll(ctx *fiber.Ctx) error {
	limit, offset := lib.GetLimitOffset(ctx)
	if limit > 99 {
		limit = 99
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

// FindByNumber Asmaul Husna
// @Summary Get Asmaul Husna by number
// @Tags Ibadah, Asmaul Husna
// @Accept json
// @Produce json
// @Param number path int true "Asma number (1-99)"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /asmaul-husna/{number} [get]
func (c *asmaUlHusnaController) FindByNumber(ctx *fiber.Ctx) error {
	number, err := strconv.Atoi(ctx.Params("number"))
	if err != nil || number < 1 || number > 99 {
		return lib.ErrorBadRequest(ctx, "number must be between 1 and 99")
	}
	asma, err := c.svc.FindByNumber(number)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	asma.Translation.FilterByLang(lib.GetPreferredLang(ctx))
	return lib.OK(ctx, asma)
}
