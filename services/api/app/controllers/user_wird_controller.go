package controllers

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type UserWirdController interface {
	Create(ctx *fiber.Ctx) error
	List(ctx *fiber.Ctx) error
	Update(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
}

type userWirdController struct {
	svc service.UserWirdService
}

func NewUserWirdController(services *service.Services) UserWirdController {
	return &userWirdController{services.UserWird}
}

// Create a new user wird
// @Summary Create a user wird
// @Tags Ibadah, User Wird
// @Accept json
// @Produce json
// @Param request body model.CreateUserWirdRequest true "User wird request"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Router /user-wird [post]
func (c *userWirdController) Create(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.CreateUserWirdRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if req.Title == "" {
		return lib.ErrorBadRequest(ctx, "title is required")
	}
	w, err := c.svc.Create(userID, req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, w)
}

// FindAll get all user wirds
// @Summary Get all user wirds
// @Tags Ibadah, User Wird
// @Accept json
// @Produce json
// @Success 200 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Router /user-wird [get]
func (c *userWirdController) List(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	list, err := c.svc.List(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, list)
}

// UpdateById update a user wird
// @Summary Update a user wird by ID
// @Tags Ibadah, User Wird
// @Accept json
// @Produce json
// @Param id path string true "User wird ID (uuid)"
// @Param request body model.UpdateUserWirdRequest true "User wird update request"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /user-wird/{id} [put]
func (c *userWirdController) Update(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	id, err := uuid.Parse(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	req := new(model.UpdateUserWirdRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	w, err := c.svc.Update(id, userID, req)
	if err != nil {
		if err.Error() == "wird not found" {
			return lib.ErrorNotFound(ctx)
		}
		if err.Error() == "forbidden" {
			return lib.ErrorUnauthorized(ctx)
		}
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, w)
}

// DeleteById delete a user wird
// @Summary Delete a user wird by ID
// @Tags Ibadah, User Wird
// @Accept json
// @Produce json
// @Param id path string true "User wird ID (uuid)"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Failure 401 {object} lib.Response
// @Failure 404 {object} lib.Response
// @Router /user-wird/{id} [delete]
func (c *userWirdController) Delete(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	id, err := uuid.Parse(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.Delete(id, userID); err != nil {
		if err.Error() == "wird not found" {
			return lib.ErrorNotFound(ctx)
		}
		if err.Error() == "forbidden" {
			return lib.ErrorUnauthorized(ctx)
		}
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx)
}
