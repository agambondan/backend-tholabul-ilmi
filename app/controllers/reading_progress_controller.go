package controllers

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type ReadingProgressController interface {
	UpdateQuran(ctx *fiber.Ctx) error
	UpdateHadith(ctx *fiber.Ctx) error
	GetQuran(ctx *fiber.Ctx) error
	GetHadith(ctx *fiber.Ctx) error
	GetAll(ctx *fiber.Ctx) error
}

type readingProgressController struct {
	svc service.ReadingProgressService
}

func NewReadingProgressController(services *service.Services) ReadingProgressController {
	return &readingProgressController{services.ReadingProgress}
}

func (c *readingProgressController) UpdateQuran(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.UpdateQuranProgressRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	progress, err := c.svc.UpdateQuran(userID, req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, progress)
}

func (c *readingProgressController) UpdateHadith(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.UpdateHadithProgressRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	progress, err := c.svc.UpdateHadith(userID, req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, progress)
}

func (c *readingProgressController) GetQuran(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	progress, err := c.svc.GetQuran(userID)
	if err != nil {
		return lib.OK(ctx, nil)
	}
	return lib.OK(ctx, progress)
}

func (c *readingProgressController) GetHadith(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	progress, err := c.svc.GetHadith(userID)
	if err != nil {
		return lib.OK(ctx, nil)
	}
	return lib.OK(ctx, progress)
}

func (c *readingProgressController) GetAll(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	progress, err := c.svc.GetAll(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, progress)
}
