package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type HadithAyahController interface {
	Create(ctx *fiber.Ctx) error
	FindByHadithID(ctx *fiber.Ctx) error
	FindByAyahID(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
}

type hadithAyahController struct {
	svc service.HadithAyahService
}

func NewHadithAyahController(services *service.Services) HadithAyahController {
	return &hadithAyahController{services.HadithAyah}
}

func (c *hadithAyahController) Create(ctx *fiber.Ctx) error {
	req := new(model.CreateHadithAyahRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	result, err := c.svc.Create(req)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, result)
}

func (c *hadithAyahController) FindByHadithID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("hadithId"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid hadith id")
	}
	items, err := c.svc.FindByHadithID(id)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, fiber.Map{"items": items})
}

func (c *hadithAyahController) FindByAyahID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("ayahId"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid ayah id")
	}
	items, err := c.svc.FindByAyahID(id)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, fiber.Map{"items": items})
}

func (c *hadithAyahController) Delete(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.Delete(id); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, fiber.Map{"message": "deleted"})
}
