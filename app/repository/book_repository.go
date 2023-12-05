package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
	"gorm.io/gorm"
)

type BookRepository interface {
	Save(*model.Book) (*model.Book, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(*int) (*model.Book, error)
	FindBySlug(*fiber.Ctx, *string) (*model.Book, error)
	UpdateById(*int, *model.Book) (*model.Book, error)
	DeleteById(*int, *string) error
	Count() (*int64, error)
}

type bookRepo struct {
	db *gorm.DB
	pg *paginate.Pagination
}

func NewBookRepository(db *gorm.DB, pg *paginate.Pagination) BookRepository {
	return &bookRepo{db, pg}
}

func (c *bookRepo) Save(Book *model.Book) (*model.Book, error) {
	if err := c.db.Create(&Book).Error; err != nil {
		return nil, err
	}
	return Book, nil
}

func (c *bookRepo) FindAll(ctx *fiber.Ctx) *paginate.Page {
	var books []model.Book
	mod := c.db.Model(&model.Book{}).Joins("Translation").Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&books)
	for i, v := range books {
		var count int64
		c.db.Table("hadith").Select("id").Where("book_id = ?", v.ID).Count(&count)
		books[i].Count = &count
	}

	return &page
}

func (c *bookRepo) FindById(id *int) (*model.Book, error) {
	var book *model.Book
	if err := c.db.Joins("Translation").Preload("Themes").Preload("Media").
		First(&book, `book.id = ?`, id).Error; err != nil {
		return nil, err
	}
	return book, nil
}

func (c *bookRepo) FindBySlug(ctx *fiber.Ctx, slug *string) (*model.Book, error) {
	var book *model.Book
	if err := c.db.Joins("Translation").Preload("Themes").Preload("Media").
		First(&book, `book.slug = ?`, slug).Error; err != nil {
		return nil, err
	}
	return book, nil
}

func (c *bookRepo) UpdateById(id *int, Book *model.Book) (*model.Book, error) {
	if _, err := c.FindById(id); err != nil {
		return nil, err
	}
	Book.ID = id
	if err := c.db.Updates(&Book).Error; err != nil {
		return Book, err
	}
	return Book, nil
}

func (c *bookRepo) DeleteById(id *int, scoped *string) error {
	if _, err := c.FindById(id); err != nil {
		return err
	}
	if scoped != nil && *scoped == "hard" {
		c.db.Unscoped().Delete(&model.Book{}, id)
	} else {
		c.db.Delete(&model.Book{}, id)
	}
	return nil
}

func (c *bookRepo) Count() (*int64, error) {
	var count int64
	c.db.Table("book").Select("id").Count(&count)
	return &count, nil
}
