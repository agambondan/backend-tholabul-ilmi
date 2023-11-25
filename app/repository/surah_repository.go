package repository

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
	"gorm.io/gorm"
)

type SurahRepository interface {
	Save(*model.Surah) (*model.Surah, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(*fiber.Ctx, *int) (*model.Surah, error)
	FindByNumber(*fiber.Ctx, *int) (*model.Surah, error)
	FindByName(*fiber.Ctx, *string) (*model.Surah, error)
	UpdateById(*int, *model.Surah) (*model.Surah, error)
	DeleteById(*int, *string) error
	Count() (*int64, error)
}

type surahRepo struct {
	db *gorm.DB
	pg *paginate.Pagination
}

func NewSurahRepository(db *gorm.DB, pg *paginate.Pagination) SurahRepository {
	return &surahRepo{db, pg}
}

func (c *surahRepo) Save(Surah *model.Surah) (*model.Surah, error) {
	if err := c.db.Create(&Surah).Error; err != nil {
		return nil, err
	}
	return Surah, nil
}

func (c *surahRepo) FindAll(ctx *fiber.Ctx) *paginate.Page {
	var surah []*model.Surah
	mod := c.db.Model(&model.Surah{}).Joins("Translation")
	page := c.pg.With(mod).Request(ctx.Request()).Response(&surah)
	return &page
}

func (c *surahRepo) FindById(ctx *fiber.Ctx, id *int) (*model.Surah, error) {
	var surah *model.Surah
	if err := c.db.Joins("Translation").
		First(&surah, `surah.id = ?`, id).Error; err != nil {
		return nil, err
	}
	c.db.Joins("Translation").First(&surah.NextSurah, `number = ?`, *surah.Number+1)
	c.db.Joins("Translation").First(&surah.PrevSurah, `number = ?`, *surah.Number-1)
	if ctx != nil {
		limit, offset := lib.GetLimitOffset(ctx)
		c.db.Where(`surah_id = ?`, surah.Number).Offset(offset).Limit(limit).Order("number").Joins("Translation").Find(&surah.Ayahs)
	}
	return surah, nil
}

func (c *surahRepo) FindByNumber(ctx *fiber.Ctx, number *int) (*model.Surah, error) {
	var surah *model.Surah
	if err := c.db.Joins("Translation").
		First(&surah, `surah.number = ?`, number).Error; err != nil {
		return nil, err
	}
	c.db.Joins("Translation").First(&surah.NextSurah, `number = ?`, *surah.Number+1)
	c.db.Joins("Translation").First(&surah.PrevSurah, `number = ?`, *surah.Number-1)
	if ctx != nil {
		limit, offset := lib.GetLimitOffset(ctx)
		c.db.Where(`surah_id = ?`, surah.Number).Offset(offset).Limit(limit).Order("number").Joins("Translation").Find(&surah.Ayahs)
	}
	return surah, nil
}

func (c *surahRepo) FindByName(ctx *fiber.Ctx, name *string) (*model.Surah, error) {
	var surah *model.Surah
	if err := c.db.Joins("Translation").
		First(&surah, `"Translation".latin_idn = ? OR "Translation".latin_en = ? OR 
		"Translation".idn = ? OR "Translation".en = ? OR "Translation".ar = ?`, name, name, name, name, name).Error; err != nil {
		return nil, err
	}
	c.db.Joins("Translation").First(&surah.NextSurah, `number = ?`, *surah.Number+1)
	c.db.Joins("Translation").First(&surah.PrevSurah, `number = ?`, *surah.Number-1)
	if ctx != nil {
		limit, offset := lib.GetLimitOffset(ctx)
		c.db.Where(`surah_id = ?`, surah.Number).Offset(offset).Limit(limit).Order("number").Joins("Translation").Find(&surah.Ayahs)
	}
	return surah, nil
}

func (c *surahRepo) UpdateById(id *int, Surah *model.Surah) (*model.Surah, error) {
	if _, err := c.FindById(nil, id); err != nil {
		return nil, err
	}
	Surah.ID = id
	if err := c.db.Updates(&Surah).Error; err != nil {
		return Surah, err
	}
	return Surah, nil
}

func (c *surahRepo) DeleteById(id *int, scoped *string) error {
	if _, err := c.FindById(nil, id); err != nil {
		return err
	}
	if scoped != nil && *scoped == "hard" {
		c.db.Unscoped().Delete(&model.Surah{}, id)
	} else {
		c.db.Delete(&model.Surah{}, id)
	}
	return nil
}

func (c *surahRepo) Count() (*int64, error) {
	var count int64
	c.db.Table("Surah").Select("id").Count(&count)
	return &count, nil
}
