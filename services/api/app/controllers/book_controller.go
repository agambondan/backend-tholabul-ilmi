package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type BookController interface {
	Create(ctx *fiber.Ctx) error
	FindAll(ctx *fiber.Ctx) error
	FindById(ctx *fiber.Ctx) error
	FindBySlug(ctx *fiber.Ctx) error
	UpdateById(ctx *fiber.Ctx) error
	DeleteById(ctx *fiber.Ctx) error
}

type bookController struct {
	book service.BookService
}

// NewBookController implements the BookController Interface
func NewBookController(services *service.Services) BookController {
	return &bookController{services.Book}
}

// Create book
// @Summary Create book
// @Description Create a new book entry
// @Accept json
// @Produce json
// @Param body body model.Book true "Book data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 409 {object} lib.Response
// @Router /books [post]
// @Tags Books
func (c *bookController) Create(ctx *fiber.Ctx) error {
	data := new(model.Book)
	if err := lib.BodyParser(ctx, data); nil != err {
		return lib.ErrorBadRequest(ctx, err)
	}
	if _, err := c.book.Create(data); err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, data)
}

// FindAll book
// @Summary List all books
// @Description Get paginated list of all books
// @Accept json
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Router /books [get]
// @Tags Books
func (c *bookController) FindAll(ctx *fiber.Ctx) error {
	page := c.book.FindAll(ctx)
	return lib.OK(ctx, page)
}

// FindById book
// @Summary Get book by ID
// @Description Get a single book by its ID
// @Accept json
// @Produce json
// @Param id path int true "Book ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /books/{id} [get]
// @Tags Books
func (c *bookController) FindById(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data, err := c.book.FindById(&id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

// FindBySlug book
// @Summary Get book by slug
// @Description Get a single book by its slug
// @Accept json
// @Produce json
// @Param slug path string true "Book slug"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /books/slug/{slug} [get]
// @Tags Books
func (c *bookController) FindBySlug(ctx *fiber.Ctx) error {
	slug := ctx.Params("slug")
	data, err := c.book.FindBySlug(ctx, lib.Strptr(slug))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, data)
}

// UpdateById book
// @Summary Update book
// @Description Update book by ID
// @Accept json
// @Produce json
// @Param id path int true "Book ID"
// @Param body body model.Book true "Book data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /books/{id} [put]
// @Tags Books
func (c *bookController) UpdateById(ctx *fiber.Ctx) error {
	data := new(model.Book)
	if err := lib.BodyParser(ctx, data); nil != err {
		return lib.ErrorBadRequest(ctx, err)
	}
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if _, err = c.book.UpdateById(&id, data); err != nil {
		return lib.ErrorNotFound(ctx, err.Error())
	}
	return lib.OK(ctx, data)
}

// DeleteById book
// @Summary Delete book
// @Description Delete book by ID
// @Accept json
// @Produce json
// @Param id path int true "Book ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /books/{id} [delete]
// @Tags Books
func (c *bookController) DeleteById(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	scoped := ctx.Params("scoped")
	err = c.book.DeleteById(&id, &scoped)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
