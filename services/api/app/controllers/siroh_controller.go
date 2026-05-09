package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type SirohController interface {
	FindAllCategories(ctx *fiber.Ctx) error
	FindCategoryBySlug(ctx *fiber.Ctx) error
	FindContentBySlug(ctx *fiber.Ctx) error
	FindAllContents(ctx *fiber.Ctx) error
	CreateCategory(ctx *fiber.Ctx) error
	CreateContent(ctx *fiber.Ctx) error
	UpdateCategory(ctx *fiber.Ctx) error
	UpdateContent(ctx *fiber.Ctx) error
	DeleteCategory(ctx *fiber.Ctx) error
	DeleteContent(ctx *fiber.Ctx) error
}

type sirohController struct {
	svc service.SirohService
}

func NewSirohController(services *service.Services) SirohController {
	return &sirohController{services.Siroh}
}

func (c *sirohController) FindAllCategories(ctx *fiber.Ctx) error {
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

func (c *sirohController) FindCategoryBySlug(ctx *fiber.Ctx) error {
	cat, err := c.svc.FindCategoryBySlug(ctx.Params("slug"))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	cat.Translation.FilterByLang(lang)
	for i := range cat.Contents {
		cat.Contents[i].Translation.FilterByLang(lang)
	}
	return lib.OK(ctx, cat)
}

func (c *sirohController) FindContentBySlug(ctx *fiber.Ctx) error {
	content, err := c.svc.FindContentBySlug(ctx.Params("slug"))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	content.Translation.FilterByLang(lang)
	if content.Category != nil {
		content.Category.Translation.FilterByLang(lang)
	}
	return lib.OK(ctx, content)
}

func (c *sirohController) FindAllContents(ctx *fiber.Ctx) error {
	page := c.svc.FindAllContents(ctx)
	lang := lib.GetPreferredLang(ctx)
	lib.ApplyToPageItems(page, func(s *model.SirohContent) {
		s.Translation.FilterByLang(lang)
		if s.Category != nil {
			s.Category.Translation.FilterByLang(lang)
		}
	})
	return lib.OK(ctx, page)
}

func (c *sirohController) CreateCategory(ctx *fiber.Ctx) error {
	cat := new(model.SirohCategory)
	if err := lib.BodyParser(ctx, cat); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	result, err := c.svc.SaveCategory(cat)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, result)
}

func (c *sirohController) CreateContent(ctx *fiber.Ctx) error {
	content := new(model.SirohContent)
	if err := lib.BodyParser(ctx, content); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	result, err := c.svc.SaveContent(content)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, result)
}

func (c *sirohController) UpdateCategory(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	cat := new(model.SirohCategory)
	if err := lib.BodyParser(ctx, cat); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	result, err := c.svc.UpdateCategory(id, cat)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, result)
}

func (c *sirohController) UpdateContent(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	content := new(model.SirohContent)
	if err := lib.BodyParser(ctx, content); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	result, err := c.svc.UpdateContent(id, content)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, result)
}

func (c *sirohController) DeleteCategory(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.DeleteCategory(id); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}

func (c *sirohController) DeleteContent(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.DeleteContent(id); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
