package controllers

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type FeedController interface {
	FindAll(ctx *fiber.Ctx) error
	FindByID(ctx *fiber.Ctx) error
	Create(ctx *fiber.Ctx) error
	Like(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
}

type feedController struct {
	svc service.FeedService
}

func NewFeedController(services *service.Services) FeedController {
	return &feedController{services.Feed}
}

// @Summary Get feed posts
// @Tags Sosial
// @Produce json
// @Param ref_type query string false "Filter by reference type"
// @Success 200 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /feed [get]
func (c *feedController) FindAll(ctx *fiber.Ctx) error {
	refType := model.FeedRefType(ctx.Query("ref_type"))
	return lib.OK(ctx, c.svc.FindAll(ctx, refType))
}

// @Summary Get feed post by ID
// @Tags Sosial
// @Produce json
// @Param id path string true "Post ID"
// @Success 200 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /feed/{id} [get]
func (c *feedController) FindByID(ctx *fiber.Ctx) error {
	post, err := c.svc.FindByID(ctx.Params("id"))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, post)
}

// @Summary Create feed post
// @Tags Sosial
// @Accept json
// @Produce json
// @Param body body model.CreateFeedPostRequest true "Post data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Router /feed [post]
func (c *feedController) Create(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.CreateFeedPostRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	post, err := c.svc.CreatePost(userID, req)
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	return lib.OK(ctx, post)
}

// @Summary Like feed post
// @Tags Sosial
// @Produce json
// @Param id path string true "Post ID"
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /feed/{id}/like [post]
func (c *feedController) Like(ctx *fiber.Ctx) error {
	if _, err := extractUserID(ctx); err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	post, err := c.svc.LikePost(ctx.Params("id"))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, post)
}

// @Summary Delete feed post
// @Tags Sosial
// @Produce json
// @Param id path string true "Post ID"
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 403 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /feed/{id} [delete]
func (c *feedController) Delete(ctx *fiber.Ctx) error {
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
