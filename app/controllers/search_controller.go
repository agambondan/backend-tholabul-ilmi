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

	result, err := c.svc.Search(q, searchType, limit)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, result)
}
