package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
	"gorm.io/gorm"
)

type ThemeRepository interface {
	Save(*model.Theme) (*model.Theme, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(*int) (*model.Theme, error)
	FindByBookSlug(*fiber.Ctx, *string) (*[]model.BookThemes, error)
	UpdateById(*int, *model.Theme) (*model.Theme, error)
	DeleteById(*int, *string) error
	Count() (*int64, error)
}

type themeRepo struct {
	db *gorm.DB
	pg *paginate.Pagination
}

func NewThemeRepository(db *gorm.DB, pg *paginate.Pagination) ThemeRepository {
	return &themeRepo{db, pg}
}

func (c *themeRepo) Save(Theme *model.Theme) (*model.Theme, error) {
	if err := c.db.Create(&Theme).Error; err != nil {
		return nil, err
	}
	return Theme, nil
}

func (c *themeRepo) FindAll(ctx *fiber.Ctx) *paginate.Page {
	var themes []model.Theme
	mod := c.db.Model(&model.Theme{}).Joins("Translation").Preload("Media").Preload("Chapters").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&themes)

	return &page
}

func (c *themeRepo) FindById(id *int) (*model.Theme, error) {
	var theme *model.Theme
	if err := c.db.Joins("Translation").Preload("Chapters").Preload("Media").
		First(&theme, `theme.id = ?`, id).Error; err != nil {
		return nil, err
	}
	return theme, nil
}

func (c *themeRepo) FindByBookSlug(ctx *fiber.Ctx, slug *string) (*[]model.BookThemes, error) {
	var theme *[]model.BookThemes
	if err := c.db.Joins("Theme").Joins("Theme.Translation").
		// Preload("Theme.Chapters").Preload("Theme.Chapters.Translation").
		// Preload("Theme.Hadiths").Preload("Theme.Hadiths.Translation").
		Joins("Book").Find(&theme, `"Book".slug = ?`, slug).Error; err != nil {
		return nil, err
	}
	return theme, nil
}

func (c *themeRepo) UpdateById(id *int, Theme *model.Theme) (*model.Theme, error) {
	if _, err := c.FindById(id); err != nil {
		return nil, err
	}
	Theme.ID = id
	if err := c.db.Updates(&Theme).Error; err != nil {
		return Theme, err
	}
	return Theme, nil
}

func (c *themeRepo) DeleteById(id *int, scoped *string) error {
	if _, err := c.FindById(id); err != nil {
		return err
	}
	if scoped != nil && *scoped == "hard" {
		c.db.Unscoped().Delete(&model.Theme{}, id)
	} else {
		c.db.Delete(&model.Theme{}, id)
	}
	return nil
}

func (c *themeRepo) Count() (*int64, error) {
	var count int64
	c.db.Table("theme").Select("id").Count(&count)
	return &count, nil
}
