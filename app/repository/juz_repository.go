package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
	"gorm.io/gorm"
)

type JuzRepository interface {
	Save(*model.Juz) (*model.Juz, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(*int) (*model.Juz, error)
	FindBySurahName(*fiber.Ctx, *string) (*model.Juz, error)
	UpdateById(*int, *model.Juz) (*model.Juz, error)
	DeleteById(*int, *string) error
	Count() (*int64, error)
}

type juzRepo struct {
	db *gorm.DB
	pg *paginate.Pagination
}

func NewJuzRepository(db *gorm.DB, pg *paginate.Pagination) JuzRepository {
	return &juzRepo{db, pg}
}

func (c *juzRepo) Save(Juz *model.Juz) (*model.Juz, error) {
	if err := c.db.Create(&Juz).Error; err != nil {
		return nil, err
	}
	return Juz, nil
}

func (c *juzRepo) FindAll(ctx *fiber.Ctx) *paginate.Page {
	var juz []*model.Juz
	mod := c.db.Model(&model.Juz{}).Joins("StartSurah").Joins("StartSurah.Translation").
		Joins("EndSurah").Joins("EndSurah.Translation").
		Joins("StartAyah").Joins("StartAyah.Translation").
		Joins("EndAyah").Joins("EndAyah.Translation").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&juz)

	return &page
}

func (c *juzRepo) FindById(id *int) (*model.Juz, error) {
	var juz *model.Juz
	if err := c.db.Preload("Ayahs", func(db *gorm.DB) *gorm.DB {
		return db.Order("ayah.id ")
	}).Preload("Ayahs.Translation").
		Joins("StartSurah").Joins("StartSurah.Translation").
		Joins("EndSurah").Joins("EndSurah.Translation").
		Joins("StartAyah").Joins("StartAyah.Translation").
		Joins("EndAyah").Joins("EndAyah.Translation").
		First(&juz, `juz.id = ?`, id).Error; err != nil {
		return nil, err
	}

	return juz, nil
}

func (c *juzRepo) FindBySurahName(ctx *fiber.Ctx, name *string) (*model.Juz, error) {
	var juz *model.Juz
	if err := c.db.Preload("Ayahs", func(db *gorm.DB) *gorm.DB {
		return db.Order("ayah.id ")
	}).Preload("Ayahs.Translation").
		Joins("StartSurah").Joins("StartSurah.Translation").
		Joins("EndSurah").Joins("EndSurah.Translation").
		Joins("StartAyah").Joins("StartAyah.Translation").
		Joins("EndAyah").Joins("EndAyah.Translation").
		First(&juz).Error; err != nil {
		return nil, err
	}
	return juz, nil
}

func (c *juzRepo) UpdateById(id *int, Juz *model.Juz) (*model.Juz, error) {
	if _, err := c.FindById(id); err != nil {
		return nil, err
	}
	Juz.ID = id
	if err := c.db.Updates(&Juz).Error; err != nil {
		return Juz, err
	}
	return Juz, nil
}

func (c *juzRepo) DeleteById(id *int, scoped *string) error {
	if _, err := c.FindById(id); err != nil {
		return err
	}
	if scoped != nil && *scoped == "hard" {
		c.db.Unscoped().Delete(&model.Juz{}, id)
	} else {
		c.db.Delete(&model.Juz{}, id)
	}
	return nil
}

func (c *juzRepo) Count() (*int64, error) {
	var count int64
	c.db.Table("Juz").Select("id").Count(&count)
	return &count, nil
}
