package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
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
	cache   *lib.CacheService
}

// NewChapterService implements the ChapterService Interface
func NewChapterService(repo repository.ChapterRepository) ChapterService {
	return &chapterService{chapter: repo}
}

func NewChapterServiceWithCache(repo repository.ChapterRepository, cache *lib.CacheService) ChapterService {
	return &chapterService{chapter: repo, cache: cache}
}

func (b *chapterService) Create(chapter *model.Chapter) (*model.Chapter, error) {
	result, err := b.chapter.Save(chapter)
	if err == nil && b.cache != nil {
		b.cache.Invalidate("chapters:*")
	}
	return result, err
}

func (b *chapterService) FindAll(ctx *fiber.Ctx) *paginate.Page {
	if b.cache == nil {
		return b.chapter.FindAll(ctx)
	}
	var result *paginate.Page
	key := lib.RequestCacheKey("chapters:all", ctx)
	err := b.cache.Remember(key, &result, func() (interface{}, error) {
		return b.chapter.FindAll(ctx), nil
	})
	if err != nil {
		return b.chapter.FindAll(ctx)
	}
	return result
}

func (b *chapterService) FindById(id *int) (*model.Chapter, error) {
	if b.cache == nil {
		return b.chapter.FindById(id)
	}
	var result *model.Chapter
	key := lib.CacheKey("chapters:id", *id)
	err := b.cache.Remember(key, &result, func() (interface{}, error) {
		return b.chapter.FindById(id)
	})
	return result, err
}

func (b *chapterService) FindByBookSlugThemeId(ctx *fiber.Ctx, bookSlug *string, themeId *int) (*paginate.Page, error) {
	if b.cache == nil {
		return b.chapter.FindByBookSlugThemeId(ctx, bookSlug, themeId)
	}
	var result *paginate.Page
	key := lib.RequestCacheKey("chapters:book-theme", ctx, *bookSlug, *themeId)
	err := b.cache.Remember(key, &result, func() (interface{}, error) {
		return b.chapter.FindByBookSlugThemeId(ctx, bookSlug, themeId)
	})
	return result, err
}

func (b *chapterService) FindByThemeId(ctx *fiber.Ctx, id *int) (*paginate.Page, error) {
	if b.cache == nil {
		return b.chapter.FindByThemeId(ctx, id)
	}
	var result *paginate.Page
	key := lib.RequestCacheKey("chapters:theme", ctx, *id)
	err := b.cache.Remember(key, &result, func() (interface{}, error) {
		return b.chapter.FindByThemeId(ctx, id)
	})
	return result, err
}

func (b *chapterService) UpdateById(id *int, chapter *model.Chapter) (*model.Chapter, error) {
	result, err := b.chapter.UpdateById(id, chapter)
	if err == nil && b.cache != nil {
		b.cache.Invalidate("chapters:*")
	}
	return result, err
}

func (b *chapterService) DeleteById(id *int, scoped *string) error {
	err := b.chapter.DeleteById(id, scoped)
	if err == nil && b.cache != nil {
		b.cache.Invalidate("chapters:*")
	}
	return err
}

func (b *chapterService) Count() (*int64, error) {
	return b.chapter.Count()
}
