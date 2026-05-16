package controllers

import (
	"strconv"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type ForumController interface {
	CreateQuestion(ctx *fiber.Ctx) error
	ListQuestions(ctx *fiber.Ctx) error
	GetQuestion(ctx *fiber.Ctx) error
	DeleteQuestion(ctx *fiber.Ctx) error
	CreateAnswer(ctx *fiber.Ctx) error
	AcceptAnswer(ctx *fiber.Ctx) error
	DeleteAnswer(ctx *fiber.Ctx) error
	Vote(ctx *fiber.Ctx) error
}

type forumController struct {
	svc service.ForumService
}

func NewForumController(services *service.Services) ForumController {
	return &forumController{services.Forum}
}

func (c *forumController) CreateQuestion(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.CreateQuestionRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	q, err := c.svc.CreateQuestion(userID, req)
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	return lib.OK(ctx, q)
}

func (c *forumController) ListQuestions(ctx *fiber.Ctx) error {
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	limit, _ := strconv.Atoi(ctx.Query("size", "20"))
	search := ctx.Query("q", "")
	tag := ctx.Query("tag", "")
	questions, total, err := c.svc.ListQuestions(page, limit, search, tag)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, fiber.Map{
		"items": questions,
		"total": total,
		"page":  page,
		"size":  limit,
	})
}

func (c *forumController) GetQuestion(ctx *fiber.Ctx) error {
	q, err := c.svc.GetQuestion(ctx.Params("slug"))
	if err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, q)
}

func (c *forumController) DeleteQuestion(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	id, parseErr := uuid.Parse(ctx.Params("id"))
	if parseErr != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.DeleteQuestion(id, userID); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, fiber.Map{"message": "deleted"})
}

func (c *forumController) CreateAnswer(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	questionID, parseErr := uuid.Parse(ctx.Params("id"))
	if parseErr != nil {
		return lib.ErrorBadRequest(ctx, "invalid question id")
	}
	req := new(model.CreateAnswerRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	a, err := c.svc.CreateAnswer(userID, questionID, req)
	if err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	return lib.OK(ctx, a)
}

func (c *forumController) AcceptAnswer(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	questionID, _ := uuid.Parse(ctx.Params("id"))
	answerID, _ := uuid.Parse(ctx.Params("answerId"))
	if questionID == uuid.Nil || answerID == uuid.Nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.AcceptAnswer(answerID, questionID, userID); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	return lib.OK(ctx, fiber.Map{"message": "accepted"})
}

func (c *forumController) DeleteAnswer(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	id, parseErr := uuid.Parse(ctx.Params("id"))
	if parseErr != nil {
		return lib.ErrorBadRequest(ctx, "invalid id")
	}
	if err := c.svc.DeleteAnswer(id, userID); err != nil {
		return lib.ErrorNotFound(ctx)
	}
	return lib.OK(ctx, fiber.Map{"message": "deleted"})
}

func (c *forumController) Vote(ctx *fiber.Ctx) error {
	userID, err := extractUserID(ctx)
	if err != nil {
		return lib.ErrorUnauthorized(ctx)
	}
	req := new(model.VoteRequest)
	if err := lib.BodyParser(ctx, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	if err := c.svc.Vote(userID, req); err != nil {
		return lib.ErrorBadRequest(ctx, err)
	}
	return lib.OK(ctx, fiber.Map{"message": "ok"})
}
