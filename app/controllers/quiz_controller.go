package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type QuizController interface {
	GetSession(ctx *fiber.Ctx) error
	Submit(ctx *fiber.Ctx) error
	GetStats(ctx *fiber.Ctx) error
	Create(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
}

type quizController struct{ svc service.QuizService }

func NewQuizController(services *service.Services) QuizController {
	return &quizController{services.Quiz}
}

func (c *quizController) GetSession(ctx *fiber.Ctx) error {
	quizType := model.QuizType(ctx.Query("type"))
	count, _ := strconv.Atoi(ctx.Query("count", "10"))
	items, err := c.svc.GetSession(quizType, count)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, items)
}

func (c *quizController) Submit(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.SubmitQuizRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if err := c.svc.SubmitAnswers(userID, req.Results); err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, fiber.Map{"message": "submitted"})
}

func (c *quizController) GetStats(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	stats, err := c.svc.GetStats(userID)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, stats)
}

func (c *quizController) Create(ctx *fiber.Ctx) error {
	req := new(model.Quiz)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	item, err := c.svc.CreateQuiz(req)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, item)
}

func (c *quizController) Delete(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return lib.ErrorBadRequest(ctx, "id tidak valid")
	}
	if err := c.svc.DeleteQuiz(id); err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, nil)
}
