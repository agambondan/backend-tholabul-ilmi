package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
)

type BookService interface {
	Create(*model.Book) (*model.Book, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(*int) (*model.Book, error)
	FindBySlug(*fiber.Ctx, *string) (*model.Book, error)
	UpdateById(*int, *model.Book) (*model.Book, error)
	DeleteById(*int, *string) error
	Count() (*int64, error)
}

type bookService struct {
	book repository.BookRepository
}

// NewBookService implements the BookService Interface
func NewBookService(repo repository.BookRepository) BookService {
	return &bookService{repo}
}

func (b *bookService) Create(book *model.Book) (*model.Book, error) {
	return b.book.Save(book)
}

func (b *bookService) FindAll(ctx *fiber.Ctx) *paginate.Page {
	return b.book.FindAll(ctx)
}

func (b *bookService) FindById(id *int) (*model.Book, error) {
	return b.book.FindById(id)
}

func (b *bookService) FindBySlug(ctx *fiber.Ctx, slug *string) (*model.Book, error) {
	return b.book.FindBySlug(ctx, slug)
}

func (b *bookService) UpdateById(id *int, book *model.Book) (*model.Book, error) {
	return b.book.UpdateById(id, book)
}

func (b *bookService) DeleteById(id *int, scoped *string) error {
	return b.book.DeleteById(id, scoped)
}

func (b *bookService) Count() (*int64, error) {
	return b.book.Count()
}
