package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
)

type AyahService interface {
	Create(*model.Ayah) (*model.Ayah, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(*int) (*model.Ayah, error)
	FindByNumber(*fiber.Ctx, *int) (*paginate.Page, error)
	FindBySurahNumber(*fiber.Ctx, *int) (*paginate.Page, error)
	UpdateById(*int, *model.Ayah) (*model.Ayah, error)
	DeleteById(*int, *string) error
	Count() (*int64, error)
}

type ayahService struct {
	ayah repository.AyahRepository
}

// NewAyahService implements the AyahService Interface
func NewAyahService(repo repository.AyahRepository) AyahService {
	return &ayahService{repo}
}

func (c *ayahService) Create(ayah *model.Ayah) (*model.Ayah, error) {
	return c.ayah.Save(ayah)
}

func (c *ayahService) FindAll(ctx *fiber.Ctx) *paginate.Page {
	return c.ayah.FindAll(ctx)
}

func (c *ayahService) FindById(id *int) (*model.Ayah, error) {
	return c.ayah.FindById(id)
}

func (c *ayahService) FindByNumber(ctx *fiber.Ctx, number *int) (*paginate.Page, error) {
	return c.ayah.FindByNumber(ctx, number)
}

func (c *ayahService) FindBySurahNumber(ctx *fiber.Ctx, number *int) (*paginate.Page, error) {
	return c.ayah.FindBySurahNumber(ctx, number)
}

func (c *ayahService) UpdateById(id *int, ayah *model.Ayah) (*model.Ayah, error) {
	return c.ayah.UpdateById(id, ayah)
}

func (c *ayahService) DeleteById(id *int, scoped *string) error {
	return c.ayah.DeleteById(id, scoped)
}

func (c *ayahService) Count() (*int64, error) {
	return c.ayah.Count()
}
