package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type TakhrijController interface {
	Create(ctx *fiber.Ctx) error
	FindAll(ctx *fiber.Ctx) error
	FindByID(ctx *fiber.Ctx) error
	FindByHadithID(ctx *fiber.Ctx) error
	UpdateByID(ctx *fiber.Ctx) error
	DeleteByID(ctx *fiber.Ctx) error
}

type takhrijController struct {
	svc service.TakhrijService
}

func NewTakhrijController(services *service.Services) TakhrijController {
	return &takhrijController{services.Takhrij}
}

// Create takhrij
// @Summary Create takhrij
// @Description Create a new takhrij entry
// @Accept json
// @Produce json
// @Param body body model.Takhrij true "Takhrij data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 409 {object} lib.Response
// @Router /api/v1/takhrij [post]
// @Tags Takhrij
func (c *takhrijController) Create(ctx *fiber.Ctx) error {
	data := new(model.Takhrij)
	if err := lib.BodyParser(ctx, data); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	result, err := c.svc.Create(data)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, result)
}

func (c *takhrijController) FindByHadithID(ctx *fiber.Ctx) error {
	hadithID, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid hadith id")
	}
	list, err := c.svc.FindByHadithID(&hadithID)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, list)
}

// FindAll takhrij
// @Summary List all takhrij
// @Description Get paginated list of all takhrij
// @Accept json
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Router /api/v1/takhrij [get]
// @Tags Takhrij
func (c *takhrijController) FindAll(ctx *fiber.Ctx) error {
	list, err := c.svc.FindAll()
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, list)
}

// FindByID takhrij
// @Summary Get takhrij by ID
// @Description Get a single takhrij by its ID
// @Accept json
// @Produce json
// @Param id path int true "Takhrij ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/takhrij/{id} [get]
// @Tags Takhrij
func (c *takhrijController) FindByID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	data, err := c.svc.FindByID(&id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

// UpdateByID takhrij
// @Summary Update takhrij
// @Description Update takhrij by ID
// @Accept json
// @Produce json
// @Param id path int true "Takhrij ID"
// @Param body body model.Takhrij true "Takhrij data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/takhrij/{id} [put]
// @Tags Takhrij
func (c *takhrijController) UpdateByID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	data := new(model.Takhrij)
	if err := lib.BodyParser(ctx, data); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	result, err := c.svc.UpdateByID(&id, data)
	if err != nil {
		return lib.ErrorNotFound(ctx, err.Error())
	}
	return lib.OK(ctx, result)
}

// DeleteByID takhrij
// @Summary Delete takhrij
// @Description Delete takhrij by ID
// @Accept json
// @Produce json
// @Param id path int true "Takhrij ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /api/v1/takhrij/{id} [delete]
// @Tags Takhrij
func (c *takhrijController) DeleteByID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.DeleteByID(&id); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
