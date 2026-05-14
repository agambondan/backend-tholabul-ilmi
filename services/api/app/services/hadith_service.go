package service

import (
	"fmt"
	"time"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
)

type HadithService interface {
	Create(*model.Hadith) (*model.Hadith, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindAllKeyset(*fiber.Ctx) (*lib.KeysetPage, error)
	FindById(*int) (*model.Hadith, error)
	FindDaily() (*model.Hadith, error)
	FindByBookSlug(*fiber.Ctx, *string) (*paginate.Page, error)
	FindByThemeId(*fiber.Ctx, *int) (*paginate.Page, error)
	FindByThemeName(*fiber.Ctx, *string) (*paginate.Page, error)
	FindByBookSlugThemeId(*fiber.Ctx, *string, *int) (*paginate.Page, error)
	FindByChapterId(*fiber.Ctx, *int) (*paginate.Page, error)
	FindByBookSlugChapterId(*fiber.Ctx, *string, *int) (*paginate.Page, error)
	FindByThemeIdChapterId(*fiber.Ctx, *int, *int) (*paginate.Page, error)
	FindByBookSlugThemeIdChapterId(*fiber.Ctx, *string, *int, *int) (*paginate.Page, error)
	UpdateById(*int, *model.Hadith) (*model.Hadith, error)
	DeleteById(*int, *string) error
	Count() (*int64, error)
}

type hadithService struct {
	hadith repository.HadithRepository
	cache  *lib.CacheService
}

// NewHadithService implements the HadithService Interface
func NewHadithService(repo repository.HadithRepository) HadithService {
	return &hadithService{hadith: repo}
}

func NewHadithServiceWithCache(repo repository.HadithRepository, cache *lib.CacheService) HadithService {
	return &hadithService{hadith: repo, cache: cache}
}

func (b *hadithService) FindById(id *int) (*model.Hadith, error) {
	if b.cache == nil {
		return b.hadith.FindById(id)
	}
	var result *model.Hadith
	key := fmt.Sprintf("hadith:id:%d", *id)
	err := b.cache.Remember(key, &result, func() (interface{}, error) {
		return b.hadith.FindById(id)
	})
	if err != nil {
		return result, err
	}
	return result, nil
}

func (b *hadithService) FindByBookSlug(ctx *fiber.Ctx, bookSlug *string) (*paginate.Page, error) {
	if b.cache == nil {
		return b.hadith.FindByBookSlug(ctx, bookSlug)
	}
	var result *paginate.Page
	key := fmt.Sprintf("hadith:search:%s", *bookSlug)
	err := b.cache.Remember(key, &result, func() (interface{}, error) {
		return b.hadith.FindByBookSlug(ctx, bookSlug)
	})
	if err != nil {
		return result, err
	}
	return result, nil
}

func (b *hadithService) Create(hadith *model.Hadith) (*model.Hadith, error) {
	return b.hadith.Save(hadith)
}

func (b *hadithService) FindAll(ctx *fiber.Ctx) *paginate.Page {
	return b.hadith.FindAll(ctx)
}

func (b *hadithService) FindAllKeyset(ctx *fiber.Ctx) (*lib.KeysetPage, error) {
	return b.hadith.FindAllKeyset(ctx)
}

func (b *hadithService) FindDaily() (*model.Hadith, error) {
	count, err := b.hadith.Count()
	if err != nil || count == nil || *count == 0 {
		return nil, err
	}
	now := time.Now().UTC()
	dayOfYear := int64(now.YearDay()) + int64(now.Year())*1000
	offset := dayOfYear % *count
	return b.hadith.FindByOffset(offset)
}

func (b *hadithService) FindByThemeId(ctx *fiber.Ctx, id *int) (*paginate.Page, error) {
	return b.hadith.FindByThemeId(ctx, id)
}

func (b *hadithService) FindByThemeName(ctx *fiber.Ctx, name *string) (*paginate.Page, error) {
	return b.hadith.FindByThemeName(ctx, name)
}

func (b *hadithService) FindByBookSlugThemeId(ctx *fiber.Ctx, bookSlug *string, themeId *int) (*paginate.Page, error) {
	return b.hadith.FindByBookSlugThemeId(ctx, bookSlug, themeId)
}

func (b *hadithService) FindByChapterId(ctx *fiber.Ctx, id *int) (*paginate.Page, error) {
	return b.hadith.FindByChapterId(ctx, id)
}

func (b *hadithService) FindByBookSlugChapterId(ctx *fiber.Ctx, bookSlug *string, chapterId *int) (*paginate.Page, error) {
	return b.hadith.FindByBookSlugChapterId(ctx, bookSlug, chapterId)
}

func (b *hadithService) FindByThemeIdChapterId(ctx *fiber.Ctx, themeId, chapterId *int) (*paginate.Page, error) {
	return b.hadith.FindByThemeIdChapterId(ctx, themeId, chapterId)
}

func (b *hadithService) FindByBookSlugThemeIdChapterId(ctx *fiber.Ctx, bookSlug *string, themeId, chapterId *int) (*paginate.Page, error) {
	return b.hadith.FindByBookSlugThemeIdChapterId(ctx, bookSlug, themeId, chapterId)
}

func (b *hadithService) UpdateById(id *int, hadith *model.Hadith) (*model.Hadith, error) {
	return b.hadith.UpdateById(id, hadith)
}

func (b *hadithService) DeleteById(id *int, scoped *string) error {
	return b.hadith.DeleteById(id, scoped)
}

func (b *hadithService) Count() (*int64, error) {
	return b.hadith.Count()
}
