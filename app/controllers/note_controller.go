package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type NoteController interface {
	FindAll(ctx *fiber.Ctx) error
	Create(ctx *fiber.Ctx) error
	Update(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
}

type noteController struct{ svc service.NoteService }

func NewNoteController(services *service.Services) NoteController {
	return &noteController{services.Note}
}

func (c *noteController) FindAll(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	refType := model.NoteRefType(ctx.Query("ref_type"))
	refID, _ := strconv.Atoi(ctx.Query("ref_id"))
	items, err := c.svc.FindByUser(userID, refType, refID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, items)
}

func (c *noteController) Create(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.CreateNoteRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.Create(userID, req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, item)
}

func (c *noteController) Update(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "id tidak valid")
	}
	req := new(model.UpdateNoteRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.Update(id, userID, req)
	if err != nil {
		return lib.ErrorForbidden(ctx, "akses ditolak atau catatan tidak ditemukan")
	}
	return lib.OK(ctx, item)
}

func (c *noteController) Delete(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "id tidak valid")
	}
	if err := c.svc.Delete(id, userID); err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, nil)
}
