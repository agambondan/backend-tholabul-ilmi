package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type AyahController interface {
	Create(ctx *fiber.Ctx) error
	FindAll(ctx *fiber.Ctx) error
	FindAllKeyset(ctx *fiber.Ctx) error
	FindById(ctx *fiber.Ctx) error
	FindDaily(ctx *fiber.Ctx) error
	FindByNumber(ctx *fiber.Ctx) error
	FindBySurahNumber(ctx *fiber.Ctx) error
	FindByPage(ctx *fiber.Ctx) error
	FindByHizbQuarter(ctx *fiber.Ctx) error
	UpdateById(ctx *fiber.Ctx) error
	DeleteById(ctx *fiber.Ctx) error
}

type ayahController struct {
	ayah service.AyahService
}

// NewAyahController implements the AyahController Interface
func NewAyahController(services *service.Services) AyahController {
	return &ayahController{services.Ayah}
}

func (c *ayahController) Create(ctx *fiber.Ctx) error {
	data := new(model.Ayah)
	if err := lib.BodyParser(ctx, data); nil != err {
		return lib.ErrorBadRequest(ctx, err)
	}
	if _, err := c.ayah.Create(data); err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, data)
}

func (c *ayahController) FindAll(ctx *fiber.Ctx) error {
	page := c.ayah.FindAll(ctx)
	return lib.OK(ctx, page)
}

func (c *ayahController) FindAllKeyset(ctx *fiber.Ctx) error {
	page, err := c.ayah.FindAllKeyset(ctx)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, page)
}

func (c *ayahController) FindById(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.ayah.FindById(&id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

func (c *ayahController) FindDaily(ctx *fiber.Ctx) error {
	data, err := c.ayah.FindDaily()
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

func (c *ayahController) FindByNumber(ctx *fiber.Ctx) error {
	number, err := strconv.Atoi(ctx.Params("number"))
	if err != nil {
		return lib.ErrorBadRequest(ctx)
	}
	data, err := c.ayah.FindByNumber(ctx, lib.Intptr(number))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

func (c *ayahController) FindBySurahNumber(ctx *fiber.Ctx) error {
	number, err := strconv.Atoi(ctx.Params("number"))
	if err != nil {
		return lib.ErrorBadRequest(ctx)
	}
	data, err := c.ayah.FindBySurahNumber(ctx, lib.Intptr(number))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

func (c *ayahController) FindByPage(ctx *fiber.Ctx) error {
	page, err := strconv.Atoi(ctx.Params("page"))
	if err != nil || page < 1 || page > 604 {
		return lib.ErrorBadRequest(ctx, "page must be between 1 and 604")
	}
	data, err := c.ayah.FindByPage(page)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, fiber.Map{"items": data, "page": page})
}

func (c *ayahController) FindByHizbQuarter(ctx *fiber.Ctx) error {
	hizb, err := strconv.Atoi(ctx.Params("hizb"))
	if err != nil || hizb < 1 || hizb > 240 {
		return lib.ErrorBadRequest(ctx, "hizb must be between 1 and 240")
	}
	data, err := c.ayah.FindByHizbQuarter(hizb)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, fiber.Map{"items": data, "hizb_quarter": hizb})
}

func (c *ayahController) UpdateById(ctx *fiber.Ctx) error {
	data := new(model.Ayah)
	if err := lib.BodyParser(ctx, data); nil != err {
		return lib.ErrorBadRequest(ctx, err)
	}
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if _, err = c.ayah.UpdateById(&id, data); err != nil {
		return lib.ErrorNotFound(ctx, err.Error())
	}
	return lib.OK(ctx, data)
}

func (c *ayahController) DeleteById(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	scoped := ctx.Params("scoped")
	err = c.ayah.DeleteById(&id, &scoped)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
