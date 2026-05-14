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
	Save(ctx *fiber.Ctx) error
	UpdateByAyahID(ctx *fiber.Ctx) error
}

type tafsirController struct {
	svc service.TafsirService
}

func NewTafsirController(services *service.Services) TafsirController {
	return &tafsirController{services.Tafsir}
}

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
