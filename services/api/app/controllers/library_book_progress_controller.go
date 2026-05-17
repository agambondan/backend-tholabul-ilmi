package controllers

import (
	"errors"
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type LibraryBookProgressController interface {
	FindAll(ctx *fiber.Ctx) error
	FindByBook(ctx *fiber.Ctx) error
	Update(ctx *fiber.Ctx) error
}

type libraryBookProgressController struct {
	svc service.LibraryBookProgressService
}

func NewLibraryBookProgressController(services *service.Services) LibraryBookProgressController {
	return &libraryBookProgressController{svc: services.LibraryBookProgress}
}

func (c *libraryBookProgressController) FindAll(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	items, err := c.svc.FindAll(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, items)
}

func (c *libraryBookProgressController) FindByBook(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	bookID, err := strconv.Atoi(ctx.Params("bookId"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid book id")
	}
	progress, err := c.svc.FindByBook(userID, bookID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return lib.OK(ctx, nil)
		}
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, progress)
}

func (c *libraryBookProgressController) Update(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	bookID, err := strconv.Atoi(ctx.Params("bookId"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid book id")
	}
	req := new(model.UpdateLibraryBookProgressRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	progress, err := c.svc.Update(userID, bookID, req)
	if err != nil {
		if errors.Is(err, service.ErrInvalidLibraryBookProgressStatus) {
			return lib.ErrorBadRequest(ctx, err)
		}
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, progress)
}
