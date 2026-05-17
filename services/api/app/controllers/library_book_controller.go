package controllers

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type LibraryBookController interface {
	FindAll(ctx *fiber.Ctx) error
	FindBySlug(ctx *fiber.Ctx) error
}

type libraryBookController struct {
	svc service.LibraryBookService
}

func NewLibraryBookController(services *service.Services) LibraryBookController {
	return &libraryBookController{svc: services.LibraryBook}
}

// @Summary Get library books
// @Tags Belajar
// @Accept json
// @Produce json
// @Param category query string false "Filter by category"
// @Param level query string false "Filter by level"
// @Param search query string false "Search keyword"
// @Param page query int false "Page number"
// @Param size query int false "Page size"
// @Success 200 {object} lib.Response
// @Router /library/books [get]
func (c *libraryBookController) FindAll(ctx *fiber.Ctx) error {
	page := c.svc.FindAll(ctx, ctx.Query("category"), ctx.Query("level"), ctx.Query("search"))
	return lib.OK(ctx, page)
}

// @Summary Get library book by slug
// @Tags Belajar
// @Accept json
// @Produce json
// @Param slug path string true "Book slug"
// @Success 200 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /library/books/{slug} [get]
func (c *libraryBookController) FindBySlug(ctx *fiber.Ctx) error {
	book, err := c.svc.FindBySlug(ctx.Params("slug"))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, book)
}
