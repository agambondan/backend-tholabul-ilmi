package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
)

type SurahService interface {
	Create(*model.Surah) (*model.Surah, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(*fiber.Ctx, *int) (*model.Surah, error)
	FindByNumber(*fiber.Ctx, *int) (*model.Surah, error)
	FindByName(*fiber.Ctx, *string) (*model.Surah, error)
	UpdateById(*int, *model.Surah) (*model.Surah, error)
	DeleteById(*int, *string) error
	Count() (*int64, error)
}

type surahService struct {
	surah repository.SurahRepository
	cache *lib.CacheService
}

// NewSurahService implements the AyahService Interface
func NewSurahService(repo repository.SurahRepository) SurahService {
	return &surahService{surah: repo}
}

func NewSurahServiceWithCache(repo repository.SurahRepository, cache *lib.CacheService) SurahService {
	return &surahService{surah: repo, cache: cache}
}

func (c *surahService) Create(surah *model.Surah) (*model.Surah, error) {
	result, err := c.surah.Save(surah)
	if err == nil && c.cache != nil {
		c.cache.Invalidate("surah:*")
	}
	return result, err
}

func (c *surahService) FindAll(ctx *fiber.Ctx) *paginate.Page {
	if c.cache == nil {
		return c.surah.FindAll(ctx)
	}
	var result *paginate.Page
	key := "surah:all"
	err := c.cache.Remember(key, &result, func() (interface{}, error) {
		return c.surah.FindAll(ctx), nil
	})
	if err != nil {
		return c.surah.FindAll(ctx)
	}
	return result
}

func (c *surahService) FindById(ctx *fiber.Ctx, id *int) (*model.Surah, error) {
	return c.surah.FindById(ctx, id)
}

func (c *surahService) FindByNumber(ctx *fiber.Ctx, number *int) (*model.Surah, error) {
	return c.surah.FindByNumber(ctx, number)
}

func (c *surahService) FindByName(ctx *fiber.Ctx, name *string) (*model.Surah, error) {
	return c.surah.FindByName(ctx, name)
}

func (c *surahService) UpdateById(id *int, surah *model.Surah) (*model.Surah, error) {
	result, err := c.surah.UpdateById(id, surah)
	if err == nil && c.cache != nil {
		c.cache.Invalidate("surah:*")
	}
	return result, err
}

func (c *surahService) DeleteById(id *int, scoped *string) error {
	err := c.surah.DeleteById(id, scoped)
	if err == nil && c.cache != nil {
		c.cache.Invalidate("surah:*")
	}
	return err
}

func (c *surahService) Count() (*int64, error) {
	return c.surah.Count()
}
