package controllers

import (
	"time"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
	"github.com/spf13/viper"
)

type UserController interface {
	Register(ctx *fiber.Ctx) error
	Login(ctx *fiber.Ctx) error
	Refresh(ctx *fiber.Ctx) error
	Logout(ctx *fiber.Ctx) error
	ForgotPassword(ctx *fiber.Ctx) error
	ResetPassword(ctx *fiber.Ctx) error
	Me(ctx *fiber.Ctx) error
	FindAll(ctx *fiber.Ctx) error
	FindById(ctx *fiber.Ctx) error
	UpdateProfile(ctx *fiber.Ctx) error
	UpdateById(ctx *fiber.Ctx) error
	UpdatePassword(ctx *fiber.Ctx) error
	UpdateRole(ctx *fiber.Ctx) error
	DeleteById(ctx *fiber.Ctx) error
}

type userController struct {
	user service.UserService
}

func NewUserController(services *service.Services) UserController {
	return &userController{services.User}
}

func setAuthCookies(ctx *fiber.Ctx, accessToken, refreshToken string) {
	secure := viper.GetString("ENVIRONMENT") == "production"
	ctx.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    accessToken,
		Path:     "/",
		HTTPOnly: true,
		Secure:   secure,
		SameSite: "Lax",
		Expires:  time.Now().Add(24 * time.Hour),
	})
	if refreshToken != "" {
		ctx.Cookie(&fiber.Cookie{
			Name:     "refresh_token",
			Value:    refreshToken,
			Path:     "/",
			HTTPOnly: true,
			Secure:   secure,
			SameSite: "Lax",
			Expires:  time.Now().Add(7 * 24 * time.Hour),
		})
	}
}

func clearAuthCookies(ctx *fiber.Ctx) {
	ctx.Cookie(&fiber.Cookie{Name: "token", Value: "", Path: "/", Expires: time.Unix(0, 0)})
	ctx.Cookie(&fiber.Cookie{Name: "refresh_token", Value: "", Path: "/", Expires: time.Unix(0, 0)})
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
	setAuthCookies(ctx, resp.Token, resp.RefreshToken)
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
	claims, err := lib.ExtractToken(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	if claims["role"] != "admin" && claims["user_id"] != id {
		return lib.ErrorForbidden(ctx)
	}
	user, err := c.user.FindById(id)
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	user.Password = nil
	return lib.OK(ctx, user)
}

// UpdateProfile lets the authenticated user update their own name/avatar.
func (c *userController) UpdateProfile(ctx *fiber.Ctx) error {
	claims, err := lib.ExtractToken(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	userID, ok := claims["user_id"].(string)
	if !ok {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.UpdateProfileRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data := &model.User{Name: req.Name, Avatar: req.Avatar, PreferredLang: req.PreferredLang}
	user, err := c.user.UpdateById(userID, data)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	user.Password = nil
	return lib.OK(ctx, user)
}

// UpdateById is admin-only: can update any user's fields except password.
func (c *userController) UpdateById(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	data := new(model.User)
	if err := lib.BodyParser(ctx, data); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	data.Role = "" // role changes must go through UpdateRole
	user, err := c.user.UpdateById(id, data)
	if err != nil {
		return lib.ErrorNotFound(ctx, err.Error())
	}
	user.Password = nil
	return lib.OK(ctx, user)
}

// UpdateRole is admin-only: change a user's role.
func (c *userController) UpdateRole(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	req := new(model.UpdateRoleRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	user, err := c.user.UpdateRole(id, req)
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

func (c *userController) Refresh(ctx *fiber.Ctx) error {
	refreshToken := ctx.Cookies("refresh_token")
	if refreshToken == "" {
		var req struct {
			RefreshToken string `json:"refresh_token" validate:"required"`
		}
		if err := lib.BodyParser(ctx, &req); err != nil {
			return lib.ErrorBadRequest(ctx, err)
		}
		refreshToken = req.RefreshToken
	}
	if refreshToken == "" {
		return lib.ErrorUnauthorized(ctx, "refresh token required")
	}
	resp, err := c.user.RefreshAccessToken(refreshToken)
	if err != nil {
		return lib.ErrorUnauthorized(ctx, err.Error())
	}
	setAuthCookies(ctx, resp.Token, "")
	return lib.OK(ctx, resp)
}

func (c *userController) Logout(ctx *fiber.Ctx) error {
	refreshToken := ctx.Cookies("refresh_token")
	if refreshToken == "" {
		var req struct {
			RefreshToken string `json:"refresh_token"`
		}
		_ = lib.BodyParser(ctx, &req)
		refreshToken = req.RefreshToken
	}
	if refreshToken != "" {
		_ = c.user.Logout(refreshToken)
	}
	clearAuthCookies(ctx)
	return lib.OK(ctx)
}

func (c *userController) ForgotPassword(ctx *fiber.Ctx) error {
	req := new(model.ForgotPasswordRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	// Always return 200 to avoid email enumeration
	_ = c.user.ForgotPassword(req.Email)
	return lib.OK(ctx, "If that email is registered, a reset link has been sent.")
}

func (c *userController) ResetPassword(ctx *fiber.Ctx) error {
	req := new(model.ResetPasswordRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if err := c.user.ResetPassword(req.Token, req.NewPassword); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	return lib.OK(ctx, "Password has been reset successfully.")
}

func (c *userController) DeleteById(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if err := c.user.DeleteById(id); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx)
}
