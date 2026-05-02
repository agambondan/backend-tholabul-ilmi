package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type HafalanController interface {
	Update(ctx *fiber.Ctx) error
	FindAll(ctx *fiber.Ctx) error
	Summary(ctx *fiber.Ctx) error
}

type hafalanController struct {
	svc service.HafalanService
}

func NewHafalanController(services *service.Services) HafalanController {
	return &hafalanController{services.Hafalan}
}

func (c *hafalanController) Update(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	surahID, err := strconv.Atoi(ctx.Params("surahId"))
	if err != nil || surahID <= 0 {
		return lib.ErrorBadRequest(ctx, "invalid surah_id")
	}
	req := new(model.UpdateHafalanRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	result, err := c.svc.Update(userID, surahID, req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, result)
}

func (c *hafalanController) FindAll(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	list, err := c.svc.FindByUserID(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, list)
}

func (c *hafalanController) Summary(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	summary, err := c.svc.Summary(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, summary)
}
