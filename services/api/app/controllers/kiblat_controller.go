package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type KiblatController interface {
	Calculate(ctx *fiber.Ctx) error
}

type kiblatController struct{ svc service.KiblatService }

func NewKiblatController(services *service.Services) KiblatController {
	return &kiblatController{services.Kiblat}
}

func (c *kiblatController) Calculate(ctx *fiber.Ctx) error {
	lat, err := strconv.ParseFloat(ctx.Query("lat"), 64)
	if err != nil || lat < -90 || lat > 90 {
		return lib.ErrorBadRequest(ctx, "lat harus berupa angka antara -90 dan 90")
	}
	lng, err := strconv.ParseFloat(ctx.Query("lng"), 64)
	if err != nil || lng < -180 || lng > 180 {
		return lib.ErrorBadRequest(ctx, "lng harus berupa angka antara -180 dan 180")
	}
	result, err := c.svc.Calculate(lat, lng)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, result)
}
