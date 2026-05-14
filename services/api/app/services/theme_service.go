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
	return b.theme.Save(theme)
}

func (b *themeService) FindAll(ctx *fiber.Ctx) *paginate.Page {
	if b.cache == nil {
		return b.theme.FindAll(ctx)
	}
	var result *paginate.Page
	key := "themes:all"
	err := b.cache.Remember(key, &result, func() (interface{}, error) {
		return b.theme.FindAll(ctx), nil
	})
	if err != nil {
		return b.theme.FindAll(ctx)
	}
	return result
}

func (b *themeService) FindById(id *int) (*model.Theme, error) {
	return b.theme.FindById(id)
}

func (b *themeService) FindByBookSlug(ctx *fiber.Ctx, slug *string) (*[]model.BookThemes, error) {
	return b.theme.FindByBookSlug(ctx, slug)
}

func (b *themeService) UpdateById(id *int, theme *model.Theme) (*model.Theme, error) {
	return b.theme.UpdateById(id, theme)
}

func (b *themeService) DeleteById(id *int, scoped *string) error {
	return b.theme.DeleteById(id, scoped)
}

func (b *themeService) Count() (*int64, error) {
	return b.theme.Count()
}
