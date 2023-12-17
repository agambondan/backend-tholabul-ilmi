package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
	"gorm.io/gorm"
)

type HadithRepository interface {
	Save(*model.Hadith) (*model.Hadith, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(*int) (*model.Hadith, error)
	FindByBookSlug(*fiber.Ctx, *string) (*paginate.Page, error)
	FindByThemeId(*fiber.Ctx, *int) (*paginate.Page, error)
	FindByBookSlugThemeId(*fiber.Ctx, *string, *int) (*paginate.Page, error)
	FindByChapterId(*fiber.Ctx, *int) (*paginate.Page, error)
	FindByBookSlugChapterId(*fiber.Ctx, *string, *int) (*paginate.Page, error)
	FindByThemeIdChapterId(*fiber.Ctx, *int, *int) (*paginate.Page, error)
	FindByBookSlugThemeIdChapterId(*fiber.Ctx, *string, *int, *int) (*paginate.Page, error)
	UpdateById(*int, *model.Hadith) (*model.Hadith, error)
	DeleteById(*int, *string) error
	Count() (*int64, error)
}

type hadithRepo struct {
	db *gorm.DB
	pg *paginate.Pagination
}

func NewHadithRepository(db *gorm.DB, pg *paginate.Pagination) HadithRepository {
	return &hadithRepo{db, pg}
}

func (c *hadithRepo) Save(Hadith *model.Hadith) (*model.Hadith, error) {
	if err := c.db.Create(&Hadith).Error; err != nil {
		return nil, err
	}
	return Hadith, nil
}

func (c *hadithRepo) FindAll(ctx *fiber.Ctx) *paginate.Page {
	var hadiths []model.Hadith
	mod := c.db.Model(&model.Hadith{}).Joins("Translation").Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page
}

func (c *hadithRepo) FindById(id *int) (*model.Hadith, error) {
	var hadith *model.Hadith
	if err := c.db.Joins("Translation").Preload("Media").
		First(&hadith, `hadith.id = ?`, id).Error; err != nil {
		return nil, err
	}
	return hadith, nil
}

func (c *hadithRepo) FindByBookSlug(ctx *fiber.Ctx, bookSlug *string) (*paginate.Page, error) {
	var hadiths []model.Hadith
	mod := c.db.Model(&model.Hadith{}).Joins("Translation").Joins("JOIN book on book.id = hadith.book_id AND book.slug = ?", bookSlug).
		Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page, nil
}

func (c *hadithRepo) FindByThemeId(ctx *fiber.Ctx, id *int) (*paginate.Page, error) {
	var hadiths []model.Hadith
	mod := c.db.Model(&model.Hadith{}).Joins("Translation").Where("theme_id = ?", id).Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page, nil
}

func (c *hadithRepo) FindByBookSlugThemeId(ctx *fiber.Ctx, bookSlug *string, themeId *int) (*paginate.Page, error) {
	var hadiths []model.Hadith
	mod := c.db.Model(&model.Hadith{}).Joins("Translation").Joins("JOIN book on book.id = hadith.book_id AND book.slug = ?", bookSlug).
		Where("theme_id = ?", themeId).Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page, nil
}

func (c *hadithRepo) FindByChapterId(ctx *fiber.Ctx, id *int) (*paginate.Page, error) {
	var hadiths []model.Hadith
	mod := c.db.Model(&model.Hadith{}).Joins("Translation").Where("chapter_id = ?", id).Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page, nil
}

func (c *hadithRepo) FindByBookSlugChapterId(ctx *fiber.Ctx, bookSlug *string, chapterId *int) (*paginate.Page, error) {
	var hadiths []model.Hadith
	mod := c.db.Model(&model.Hadith{}).Joins("Translation").Joins("JOIN book on book.id = hadith.book_id AND book.slug = ?", bookSlug).
		Where("chapter_id = ?", chapterId).Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page, nil
}

func (c *hadithRepo) FindByThemeIdChapterId(ctx *fiber.Ctx, themeId, chapterId *int) (*paginate.Page, error) {
	var hadiths []model.Hadith
	mod := c.db.Model(&model.Hadith{}).Joins("Book").Joins("Translation").Where("chapter_id = ? AND theme_id = ?", chapterId, themeId).
		Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page, nil
}

func (c *hadithRepo) FindByBookSlugThemeIdChapterId(ctx *fiber.Ctx, bookSlug *string, themeId, chapterId *int) (*paginate.Page, error) {
	var hadiths []model.Hadith
	mod := c.db.Model(&model.Hadith{}).Joins("Book").Joins("Translation").Where(`"Book".slug = ? AND chapter_id = ? AND theme_id = ?`, bookSlug, chapterId, themeId).
		Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page, nil
}

func (c *hadithRepo) UpdateById(id *int, Hadith *model.Hadith) (*model.Hadith, error) {
	if _, err := c.FindById(id); err != nil {
		return nil, err
	}
	Hadith.ID = id
	if err := c.db.Updates(&Hadith).Error; err != nil {
		return Hadith, err
	}
	return Hadith, nil
}

func (c *hadithRepo) DeleteById(id *int, scoped *string) error {
	if _, err := c.FindById(id); err != nil {
		return err
	}
	if scoped != nil && *scoped == "hard" {
		c.db.Unscoped().Delete(&model.Hadith{}, id)
	} else {
		c.db.Delete(&model.Hadith{}, id)
	}
	return nil
}

func (c *hadithRepo) Count() (*int64, error) {
	var count int64
	c.db.Table("hadith").Select("id").Count(&count)
	return &count, nil
}
