package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
	"gorm.io/gorm"
)

type HadithRepository interface {
	FindByOffset(int64) (*model.Hadith, error)
	Save(*model.Hadith) (*model.Hadith, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(*int) (*model.Hadith, error)
	FindManyByIds(ids []int) ([]model.Hadith, error)
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

func (c *hadithRepo) withRelations(db *gorm.DB) *gorm.DB {
	return db.
		Joins("Book").Joins("Book.Translation").
		Joins("Theme").Joins("Theme.Translation").
		Joins("Chapter").Joins("Chapter.Translation").
		Joins("Translation")
}

func (c *hadithRepo) FindAll(ctx *fiber.Ctx) *paginate.Page {
	var hadiths []model.Hadith
	mod := c.withRelations(c.db.Model(&model.Hadith{})).Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page
}

func (c *hadithRepo) FindById(id *int) (*model.Hadith, error) {
	var hadith *model.Hadith
	if err := c.withRelations(c.db).Preload("Media").
		First(&hadith, `hadith.id = ?`, id).Error; err != nil {
		return nil, err
	}
	return hadith, nil
}

func (c *hadithRepo) FindManyByIds(ids []int) ([]model.Hadith, error) {
	var hadiths []model.Hadith
	err := c.withRelations(c.db).Where("hadith.id IN ?", ids).Find(&hadiths).Error
	return hadiths, err
}

func (c *hadithRepo) FindByBookSlug(ctx *fiber.Ctx, bookSlug *string) (*paginate.Page, error) {
	var hadiths []model.Hadith
	mod := c.withRelations(c.db.Model(&model.Hadith{})).
		Where(`"Book".slug = ?`, bookSlug).
		Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page, nil
}

func (c *hadithRepo) FindByThemeId(ctx *fiber.Ctx, id *int) (*paginate.Page, error) {
	var hadiths []model.Hadith
	mod := c.withRelations(c.db.Model(&model.Hadith{})).
		Where("hadith.theme_id = ?", id).Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page, nil
}

func (c *hadithRepo) FindByThemeName(ctx *fiber.Ctx, name *string) (*paginate.Page, error) {
	var hadiths []model.Hadith
	mod := c.withRelations(c.db.Model(&model.Hadith{})).
		Where(`LOWER("Theme__Translation".idn) = ?`, name).
		Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page, nil
}

func (c *hadithRepo) FindByBookSlugThemeId(ctx *fiber.Ctx, bookSlug *string, themeId *int) (*paginate.Page, error) {
	var hadiths []model.Hadith
	mod := c.withRelations(c.db.Model(&model.Hadith{})).
		Where(`"Book".slug = ? AND hadith.theme_id = ?`, bookSlug, themeId).
		Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page, nil
}

func (c *hadithRepo) FindByChapterId(ctx *fiber.Ctx, id *int) (*paginate.Page, error) {
	var hadiths []model.Hadith
	mod := c.withRelations(c.db.Model(&model.Hadith{})).
		Where("hadith.chapter_id = ?", id).Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page, nil
}

func (c *hadithRepo) FindByBookSlugChapterId(ctx *fiber.Ctx, bookSlug *string, chapterId *int) (*paginate.Page, error) {
	var hadiths []model.Hadith
	mod := c.withRelations(c.db.Model(&model.Hadith{})).
		Where(`"Book".slug = ? AND hadith.chapter_id = ?`, bookSlug, chapterId).
		Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page, nil
}

func (c *hadithRepo) FindByThemeIdChapterId(ctx *fiber.Ctx, themeId, chapterId *int) (*paginate.Page, error) {
	var hadiths []model.Hadith
	mod := c.withRelations(c.db.Model(&model.Hadith{})).
		Where("hadith.chapter_id = ? AND hadith.theme_id = ?", chapterId, themeId).
		Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&hadiths)

	return &page, nil
}

func (c *hadithRepo) FindByBookSlugThemeIdChapterId(ctx *fiber.Ctx, bookSlug *string, themeId, chapterId *int) (*paginate.Page, error) {
	var hadiths []model.Hadith
	mod := c.withRelations(c.db.Model(&model.Hadith{})).
		Where(`"Book".slug = ? AND hadith.chapter_id = ? AND hadith.theme_id = ?`, bookSlug, chapterId, themeId).
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
		return c.db.Unscoped().Delete(&model.Hadith{}, id).Error
	}
	return c.db.Delete(&model.Hadith{}, id).Error
}

func (c *hadithRepo) Count() (*int64, error) {
	var count int64
	c.db.Table("hadith").Count(&count)
	return &count, nil
}

func (c *hadithRepo) FindByOffset(offset int64) (*model.Hadith, error) {
	var hadith model.Hadith
	err := c.db.Preload("Translation").Preload("Book").Preload("Theme").Preload("Chapter").
		Order("id asc").Offset(int(offset)).Limit(1).First(&hadith).Error
	if err != nil {
		return nil, err
	}
	return &hadith, nil
}
