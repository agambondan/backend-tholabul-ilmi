package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type CommentController interface {
	FindByRef(ctx *fiber.Ctx) error
	Create(ctx *fiber.Ctx) error
	Hide(ctx *fiber.Ctx) error
	Report(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
}

type commentController struct{ svc service.CommentService }

func NewCommentController(services *service.Services) CommentController {
	return &commentController{services.Comment}
}

// @Summary Get comments by reference
// @Tags Sosial
// @Produce json
// @Param ref_type query string true "Reference type"
// @Param ref_id query int true "Reference ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /comments [get]
func (c *commentController) FindByRef(ctx *fiber.Ctx) error {
	refType := model.CommentRefType(ctx.Query("ref_type"))
	refID, err := strconv.Atoi(ctx.Query("ref_id"))
	if err != nil || refID == 0 {
		return lib.ErrorBadRequest(ctx, "ref_type dan ref_id wajib diisi")
	}
	var viewerID *uuid.UUID
	if userID, err := extractUserID(ctx); err == nil {
		viewerID = &userID
	}
	items, err := c.svc.FindByRef(refType, refID, viewerID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, items)
}

// @Summary Create comment
// @Tags Sosial
// @Accept json
// @Produce json
// @Param body body model.CreateCommentRequest true "Comment data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /comments [post]
func (c *commentController) Create(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.CreateCommentRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.Create(userID, req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, item)
}

// @Summary Hide comment for current user
// @Tags Sosial
// @Produce json
// @Param id path int true "Comment ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /comments/{id}/hide [post]
func (c *commentController) Hide(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "id tidak valid")
	}
	action, err := c.svc.Hide(id, userID)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, action)
}

// @Summary Report comment
// @Tags Sosial
// @Accept json
// @Produce json
// @Param id path int true "Comment ID"
// @Param body body model.SocialModerationRequest false "Report reason"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /comments/{id}/report [post]
func (c *commentController) Report(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "id tidak valid")
	}
	req := new(model.SocialModerationRequest)
	if len(ctx.Body()) > 0 {
		if err := lib.BodyParser(ctx, req); err != nil {
			return lib.ErrorBadRequest(ctx, err)
		}
	}
	action, err := c.svc.Report(id, userID, req.Reason)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, action)
}

// @Summary Delete comment
// @Tags Sosial
// @Produce json
// @Param id path int true "Comment ID"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /comments/{id} [delete]
func (c *commentController) Delete(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "id tidak valid")
	}
	claims, _ := lib.ExtractToken(ctx)
	isAdmin := claims["role"] == string(model.RoleAdmin)
	if err := c.svc.Delete(id, userID, isAdmin); err != nil {
		if err.Error() == "forbidden" {
			return lib.ErrorForbidden(ctx)
		}
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, nil)
}
