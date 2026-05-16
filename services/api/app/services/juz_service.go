package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
)

type JuzService interface {
	Create(*model.Juz) (*model.Juz, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(*int) (*model.Juz, error)
	FindBySurahName(*fiber.Ctx, *string) (*model.Juz, error)
	UpdateById(*int, *model.Juz) (*model.Juz, error)
	DeleteById(*int, *string) error
	Count() (*int64, error)
}

type juzService struct {
	juz   repository.JuzRepository
	cache *lib.CacheService
}

// NewJuzService implements the JuzService Interface
func NewJuzService(repo repository.JuzRepository) JuzService {
	return &juzService{juz: repo}
}

func NewJuzServiceWithCache(repo repository.JuzRepository, cache *lib.CacheService) JuzService {
	return &juzService{juz: repo, cache: cache}
}

func (c *juzService) FindAll(ctx *fiber.Ctx) *paginate.Page {
	if c.cache == nil {
		return c.juz.FindAll(ctx)
	}
	var result *paginate.Page
	key := lib.RequestCacheKey("juz:all", ctx)
	err := c.cache.Remember(key, &result, func() (interface{}, error) {
		return c.juz.FindAll(ctx), nil
	})
	if err != nil {
		return c.juz.FindAll(ctx)
	}
	return result
}

func (c *juzService) FindById(id *int) (*model.Juz, error) {
	if c.cache == nil {
		return c.juz.FindById(id)
	}
	var result *model.Juz
	key := lib.CacheKey("juz:id", *id)
	err := c.cache.Remember(key, &result, func() (interface{}, error) {
		return c.juz.FindById(id)
	})
	if err != nil {
		return result, err
	}
	return result, nil
}

func (c *juzService) Create(juz *model.Juz) (*model.Juz, error) {
	result, err := c.juz.Save(juz)
	if err == nil && c.cache != nil {
		c.cache.Invalidate("juz:*")
	}
	return result, err
}

func (c *juzService) FindBySurahName(ctx *fiber.Ctx, name *string) (*model.Juz, error) {
	if c.cache == nil {
		return c.juz.FindBySurahName(ctx, name)
	}
	var result *model.Juz
	key := lib.RequestCacheKey("juz:surah", ctx, *name)
	err := c.cache.Remember(key, &result, func() (interface{}, error) {
		return c.juz.FindBySurahName(ctx, name)
	})
	return result, err
}

func (c *juzService) UpdateById(id *int, juz *model.Juz) (*model.Juz, error) {
	result, err := c.juz.UpdateById(id, juz)
	if err == nil && c.cache != nil {
		c.cache.Invalidate("juz:*")
	}
	return result, err
}

func (c *juzService) DeleteById(id *int, scoped *string) error {
	err := c.juz.DeleteById(id, scoped)
	if err == nil && c.cache != nil {
		c.cache.Invalidate("juz:*")
	}
	return err
}

func (c *juzService) Count() (*int64, error) {
	return c.juz.Count()
}
