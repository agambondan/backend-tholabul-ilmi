package controllers

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type SyncController interface {
	InitialSync(ctx *fiber.Ctx) error
}

type syncController struct {
	svc service.SyncService
}

func NewSyncController(services *service.Services) SyncController {
	return &syncController{services.Sync}
}

func (c *syncController) InitialSync(ctx *fiber.Ctx) error {
	lang := lib.GetPreferredLang(ctx)
	result, err := c.svc.GetInitialSync(lang)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, result)
}
