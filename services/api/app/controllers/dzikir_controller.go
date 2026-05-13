package controllers

import (
	"strconv"
	"strings"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type DzikirController interface {
	FindAll(ctx *fiber.Ctx) error
	FindByID(ctx *fiber.Ctx) error
	FindByCategory(ctx *fiber.Ctx) error
	FindByOccasion(ctx *fiber.Ctx) error
	Create(ctx *fiber.Ctx) error
	Update(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
}

type dzikirController struct {
	svc service.DzikirService
}

type dzikirAdminRequest struct {
	Title           string `json:"title"`
	Arabic          string `json:"arabic"`
	Transliteration string `json:"transliteration"`
	Translation     string `json:"translation"`
	Count           int    `json:"count"`
	Category        string `json:"category"`
	Occasion        string `json:"occasion"`
	Source          string `json:"source"`
	AudioURL        string `json:"audio_url"`
}

func NewDzikirController(services *service.Services) DzikirController {
	return &dzikirController{services.Dzikir}
}

func (c *dzikirController) FindAll(ctx *fiber.Ctx) error {
	list, err := c.svc.FindAll()
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	for i := range list {
		if list[i].Translation != nil {
			list[i].Translation.FilterByLang(lang)
		}
	}
	return lib.OK(ctx, list)
}

func (c *dzikirController) FindByID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	d, err := c.svc.FindByID(id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	if d.Translation != nil {
		d.Translation.FilterByLang(lib.GetPreferredLang(ctx))
	}
	return lib.OK(ctx, d)
}

func (c *dzikirController) FindByCategory(ctx *fiber.Ctx) error {
	category := ctx.Params("category")
	list, err := c.svc.FindByCategory(category)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	for i := range list {
		if list[i].Translation != nil {
			list[i].Translation.FilterByLang(lang)
		}
	}
	return lib.OK(ctx, list)
}

func (c *dzikirController) FindByOccasion(ctx *fiber.Ctx) error {
	occasion := ctx.Params("occasion")
	list, err := c.svc.FindByOccasion(occasion)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	lang := lib.GetPreferredLang(ctx)
	for i := range list {
		if list[i].Translation != nil {
			list[i].Translation.FilterByLang(lang)
		}
	}
	return lib.OK(ctx, list)
}

func (c *dzikirController) Create(ctx *fiber.Ctx) error {
	req := new(dzikirAdminRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.Create(dzikirFromAdminRequest(req))
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, item)
}

func (c *dzikirController) Update(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	req := new(dzikirAdminRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.Update(id, dzikirFromAdminRequest(req))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, item)
}

func (c *dzikirController) Delete(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if err := c.svc.Delete(id); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}

func dzikirFromAdminRequest(req *dzikirAdminRequest) *model.Dzikir {
	count := req.Count
	if count <= 0 {
		count = 1
	}
	category := normalizeDzikirCategory(req.Category)
	title := strings.TrimSpace(req.Title)
	return &model.Dzikir{
		Category:        category,
		Occasion:        strings.TrimSpace(req.Occasion),
		Title:           title,
		Arabic:          req.Arabic,
		Transliteration: req.Transliteration,
		TranslationText: req.Translation,
		Count:           count,
		Source:          req.Source,
		AudioURL:        req.AudioURL,
	}
}

func normalizeDzikirCategory(raw string) model.DzikirCategory {
	switch strings.TrimSpace(raw) {
	case "sesudah-sholat", "sesudah_sholat", "setelah-sholat":
		return model.DzikirSetelahSholat
	case "malam":
		return model.DzikirTidur
	case "umum", "":
		return model.DzikirUmum
	default:
		return model.DzikirCategory(strings.ReplaceAll(raw, "-", "_"))
	}
}
