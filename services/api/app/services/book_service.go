package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
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
	book  repository.BookRepository
	cache *lib.CacheService
}

// NewBookService implements the BookService Interface
func NewBookService(repo repository.BookRepository) BookService {
	return &bookService{book: repo}
}

func NewBookServiceWithCache(repo repository.BookRepository, cache *lib.CacheService) BookService {
	return &bookService{book: repo, cache: cache}
}

func (b *bookService) Create(book *model.Book) (*model.Book, error) {
	return b.book.Save(book)
}

func (b *bookService) FindAll(ctx *fiber.Ctx) *paginate.Page {
	if b.cache == nil {
		return b.book.FindAll(ctx)
	}
	var result *paginate.Page
	key := "books:all"
	err := b.cache.Remember(key, &result, func() (interface{}, error) {
		return b.book.FindAll(ctx), nil
	})
	if err != nil {
		return b.book.FindAll(ctx)
	}
	return result
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
