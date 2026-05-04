package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type AudioController interface {
	FindSurahAudio(ctx *fiber.Ctx) error
	FindAyahAudio(ctx *fiber.Ctx) error
	AddSurahAudio(ctx *fiber.Ctx) error
	AddAyahAudio(ctx *fiber.Ctx) error
	DeleteSurahAudio(ctx *fiber.Ctx) error
	DeleteAyahAudio(ctx *fiber.Ctx) error
}

type audioController struct {
	svc service.AudioService
}

func NewAudioController(services *service.Services) AudioController {
	return &audioController{services.Audio}
}

func (c *audioController) FindSurahAudio(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("surahId"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid surah id")
	}
	list, err := c.svc.FindSurahAudio(id)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, list)
}

func (c *audioController) FindAyahAudio(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("ayahId"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid ayah id")
	}
	list, err := c.svc.FindAyahAudio(id)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, list)
}

func (c *audioController) AddSurahAudio(ctx *fiber.Ctx) error {
	a := new(model.SurahAudio)
	if err := lib.BodyParser(ctx, a); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	result, err := c.svc.AddSurahAudio(a)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, result)
}

func (c *audioController) AddAyahAudio(ctx *fiber.Ctx) error {
	a := new(model.AyahAudio)
	if err := lib.BodyParser(ctx, a); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	result, err := c.svc.AddAyahAudio(a)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, result)
}

func (c *audioController) DeleteSurahAudio(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.DeleteSurahAudio(id); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}

func (c *audioController) DeleteAyahAudio(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.DeleteAyahAudio(id); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
