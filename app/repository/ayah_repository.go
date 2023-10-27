package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
	"gorm.io/gorm"
)

type AyahRepository interface {
	Save(*model.Ayah) (*model.Ayah, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(*int) (*model.Ayah, error)
	FindByNumber(*fiber.Ctx, *int) (*paginate.Page, error)
	FindBySurahNumber(*fiber.Ctx, *int) (*paginate.Page, error)
	UpdateById(*int, *model.Ayah) (*model.Ayah, error)
	DeleteById(*int, *string) error
	Count() (*int64, error)
}

type ayahRepo struct {
	db *gorm.DB
	pg *paginate.Pagination
}

func NewAyahRepository(db *gorm.DB, pg *paginate.Pagination) AyahRepository {
	return &ayahRepo{db, pg}
}

func (c *ayahRepo) Save(Ayah *model.Ayah) (*model.Ayah, error) {
	if err := c.db.Create(&Ayah).Error; err != nil {
		return nil, err
	}
	return Ayah, nil
}

func (c *ayahRepo) FindAll(ctx *fiber.Ctx) *paginate.Page {
	var ayahs []model.Ayah
	mod := c.db.Model(&model.Ayah{}).Joins("Translation").Joins("Surah").Joins("Surah.Translation").Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&ayahs)

	return &page
}

func (c *ayahRepo) FindById(id *int) (*model.Ayah, error) {
	var Ayah *model.Ayah
	if err := c.db.Joins("Translation").Joins("Surah").Joins("Surah.Translation").
		First(&Ayah, `ayah.id = ?`, id).Error; err != nil {
		return nil, err
	}
	return Ayah, nil
}

func (c *ayahRepo) FindByNumber(ctx *fiber.Ctx, number *int) (*paginate.Page, error) {
	var ayahs []*model.Ayah
	mod := c.db.Model(&model.Ayah{}).Joins("Translation").Joins("Surah").Joins("Surah.Translation").Where(`"ayah".number = ?`, number).Order("id")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&ayahs)

	return &page, nil
}

func (c *ayahRepo) FindBySurahNumber(ctx *fiber.Ctx, number *int) (*paginate.Page, error) {
	var ayahs []*model.Ayah
	mod := c.db.Model(&model.Ayah{}).Joins("Translation").Joins("Surah").Joins("Surah.Translation").Where(`"Surah".number = ?`, number).Order(`id, "Surah".id`)
	page := c.pg.With(mod).Request(ctx.Request()).Response(&ayahs)

	return &page, nil
}

func (c *ayahRepo) UpdateById(id *int, Ayah *model.Ayah) (*model.Ayah, error) {
	if _, err := c.FindById(id); err != nil {
		return nil, err
	}
	Ayah.ID = id
	if err := c.db.Updates(&Ayah).Error; err != nil {
		return Ayah, err
	}
	return Ayah, nil
}

func (c *ayahRepo) DeleteById(id *int, scoped *string) error {
	if _, err := c.FindById(id); err != nil {
		return err
	}
	if scoped != nil && *scoped == "hard" {
		c.db.Unscoped().Delete(&model.Ayah{}, id)
	} else {
		c.db.Delete(&model.Ayah{}, id)
	}
	return nil
}

func (c *ayahRepo) Count() (*int64, error) {
	var count int64
	c.db.Table("Ayah").Select("id").Count(&count)
	return &count, nil
}
