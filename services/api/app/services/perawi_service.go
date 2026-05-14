package service

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
)

type PerawiService interface {
	Create(*model.Perawi) (*model.Perawi, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindByID(*int) (*model.Perawi, error)
	FindByTabaqah(*fiber.Ctx, string) *paginate.Page
	Search(*fiber.Ctx, string) *paginate.Page
	FindGuru(*int) ([]model.Perawi, error)
	FindMurid(*int) ([]model.Perawi, error)
	UpdateByID(*int, *model.Perawi) (*model.Perawi, error)
	DeleteByID(*int) error
	Count() (*int64, error)
}

type perawiService struct {
	repo  repository.PerawiRepository
	cache *lib.CacheService
}

func NewPerawiService(repo repository.PerawiRepository) PerawiService {
	return &perawiService{repo: repo}
}

func NewPerawiServiceWithCache(repo repository.PerawiRepository, cache *lib.CacheService) PerawiService {
	return &perawiService{repo: repo, cache: cache}
}

func (s *perawiService) Create(p *model.Perawi) (*model.Perawi, error) {
	return s.repo.Save(p)
}

func (s *perawiService) FindAll(ctx *fiber.Ctx) *paginate.Page {
	if s.cache == nil {
		return s.repo.FindAll(ctx)
	}
	var result *paginate.Page
	key := "perawi:all"
	err := s.cache.Remember(key, &result, func() (interface{}, error) {
		return s.repo.FindAll(ctx), nil
	})
	if err != nil {
		return s.repo.FindAll(ctx)
	}
	return result
}

func (s *perawiService) FindByID(id *int) (*model.Perawi, error) {
	return s.repo.FindByID(id)
}

func (s *perawiService) FindByTabaqah(ctx *fiber.Ctx, tabaqah string) *paginate.Page {
	return s.repo.FindByTabaqah(ctx, tabaqah)
}

func (s *perawiService) Search(ctx *fiber.Ctx, q string) *paginate.Page {
	return s.repo.Search(ctx, q)
}

func (s *perawiService) FindGuru(id *int) ([]model.Perawi, error) {
	return s.repo.FindGuru(id)
}

func (s *perawiService) FindMurid(id *int) ([]model.Perawi, error) {
	return s.repo.FindMurid(id)
}

func (s *perawiService) UpdateByID(id *int, p *model.Perawi) (*model.Perawi, error) {
	return s.repo.UpdateByID(id, p)
}

func (s *perawiService) DeleteByID(id *int) error {
	return s.repo.DeleteByID(id)
}

func (s *perawiService) Count() (*int64, error) {
	return s.repo.Count()
}
