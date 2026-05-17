package service

import (
	"errors"
	"strings"

	"github.com/agambondan/islamic-explorer/app/lib"
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
	repo  repository.ForumRepository
	cache *lib.CacheService
}

func NewForumService(repo repository.ForumRepository) ForumService {
	return &forumService{repo: repo}
}

func NewForumServiceWithCache(repo repository.ForumRepository, cache *lib.CacheService) ForumService {
	return &forumService{repo: repo, cache: cache}
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
	if s.cache != nil {
		s.cache.Invalidate("forum:*")
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
	if s.cache == nil {
		return s.repo.FindQuestions(page, limit, search, tag)
	}
	type cachedForumQuestions struct {
		Items []model.ForumQuestion `json:"items"`
		Total int64                 `json:"total"`
	}
	var result cachedForumQuestions
	key := lib.CacheKey("forum:questions", "page", page, "limit", limit, "search", search, "tag", tag)
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		items, total, err := s.repo.FindQuestions(page, limit, search, tag)
		return cachedForumQuestions{Items: items, Total: total}, err
	})
	return result.Items, result.Total, err
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
	err := s.repo.DeleteQuestion(id, userID)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("forum:*")
	}
	return err
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
	if s.cache != nil {
		s.cache.Invalidate("forum:*")
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
	err = s.repo.AcceptAnswer(answerID, questionID, userID)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("forum:*")
	}
	return err
}

func (s *forumService) DeleteAnswer(id, userID uuid.UUID) error {
	err := s.repo.DeleteAnswer(id, userID)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("forum:*")
	}
	return err
}

func (s *forumService) Vote(userID uuid.UUID, req *model.VoteRequest) error {
	existing, err := s.repo.FindVote(userID, req.TargetID, req.TargetType)
	if err == nil && existing != nil {
		if existing.Value == req.Value {
			err := s.repo.DeleteVote(existing.ID)
			if err == nil && s.cache != nil {
				s.cache.Invalidate("forum:*")
			}
			return err
		}
		existing.Value = req.Value
		err := s.repo.CreateVote(existing)
		if err == nil && s.cache != nil {
			s.cache.Invalidate("forum:*")
		}
		return err
	}
	v := &model.ForumVote{
		BaseUUID:   model.BaseUUID{ID: uuid.New()},
		UserID:     userID,
		TargetType: req.TargetType,
		TargetID:   req.TargetID,
		Value:      req.Value,
	}
	err = s.repo.CreateVote(v)
	if err == nil && s.cache != nil {
		s.cache.Invalidate("forum:*")
	}
	return err
}
