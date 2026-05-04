package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
)

type SirohService interface {
	FindAllCategories() ([]model.SirohCategory, error)
	FindCategoryBySlug(string) (*model.SirohCategory, error)
	FindContentBySlug(string) (*model.SirohContent, error)
	FindContentsByCategoryID(int) ([]model.SirohContent, error)
	FindAllContents(*fiber.Ctx) *paginate.Page
	SaveCategory(*model.SirohCategory) (*model.SirohCategory, error)
	SaveContent(*model.SirohContent) (*model.SirohContent, error)
	UpdateCategory(int, *model.SirohCategory) (*model.SirohCategory, error)
	UpdateContent(int, *model.SirohContent) (*model.SirohContent, error)
	DeleteCategory(int) error
	DeleteContent(int) error
}

type sirohService struct {
	repo repository.SirohRepository
}

func NewSirohService(repo repository.SirohRepository) SirohService {
	return &sirohService{repo}
}

func (s *sirohService) FindAllCategories() ([]model.SirohCategory, error) {
	return s.repo.FindAllCategories()
}
func (s *sirohService) FindCategoryBySlug(slug string) (*model.SirohCategory, error) {
	return s.repo.FindCategoryBySlug(slug)
}
func (s *sirohService) FindContentBySlug(slug string) (*model.SirohContent, error) {
	return s.repo.FindContentBySlug(slug)
}
func (s *sirohService) FindContentsByCategoryID(id int) ([]model.SirohContent, error) {
	return s.repo.FindContentsByCategoryID(id)
}
func (s *sirohService) FindAllContents(ctx *fiber.Ctx) *paginate.Page {
	return s.repo.FindAllContents(ctx)
}
func (s *sirohService) SaveCategory(c *model.SirohCategory) (*model.SirohCategory, error) {
	return s.repo.SaveCategory(c)
}
func (s *sirohService) SaveContent(c *model.SirohContent) (*model.SirohContent, error) {
	return s.repo.SaveContent(c)
}
func (s *sirohService) UpdateCategory(id int, c *model.SirohCategory) (*model.SirohCategory, error) {
	return s.repo.UpdateCategory(id, c)
}
func (s *sirohService) UpdateContent(id int, c *model.SirohContent) (*model.SirohContent, error) {
	return s.repo.UpdateContent(id, c)
}
func (s *sirohService) DeleteCategory(id int) error { return s.repo.DeleteCategory(id) }
func (s *sirohService) DeleteContent(id int) error  { return s.repo.DeleteContent(id) }
