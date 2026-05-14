package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type SearchController interface {
	Search(ctx *fiber.Ctx) error
}

type searchController struct {
	svc service.SearchService
}

func NewSearchController(services *service.Services) SearchController {
	return &searchController{services.Search}
}

func (c *searchController) Search(ctx *fiber.Ctx) error {
	q := ctx.Query("q")
	if q == "" {
		return lib.ErrorBadRequest(ctx, "query parameter 'q' is required")
	}
	searchType := ctx.Query("type", "all")
	limit, _ := strconv.Atoi(ctx.Query("limit", "20"))
	lang := lib.GetPreferredLang(ctx)

	result, err := c.svc.Search(q, searchType, limit)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}

	for i := range result.Ayahs {
		result.Ayahs[i].Translation.FilterByLang(lang)
		if result.Ayahs[i].Surah != nil {
			result.Ayahs[i].Surah.Translation.FilterByLang(lang)
		}
	}
	for i := range result.Hadiths {
		result.Hadiths[i].Translation.FilterByLang(lang)
		if result.Hadiths[i].Book != nil {
			result.Hadiths[i].Book.Translation.FilterByLang(lang)
		}
		if result.Hadiths[i].Theme != nil {
			result.Hadiths[i].Theme.Translation.FilterByLang(lang)
		}
		if result.Hadiths[i].Chapter != nil {
			result.Hadiths[i].Chapter.Translation.FilterByLang(lang)
		}
	}
	for i := range result.Doas {
		result.Doas[i].Translation.FilterByLang(lang)
	}
	for i := range result.Kajians {
		result.Kajians[i].Translation.FilterByLang(lang)
	}

	return lib.OK(ctx, result)
}
