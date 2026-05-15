package controllers

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type BookmarkController interface {
	Add(ctx *fiber.Ctx) error
	FindAll(ctx *fiber.Ctx) error
	Update(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
}

type bookmarkController struct {
	svc service.BookmarkService
}

func NewBookmarkController(services *service.Services) BookmarkController {
	return &bookmarkController{services.Bookmark}
}

// @Summary Create bookmark
// @Tags Personal
// @Accept json
// @Produce json
// @Param body body object{ref_type=string,ref_id=int,ref_slug=string,color=string,label=string} true "Bookmark data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 409 {object} lib.Response
// @Router /bookmarks [post]
func (c *bookmarkController) Add(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}

	req := new(struct {
		RefType model.BookmarkType `json:"ref_type"`
		RefID   int                `json:"ref_id"`
		RefSlug string             `json:"ref_slug"`
		Color   string             `json:"color"`
		Label   string             `json:"label"`
	})
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if req.RefType != model.BookmarkAyah && req.RefType != model.BookmarkHadith && req.RefType != model.BookmarkArticle {
		return lib.ErrorBadRequest(ctx, "ref_type must be 'ayah', 'hadith', or 'article'")
	}
	if len(req.Label) > 64 {
		return lib.ErrorBadRequest(ctx, "label too long (max 64 chars)")
	}

	if req.RefType == model.BookmarkArticle {
		if req.RefSlug == "" {
			return lib.ErrorBadRequest(ctx, "ref_slug is required for article bookmarks")
		}
		bookmark, err := c.svc.AddBySlug(userID, req.RefType, req.RefSlug, req.Color, req.Label)
		if err != nil {
			return lib.ErrorConflict(ctx, err)
		}
		return lib.OK(ctx, bookmark)
	}

	if req.RefID <= 0 {
		return lib.ErrorBadRequest(ctx, "ref_id is required")
	}
	bookmark, err := c.svc.Add(userID, req.RefType, req.RefID, req.Color, req.Label)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	return lib.OK(ctx, bookmark)
}

// @Summary Update bookmark
// @Tags Personal
// @Accept json
// @Produce json
// @Param id path string true "Bookmark ID (UUID)"
// @Param body body model.UpdateBookmarkRequest true "Update data"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /bookmarks/{id} [put]
func (c *bookmarkController) Update(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}

	idStr := ctx.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}

	req := new(model.UpdateBookmarkRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if req.Label != nil && len(*req.Label) > 64 {
		return lib.ErrorBadRequest(ctx, "label too long (max 64 chars)")
	}

	bookmark, err := c.svc.UpdateMeta(id, userID, req.Color, req.Label)
	if err != nil {
		if err.Error() == "bookmark not found" {
			return lib.ErrorNotFound(ctx)
		}
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, bookmark)
}

// @Summary Get all bookmarks
// @Tags Personal
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 500 {object} lib.Response
// @Router /bookmarks [get]
func (c *bookmarkController) FindAll(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}

	bookmarks, err := c.svc.FindByUserID(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, bookmarks)
}

// @Summary Delete bookmark
// @Tags Personal
// @Produce json
// @Param id path string true "Bookmark ID (UUID)"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /bookmarks/{id} [delete]
func (c *bookmarkController) Delete(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}

	idStr := ctx.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}

	if err := c.svc.Delete(id, userID); err != nil {
		if err.Error() == "forbidden" {
			return lib.ErrorUnauthorized(ctx)
		}
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}

func extractUserID(ctx *fiber.Ctx) (uuid.UUID, error) {
	claims, err := lib.ExtractToken(ctx)
	if err != nil {
		return uuid.Nil, err
	}
	userIDStr, ok := claims["user_id"].(string)
	if !ok {
		return uuid.Nil, fiber.ErrUnauthorized
	}
	return uuid.Parse(userIDStr)
}
