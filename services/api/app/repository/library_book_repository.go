package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
	"gorm.io/gorm"
)

type LibraryBookRepository interface {
	FindAll(ctx *fiber.Ctx, category string, level string, search string) *paginate.Page
	FindBySlug(slug string) (*model.LibraryBook, error)
	FindManyByIDs(ids []int) ([]model.LibraryBook, error)
}

type libraryBookRepo struct {
	db *gorm.DB
	pg *paginate.Pagination
}

func NewLibraryBookRepository(db *gorm.DB, pg *paginate.Pagination) LibraryBookRepository {
	return &libraryBookRepo{db: db, pg: pg}
}

func (r *libraryBookRepo) FindAll(ctx *fiber.Ctx, category string, level string, search string) *paginate.Page {
	var books []model.LibraryBook
	mod := r.db.Model(&model.LibraryBook{}).
		Where("status = ?", model.LibraryBookStatusPublished).
		Order("category asc, title asc")

	if category != "" {
		mod = mod.Where("category ILIKE ?", category)
	}
	if level != "" {
		mod = mod.Where("level ILIKE ?", level)
	}
	if search != "" {
		like := "%" + search + "%"
		mod = mod.Where(
			"(title ILIKE ? OR author ILIKE ? OR description ILIKE ? OR tags ILIKE ?)",
			like,
			like,
			like,
			like,
		)
	}

	page := r.pg.With(mod).Request(ctx.Request()).Response(&books)
	return &page
}

func (r *libraryBookRepo) FindBySlug(slug string) (*model.LibraryBook, error) {
	var book model.LibraryBook
	err := r.db.Where("slug = ? AND status = ?", slug, model.LibraryBookStatusPublished).First(&book).Error
	if err != nil {
		return nil, err
	}
	return &book, nil
}

func (r *libraryBookRepo) FindManyByIDs(ids []int) ([]model.LibraryBook, error) {
	var books []model.LibraryBook
	if len(ids) == 0 {
		return books, nil
	}
	err := r.db.Where("id IN ? AND status = ?", ids, model.LibraryBookStatusPublished).Find(&books).Error
	return books, err
}
