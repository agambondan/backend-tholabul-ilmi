package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
	"gorm.io/gorm"
)

type ChapterRepository interface {
	Save(*model.Chapter) (*model.Chapter, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(*int) (*model.Chapter, error)
	FindByThemeId(*fiber.Ctx, *int) (*paginate.Page, error)
	UpdateById(*int, *model.Chapter) (*model.Chapter, error)
	DeleteById(*int, *string) error
	Count() (*int64, error)
}

type chapterRepo struct {
	db *gorm.DB
	pg *paginate.Pagination
}

func NewChapterRepository(db *gorm.DB, pg *paginate.Pagination) ChapterRepository {
	return &chapterRepo{db, pg}
}

func (c *chapterRepo) Save(Chapter *model.Chapter) (*model.Chapter, error) {
	if err := c.db.Create(&Chapter).Error; err != nil {
		return nil, err
	}
	return Chapter, nil
}

func (c *chapterRepo) FindAll(ctx *fiber.Ctx) *paginate.Page {
	var chapters []model.Chapter
	mod := c.db.Model(&model.Chapter{}).Joins("Translation").Preload("Media").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&chapters)

	return &page
}

func (c *chapterRepo) FindById(id *int) (*model.Chapter, error) {
	var chapter *model.Chapter
	if err := c.db.Joins("Translation").Preload("Media").
		First(&chapter, `chapter.id = ?`, id).Error; err != nil {
		return nil, err
	}
	return chapter, nil
}

func (c *chapterRepo) FindByThemeId(ctx *fiber.Ctx, id *int) (*paginate.Page, error) {
	var chapters []model.Chapter
	mod := c.db.Model(&model.Chapter{}).Joins("Translation").Where("theme_id = ?", id).Preload("Media").Order(`"Translation".idn`)
	page := c.pg.With(mod).Request(ctx.Request()).Response(&chapters)

	return &page, nil
}

func (c *chapterRepo) UpdateById(id *int, Chapter *model.Chapter) (*model.Chapter, error) {
	if _, err := c.FindById(id); err != nil {
		return nil, err
	}
	Chapter.ID = id
	if err := c.db.Updates(&Chapter).Error; err != nil {
		return Chapter, err
	}
	return Chapter, nil
}

func (c *chapterRepo) DeleteById(id *int, scoped *string) error {
	if _, err := c.FindById(id); err != nil {
		return err
	}
	if scoped != nil && *scoped == "hard" {
		c.db.Unscoped().Delete(&model.Chapter{}, id)
	} else {
		c.db.Delete(&model.Chapter{}, id)
	}
	return nil
}

func (c *chapterRepo) Count() (*int64, error) {
	var count int64
	c.db.Table("chapter").Select("id").Count(&count)
	return &count, nil
}
