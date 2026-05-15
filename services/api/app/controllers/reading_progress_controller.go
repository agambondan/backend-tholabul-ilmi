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

// @Summary Save Quran reading progress
// @Tags Belajar
// @Accept json
// @Produce json
// @Param body body model.UpdateQuranProgressRequest true "Quran progress data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /progress/quran [put]
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

// @Summary Save Hadith reading progress
// @Tags Belajar
// @Accept json
// @Produce json
// @Param body body model.UpdateHadithProgressRequest true "Hadith progress data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /progress/hadith [put]
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

// @Summary Get Quran reading progress
// @Tags Belajar
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Router /progress/quran [get]
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

// @Summary Get Hadith reading progress
// @Tags Belajar
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Router /progress/hadith [get]
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

// @Summary Get all reading progress
// @Tags Belajar
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /progress [get]
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
