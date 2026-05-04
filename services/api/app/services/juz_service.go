package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
)

type JuzService interface {
	Create(*model.Juz) (*model.Juz, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(*int) (*model.Juz, error)
	FindBySurahName(*fiber.Ctx, *string) (*model.Juz, error)
	UpdateById(*int, *model.Juz) (*model.Juz, error)
	DeleteById(*int, *string) error
	Count() (*int64, error)
}

type juzService struct {
	juz repository.JuzRepository
}

// NewJuzService implements the JuzService Interface
func NewJuzService(repo repository.JuzRepository) JuzService {
	return &juzService{repo}
}

func (c *juzService) Create(juz *model.Juz) (*model.Juz, error) {
	return c.juz.Save(juz)
}

func (c *juzService) FindAll(ctx *fiber.Ctx) *paginate.Page {
	return c.juz.FindAll(ctx)
}

func (c *juzService) FindById(id *int) (*model.Juz, error) {
	return c.juz.FindById(id)
}

func (c *juzService) FindBySurahName(ctx *fiber.Ctx, name *string) (*model.Juz, error) {
	return c.juz.FindBySurahName(ctx, name)
}

func (c *juzService) UpdateById(id *int, juz *model.Juz) (*model.Juz, error) {
	return c.juz.UpdateById(id, juz)
}

func (c *juzService) DeleteById(id *int, scoped *string) error {
	return c.juz.DeleteById(id, scoped)
}

func (c *juzService) Count() (*int64, error) {
	return c.juz.Count()
}
