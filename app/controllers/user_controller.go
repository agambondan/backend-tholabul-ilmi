package controllers

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type UserController interface {
	Register(ctx *fiber.Ctx) error
	Login(ctx *fiber.Ctx) error
	Me(ctx *fiber.Ctx) error
	FindAll(ctx *fiber.Ctx) error
	FindById(ctx *fiber.Ctx) error
	UpdateById(ctx *fiber.Ctx) error
	UpdatePassword(ctx *fiber.Ctx) error
	DeleteById(ctx *fiber.Ctx) error
}

type userController struct {
	user service.UserService
}

func NewUserController(services *service.Services) UserController {
	return &userController{services.User}
}

func (c *userController) Register(ctx *fiber.Ctx) error {
	req := new(model.RegisterRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	user, err := c.user.Register(req)
	if err != nil {
		return lib.ErrorConflict(ctx, err)
	}
	user.Password = nil
	return lib.OK(ctx, user)
}

func (c *userController) Login(ctx *fiber.Ctx) error {
	req := new(model.LoginRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	resp, err := c.user.Login(req)
	if err != nil {
		return lib.ErrorUnauthorized(ctx, err.Error())
	}
	return lib.OK(ctx, resp)
}

func (c *userController) Me(ctx *fiber.Ctx) error {
	claims, err := lib.ExtractToken(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	userID, ok := claims["user_id"].(string)
	if !ok {
		return lib.ErrorUnauthorized(ctx)
	}
	user, err := c.user.FindById(userID)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	user.Password = nil
	return lib.OK(ctx, user)
}

func (c *userController) FindAll(ctx *fiber.Ctx) error {
	page := c.user.FindAll(ctx)
	return lib.OK(ctx, page)
}

func (c *userController) FindById(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	user, err := c.user.FindById(id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	user.Password = nil
	return lib.OK(ctx, user)
}

func (c *userController) UpdateById(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	data := new(model.User)
	if err := lib.BodyParser(ctx, data); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	user, err := c.user.UpdateById(id, data)
	if err != nil {
		return lib.ErrorNotFound(ctx, err.Error())
	}
	user.Password = nil
	return lib.OK(ctx, user)
}

func (c *userController) UpdatePassword(ctx *fiber.Ctx) error {
	claims, err := lib.ExtractToken(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	userID, ok := claims["user_id"].(string)
	if !ok {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.UpdatePasswordRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if err := c.user.UpdatePassword(userID, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	return lib.OK(ctx)
}

func (c *userController) DeleteById(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if err := c.user.DeleteById(id); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
