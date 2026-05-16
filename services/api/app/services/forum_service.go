package service

import (
	"errors"
	"strings"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
)

type ForumService interface {
	CreateQuestion(userID uuid.UUID, req *model.CreateQuestionRequest) (*model.ForumQuestion, error)
	ListQuestions(page, limit int, search, tag string) ([]model.ForumQuestion, int64, error)
	GetQuestion(slug string) (*model.ForumQuestion, error)
	DeleteQuestion(id, userID uuid.UUID) error

	CreateAnswer(userID uuid.UUID, questionID uuid.UUID, req *model.CreateAnswerRequest) (*model.ForumAnswer, error)
	AcceptAnswer(answerID, questionID, userID uuid.UUID) error
	DeleteAnswer(id, userID uuid.UUID) error

	Vote(userID uuid.UUID, req *model.VoteRequest) error
}

type forumService struct {
	repo repository.ForumRepository
}

func NewForumService(repo repository.ForumRepository) ForumService {
	return &forumService{repo}
}

func (s *forumService) CreateQuestion(userID uuid.UUID, req *model.CreateQuestionRequest) (*model.ForumQuestion, error) {
	slug := strings.ToLower(strings.ReplaceAll(req.Title, " ", "-"))
	slug = strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			return r
		}
		return -1
	}, slug)
	slug = slug[:min(len(slug), 200)]

	q := &model.ForumQuestion{
		BaseUUID: model.BaseUUID{ID: uuid.New()},
		UserID:   userID,
		Title:    req.Title,
		Body:     req.Body,
		Slug:     slug,
		Tags:     req.Tags,
	}
	if err := s.repo.CreateQuestion(q); err != nil {
		return nil, errors.New("failed to create question")
	}
	return s.repo.FindQuestionByID(q.ID)
}

func (s *forumService) ListQuestions(page, limit int, search, tag string) ([]model.ForumQuestion, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 20
	}
	return s.repo.FindQuestions(page, limit, search, tag)
}

func (s *forumService) GetQuestion(slug string) (*model.ForumQuestion, error) {
	q, err := s.repo.FindQuestionBySlug(slug)
	if err != nil {
		return nil, err
	}
	s.repo.IncrementView(q.ID)
	answers, _ := s.repo.FindAnswersByQuestion(q.ID)
	q.Answers = answers
	return q, nil
}

func (s *forumService) DeleteQuestion(id, userID uuid.UUID) error {
	return s.repo.DeleteQuestion(id, userID)
}

func (s *forumService) CreateAnswer(userID uuid.UUID, questionID uuid.UUID, req *model.CreateAnswerRequest) (*model.ForumAnswer, error) {
	a := &model.ForumAnswer{
		BaseUUID:   model.BaseUUID{ID: uuid.New()},
		QuestionID: questionID,
		UserID:     userID,
		Body:       req.Body,
	}
	if err := s.repo.CreateAnswer(a); err != nil {
		return nil, errors.New("failed to create answer")
	}
	return a, nil
}

func (s *forumService) AcceptAnswer(answerID, questionID, userID uuid.UUID) error {
	q, err := s.repo.FindQuestionByID(questionID)
	if err != nil {
		return err
	}
	if q.UserID != userID {
		return errors.New("only question author can accept answer")
	}
	return s.repo.AcceptAnswer(answerID, questionID, userID)
}

func (s *forumService) DeleteAnswer(id, userID uuid.UUID) error {
	return s.repo.DeleteAnswer(id, userID)
}

func (s *forumService) Vote(userID uuid.UUID, req *model.VoteRequest) error {
	existing, err := s.repo.FindVote(userID, req.TargetID, req.TargetType)
	if err == nil && existing != nil {
		if existing.Value == req.Value {
			return s.repo.DeleteVote(existing.ID)
		}
		existing.Value = req.Value
		return s.repo.CreateVote(existing)
	}
	v := &model.ForumVote{
		BaseUUID:   model.BaseUUID{ID: uuid.New()},
		UserID:     userID,
		TargetType: req.TargetType,
		TargetID:   req.TargetID,
		Value:      req.Value,
	}
	return s.repo.CreateVote(v)
}
