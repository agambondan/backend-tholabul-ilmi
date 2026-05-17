package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
)

type LibraryBookService interface {
	FindAll(ctx *fiber.Ctx, category string, level string, search string) *paginate.Page
	FindBySlug(slug string) (*model.LibraryBook, error)
}

type libraryBookService struct {
	repo repository.LibraryBookRepository
}

func NewLibraryBookService(repo repository.LibraryBookRepository) LibraryBookService {
	return &libraryBookService{repo: repo}
}

func (s *libraryBookService) FindAll(ctx *fiber.Ctx, category string, level string, search string) *paginate.Page {
	return s.repo.FindAll(ctx, category, level, search)
}

func (s *libraryBookService) FindBySlug(slug string) (*model.LibraryBook, error) {
	return s.repo.FindBySlug(slug)
}
