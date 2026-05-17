package service

import (
	"errors"
	"time"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
)

var ErrInvalidLibraryBookProgressStatus = errors.New("invalid library book progress status")

type LibraryBookProgressService interface {
	FindAll(userID uuid.UUID) ([]model.LibraryBookProgress, error)
	FindByBook(userID uuid.UUID, bookID int) (*model.LibraryBookProgress, error)
	Update(userID uuid.UUID, bookID int, req *model.UpdateLibraryBookProgressRequest) (*model.LibraryBookProgress, error)
}

type libraryBookProgressService struct {
	repo repository.LibraryBookProgressRepository
}

func NewLibraryBookProgressService(repo repository.LibraryBookProgressRepository) LibraryBookProgressService {
	return &libraryBookProgressService{repo: repo}
}

func (s *libraryBookProgressService) FindAll(userID uuid.UUID) ([]model.LibraryBookProgress, error) {
	return s.repo.FindByUserID(userID)
}

func (s *libraryBookProgressService) FindByBook(userID uuid.UUID, bookID int) (*model.LibraryBookProgress, error) {
	return s.repo.FindByUserIDAndBookID(userID, bookID)
}

func (s *libraryBookProgressService) Update(userID uuid.UUID, bookID int, req *model.UpdateLibraryBookProgressRequest) (*model.LibraryBookProgress, error) {
	status := req.Status
	if status == "" {
		status = model.LibraryBookProgressReading
	}
	if !isValidLibraryBookProgressStatus(status) {
		return nil, ErrInvalidLibraryBookProgressStatus
	}
	currentPage := req.CurrentPage
	if currentPage < 0 {
		currentPage = 0
	}
	now := time.Now()

	return s.repo.Upsert(&model.LibraryBookProgress{
		UserID:        userID,
		LibraryBookID: bookID,
		Status:        status,
		CurrentPage:   currentPage,
		Note:          req.Note,
		LastStudiedAt: &now,
	})
}

func isValidLibraryBookProgressStatus(status model.LibraryBookProgressStatus) bool {
	switch status {
	case model.LibraryBookProgressPlanned,
		model.LibraryBookProgressReading,
		model.LibraryBookProgressPaused,
		model.LibraryBookProgressCompleted:
		return true
	default:
		return false
	}
}
