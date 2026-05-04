package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
)

type KajianService interface {
	FindAll(ctx *fiber.Ctx, topic, kajianType string) *paginate.Page
	FindByID(id int) (*model.Kajian, error)
	Create(req *model.CreateKajianRequest) (*model.Kajian, error)
	Update(id int, req *model.CreateKajianRequest) (*model.Kajian, error)
	Delete(id int) error
	IncrementView(id int)
}

type kajianService struct {
	repo repository.KajianRepository
}

func NewKajianService(repo repository.KajianRepository) KajianService {
	return &kajianService{repo}
}

func (s *kajianService) FindAll(ctx *fiber.Ctx, topic, kajianType string) *paginate.Page {
	return s.repo.FindAll(ctx, topic, kajianType)
}

func (s *kajianService) FindByID(id int) (*model.Kajian, error) {
	return s.repo.FindByID(id)
}

func (s *kajianService) Create(req *model.CreateKajianRequest) (*model.Kajian, error) {
	k := &model.Kajian{
		Title:        req.Title,
		Description:  req.Description,
		Speaker:      req.Speaker,
		Topic:        req.Topic,
		Type:         req.Type,
		URL:          req.URL,
		Duration:     req.Duration,
		ThumbnailURL: req.ThumbnailURL,
		PublishedAt:  req.PublishedAt,
	}
	return s.repo.Create(k)
}

func (s *kajianService) Update(id int, req *model.CreateKajianRequest) (*model.Kajian, error) {
	k := &model.Kajian{
		Title:        req.Title,
		Description:  req.Description,
		Speaker:      req.Speaker,
		Topic:        req.Topic,
		Type:         req.Type,
		URL:          req.URL,
		Duration:     req.Duration,
		ThumbnailURL: req.ThumbnailURL,
		PublishedAt:  req.PublishedAt,
	}
	return s.repo.Update(id, k)
}

func (s *kajianService) Delete(id int) error {
	return s.repo.Delete(id)
}

func (s *kajianService) IncrementView(id int) {
	_ = s.repo.IncrementView(id)
}
