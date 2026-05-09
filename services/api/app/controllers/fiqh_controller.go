package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type FiqhController interface {
	FindAllCategories(ctx *fiber.Ctx) error
	FindCategoryBySlug(ctx *fiber.Ctx) error
	FindItemBySlug(ctx *fiber.Ctx) error
	FindItemByCategoryAndID(ctx *fiber.Ctx) error
	CreateCategory(ctx *fiber.Ctx) error
	UpdateCategory(ctx *fiber.Ctx) error
	DeleteCategory(ctx *fiber.Ctx) error
	CreateItem(ctx *fiber.Ctx) error
	UpdateItem(ctx *fiber.Ctx) error
	DeleteItem(ctx *fiber.Ctx) error
}

type fiqhController struct {
	svc service.FiqhService
}

func NewFiqhController(services *service.Services) FiqhController {
	return &fiqhController{services.Fiqh}
}

func (c *fiqhController) FindAllCategories(ctx *fiber.Ctx) error {
	list, err := c.svc.FindAllCategories()
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	for i := range list {
		list[i].Translation.FilterByLang(lang)
	}
	return lib.OK(ctx, list)
}

func (c *fiqhController) FindCategoryBySlug(ctx *fiber.Ctx) error {
	cat, err := c.svc.FindCategoryBySlug(ctx.Params("slug"))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	cat.Translation.FilterByLang(lang)
	for i := range cat.Items {
		cat.Items[i].Translation.FilterByLang(lang)
	}
	return lib.OK(ctx, cat)
}

func (c *fiqhController) FindItemBySlug(ctx *fiber.Ctx) error {
	item, err := c.svc.FindItemBySlug(ctx.Params("slug"))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	item.Translation.FilterByLang(lib.GetPreferredLang(ctx))
	return lib.OK(ctx, item)
}

func (c *fiqhController) FindItemByCategoryAndID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	item, err := c.svc.FindItemByCategoryAndID(ctx.Params("slug"), id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	item.Translation.FilterByLang(lib.GetPreferredLang(ctx))
	return lib.OK(ctx, item)
}

func (c *fiqhController) CreateCategory(ctx *fiber.Ctx) error {
	req := new(model.CreateFiqhCategoryRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	cat, err := c.svc.CreateCategory(req)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, cat)
}

func (c *fiqhController) UpdateCategory(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	req := new(model.CreateFiqhCategoryRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	cat, err := c.svc.UpdateCategory(id, req)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, cat)
}

func (c *fiqhController) DeleteCategory(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.DeleteCategory(id); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}

func (c *fiqhController) CreateItem(ctx *fiber.Ctx) error {
	req := new(model.CreateFiqhItemRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.CreateItem(req)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, item)
}

func (c *fiqhController) UpdateItem(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	req := new(model.CreateFiqhItemRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.UpdateItem(id, req)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, item)
}

func (c *fiqhController) DeleteItem(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.DeleteItem(id); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
