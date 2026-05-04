package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
)

type ChapterService interface {
	Create(*model.Chapter) (*model.Chapter, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(*int) (*model.Chapter, error)
	FindByBookSlugThemeId(*fiber.Ctx, *string, *int) (*paginate.Page, error)
	FindByThemeId(*fiber.Ctx, *int) (*paginate.Page, error)
	UpdateById(*int, *model.Chapter) (*model.Chapter, error)
	DeleteById(*int, *string) error
	Count() (*int64, error)
}

type chapterService struct {
	chapter repository.ChapterRepository
}

// NewChapterService implements the ChapterService Interface
func NewChapterService(repo repository.ChapterRepository) ChapterService {
	return &chapterService{repo}
}

func (b *chapterService) Create(chapter *model.Chapter) (*model.Chapter, error) {
	return b.chapter.Save(chapter)
}

func (b *chapterService) FindAll(ctx *fiber.Ctx) *paginate.Page {
	return b.chapter.FindAll(ctx)
}

func (b *chapterService) FindById(id *int) (*model.Chapter, error) {
	return b.chapter.FindById(id)
}

func (b *chapterService) FindByBookSlugThemeId(ctx *fiber.Ctx, bookSlug *string, themeId *int) (*paginate.Page, error) {
	return b.chapter.FindByBookSlugThemeId(ctx, bookSlug, themeId)
}

func (b *chapterService) FindByThemeId(ctx *fiber.Ctx, id *int) (*paginate.Page, error) {
	return b.chapter.FindByThemeId(ctx, id)
}

func (b *chapterService) UpdateById(id *int, chapter *model.Chapter) (*model.Chapter, error) {
	return b.chapter.UpdateById(id, chapter)
}

func (b *chapterService) DeleteById(id *int, scoped *string) error {
	return b.chapter.DeleteById(id, scoped)
}

func (b *chapterService) Count() (*int64, error) {
	return b.chapter.Count()
}
