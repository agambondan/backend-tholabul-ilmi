package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type DictionaryController interface {
	FindAll(ctx *fiber.Ctx) error
	FindByTerm(ctx *fiber.Ctx) error
	FindByCategory(ctx *fiber.Ctx) error
	Create(ctx *fiber.Ctx) error
	Update(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
}

type dictionaryController struct{ svc service.DictionaryService }

func NewDictionaryController(services *service.Services) DictionaryController {
	return &dictionaryController{services.Dictionary}
}

// @Summary Get all dictionary terms
// @Tags Belajar
// @Accept json
// @Produce json
// @Param category query string false "Filter by category"
// @Param q query string false "Search keyword"
// @Success 200 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /dictionary [get]
func (c *dictionaryController) FindAll(ctx *fiber.Ctx) error {
	category := ctx.Query("category")
	search := ctx.Query("q")
	items, err := c.svc.FindAll(category, search)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	for i := range items {
		items[i].Translation.FilterByLang(lang)
	}
	return lib.OK(ctx, items)
}

// @Summary Get dictionary term by term
// @Tags Belajar
// @Accept json
// @Produce json
// @Param term path string true "Term name"
// @Success 200 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /dictionary/{term} [get]
func (c *dictionaryController) FindByTerm(ctx *fiber.Ctx) error {
	item, err := c.svc.FindByTerm(ctx.Params("term"))
	if err != nil {
		return lib.ErrorNotFound(ctx, "istilah tidak ditemukan")
	}
	item.Translation.FilterByLang(lib.GetPreferredLang(ctx))
	return lib.OK(ctx, item)
}

// @Summary Get dictionary terms by category
// @Tags Belajar
// @Accept json
// @Produce json
// @Param category path string true "Category name"
// @Success 200 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /dictionary/category/{category} [get]
func (c *dictionaryController) FindByCategory(ctx *fiber.Ctx) error {
	items, err := c.svc.FindByCategory(model.TermCategory(ctx.Params("category")))
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	for i := range items {
		items[i].Translation.FilterByLang(lang)
	}
	return lib.OK(ctx, items)
}

// @Summary Create a dictionary term
// @Tags Belajar
// @Accept json
// @Produce json
// @Param term body model.CreateIslamicTermRequest true "Term data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 409 {object} lib.Response
// @Router /dictionary [post]
func (c *dictionaryController) Create(ctx *fiber.Ctx) error {
	req := new(model.CreateIslamicTermRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.Create(req)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, item)
}

// @Summary Update a dictionary term
// @Tags Belajar
// @Accept json
// @Produce json
// @Param id path int true "Term ID"
// @Param term body model.CreateIslamicTermRequest true "Term data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /dictionary/{id} [put]
func (c *dictionaryController) Update(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "id tidak valid")
	}
	req := new(model.CreateIslamicTermRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.Update(id, req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, item)
}

// @Summary Delete a dictionary term
// @Tags Belajar
// @Accept json
// @Produce json
// @Param id path int true "Term ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /dictionary/{id} [delete]
func (c *dictionaryController) Delete(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "id tidak valid")
	}
	if err := c.svc.Delete(id); err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, nil)
}
