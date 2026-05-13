package service

import (
	"log/slog"
	"time"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
)

type QuizService interface {
	ListQuizzes(page, size int) ([]model.Quiz, error)
	GetSession(quizType model.QuizType, count int) ([]model.Quiz, error)
	SubmitAnswers(userID uuid.UUID, answers []model.QuizAnswer) error
	GetStats(userID uuid.UUID) (*model.QuizStats, error)
	CreateQuiz(q *model.Quiz) (*model.Quiz, error)
	UpdateQuiz(id int, q *model.Quiz) (*model.Quiz, error)
	DeleteQuiz(id int) error
}

type quizService struct{ repo repository.QuizRepository }

func NewQuizService(repo repository.QuizRepository) QuizService {
	return &quizService{repo}
}

func (s *quizService) ListQuizzes(page, size int) ([]model.Quiz, error) {
	return s.repo.FindAll(page, size)
}

func (s *quizService) GetSession(quizType model.QuizType, count int) ([]model.Quiz, error) {
	return s.repo.FindSession(quizType, count)
}

func (s *quizService) SubmitAnswers(userID uuid.UUID, answers []model.QuizAnswer) error {
	for _, a := range answers {
		quiz, err := s.repo.FindByID(a.QuizID)
		if err != nil {
			continue
		}
		res := &model.UserQuizResult{
			UserID:     userID,
			QuizID:     a.QuizID,
			IsCorrect:  a.Answer == quiz.CorrectAnswer,
			AnsweredAt: time.Now(),
		}
		if err := s.repo.SaveResult(res); err != nil {
			slog.Warn("quiz result save failed", "user_id", userID, "quiz_id", a.QuizID, "err", err)
		}
	}
	return nil
}

func (s *quizService) GetStats(userID uuid.UUID) (*model.QuizStats, error) {
	return s.repo.GetStats(userID)
}

func (s *quizService) CreateQuiz(q *model.Quiz) (*model.Quiz, error) {
	return s.repo.Create(q)
}

func (s *quizService) UpdateQuiz(id int, q *model.Quiz) (*model.Quiz, error) {
	return s.repo.Update(id, q)
}

func (s *quizService) DeleteQuiz(id int) error {
	return s.repo.Delete(id)
}
