package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type BlogController interface {
	FindAllPosts(ctx *fiber.Ctx) error
	FindPostBySlug(ctx *fiber.Ctx) error
	FindRelatedPosts(ctx *fiber.Ctx) error
	FindPopularPosts(ctx *fiber.Ctx) error
	PreviewPost(ctx *fiber.Ctx) error
	CreatePost(ctx *fiber.Ctx) error
	UpdatePost(ctx *fiber.Ctx) error
	DeletePost(ctx *fiber.Ctx) error
	FindPostsByCategorySlug(ctx *fiber.Ctx) error
	FindPostsByTagSlug(ctx *fiber.Ctx) error
	FindAllCategories(ctx *fiber.Ctx) error
	CreateCategory(ctx *fiber.Ctx) error
	UpdateCategory(ctx *fiber.Ctx) error
	DeleteCategory(ctx *fiber.Ctx) error
	FindAllTags(ctx *fiber.Ctx) error
	CreateTag(ctx *fiber.Ctx) error
	DeleteTag(ctx *fiber.Ctx) error
}

type blogController struct {
	svc service.BlogService
}

func NewBlogController(services *service.Services) BlogController {
	return &blogController{services.Blog}
}

func (c *blogController) FindAllPosts(ctx *fiber.Ctx) error {
	var categoryID *int
	var tagID *int
	if v := ctx.QueryInt("category_id", 0); v > 0 {
		categoryID = &v
	}
	if v := ctx.QueryInt("tag_id", 0); v > 0 {
		tagID = &v
	}
	return lib.OK(ctx, c.svc.FindAllPosts(ctx, categoryID, tagID, ctx.Query("search")))
}

func (c *blogController) FindPostBySlug(ctx *fiber.Ctx) error {
	post, err := c.svc.FindPostBySlug(ctx.Params("slug"))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, post)
}

func (c *blogController) FindRelatedPosts(ctx *fiber.Ctx) error {
	posts, err := c.svc.FindRelatedPosts(ctx.Params("slug"))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, posts)
}

func (c *blogController) FindPopularPosts(ctx *fiber.Ctx) error {
	posts, err := c.svc.FindPopularPosts(ctx.QueryInt("limit", 10))
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, posts)
}

func (c *blogController) PreviewPost(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	claims, _ := lib.ExtractToken(ctx)
	isAdmin := claims["role"] == string(model.RoleAdmin)
	post, err := c.svc.PreviewPost(ctx.Params("id"), userID, isAdmin)
	if err != nil {
		if err.Error() == "forbidden" {
			return lib.ErrorForbidden(ctx)
		}
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, post)
}

func (c *blogController) CreatePost(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.CreateBlogPostRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	post, err := c.svc.CreatePost(userID, req)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, post)
}

func (c *blogController) UpdatePost(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	claims, _ := lib.ExtractToken(ctx)
	isAdmin := claims["role"] == string(model.RoleAdmin)

	req := new(model.UpdateBlogPostRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	post, err := c.svc.UpdatePost(ctx.Params("id"), userID, isAdmin, req)
	if err != nil {
		if err.Error() == "forbidden" {
			return lib.ErrorForbidden(ctx)
		}
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, post)
}

func (c *blogController) DeletePost(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	claims, _ := lib.ExtractToken(ctx)
	isAdmin := claims["role"] == string(model.RoleAdmin)

	if err := c.svc.DeletePost(ctx.Params("id"), userID, isAdmin); err != nil {
		if err.Error() == "forbidden" {
			return lib.ErrorForbidden(ctx)
		}
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}

func (c *blogController) FindPostsByCategorySlug(ctx *fiber.Ctx) error {
	slug := ctx.Params("slug")
	page := c.svc.FindPostsByCategorySlug(ctx, slug)
	return lib.OK(ctx, page)
}

func (c *blogController) FindPostsByTagSlug(ctx *fiber.Ctx) error {
	slug := ctx.Params("slug")
	page := c.svc.FindPostsByTagSlug(ctx, slug)
	return lib.OK(ctx, page)
}

func (c *blogController) FindAllCategories(ctx *fiber.Ctx) error {
	list, err := c.svc.FindAllCategories()
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, list)
}

func (c *blogController) CreateCategory(ctx *fiber.Ctx) error {
	req := new(model.CreateBlogCategoryRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	cat, err := c.svc.CreateCategory(req)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, cat)
}

func (c *blogController) UpdateCategory(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	req := new(model.CreateBlogCategoryRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	cat, err := c.svc.UpdateCategory(id, req)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, cat)
}

func (c *blogController) DeleteCategory(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.DeleteCategory(id); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}

func (c *blogController) FindAllTags(ctx *fiber.Ctx) error {
	list, err := c.svc.FindAllTags()
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, list)
}

func (c *blogController) CreateTag(ctx *fiber.Ctx) error {
	req := new(model.CreateBlogTagRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	tag, err := c.svc.CreateTag(req)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, tag)
}

func (c *blogController) DeleteTag(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.DeleteTag(id); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
