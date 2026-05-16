package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
)

type ThemeService interface {
	Create(*model.Theme) (*model.Theme, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(*int) (*model.Theme, error)
	FindByBookSlug(*fiber.Ctx, *string) (*[]model.BookThemes, error)
	UpdateById(*int, *model.Theme) (*model.Theme, error)
	DeleteById(*int, *string) error
	Count() (*int64, error)
}

type themeService struct {
	theme repository.ThemeRepository
	cache *lib.CacheService
}

// NewThemeService implements the ThemeService Interface
func NewThemeService(repo repository.ThemeRepository) ThemeService {
	return &themeService{theme: repo}
}

func NewThemeServiceWithCache(repo repository.ThemeRepository, cache *lib.CacheService) ThemeService {
	return &themeService{theme: repo, cache: cache}
}

func (b *themeService) Create(theme *model.Theme) (*model.Theme, error) {
	result, err := b.theme.Save(theme)
	if err == nil && b.cache != nil {
		b.cache.Invalidate("themes:*")
	}
	return result, err
}

func (b *themeService) FindAll(ctx *fiber.Ctx) *paginate.Page {
	if b.cache == nil {
		return b.theme.FindAll(ctx)
	}
	var result *paginate.Page
	key := lib.RequestCacheKey("themes:all", ctx)
	err := b.cache.Remember(key, &result, func() (interface{}, error) {
		return b.theme.FindAll(ctx), nil
	})
	if err != nil {
		return b.theme.FindAll(ctx)
	}
	return result
}

func (b *themeService) FindById(id *int) (*model.Theme, error) {
	if b.cache == nil {
		return b.theme.FindById(id)
	}
	var result *model.Theme
	key := lib.CacheKey("themes:id", *id)
	err := b.cache.Remember(key, &result, func() (interface{}, error) {
		return b.theme.FindById(id)
	})
	return result, err
}

func (b *themeService) FindByBookSlug(ctx *fiber.Ctx, slug *string) (*[]model.BookThemes, error) {
	if b.cache == nil {
		return b.theme.FindByBookSlug(ctx, slug)
	}
	var result *[]model.BookThemes
	key := lib.RequestCacheKey("themes:book", ctx, *slug)
	err := b.cache.Remember(key, &result, func() (interface{}, error) {
		return b.theme.FindByBookSlug(ctx, slug)
	})
	return result, err
}

func (b *themeService) UpdateById(id *int, theme *model.Theme) (*model.Theme, error) {
	result, err := b.theme.UpdateById(id, theme)
	if err == nil && b.cache != nil {
		b.cache.Invalidate("themes:*")
	}
	return result, err
}

func (b *themeService) DeleteById(id *int, scoped *string) error {
	err := b.theme.DeleteById(id, scoped)
	if err == nil && b.cache != nil {
		b.cache.Invalidate("themes:*")
	}
	return err
}

func (b *themeService) Count() (*int64, error) {
	return b.theme.Count()
}
