package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
	"gorm.io/gorm"
)

type KajianRepository interface {
	FindAll(ctx *fiber.Ctx, topic, kajianType string) *paginate.Page
	FindByID(id int) (*model.Kajian, error)
	Create(k *model.Kajian) (*model.Kajian, error)
	Update(id int, k *model.Kajian) (*model.Kajian, error)
	Delete(id int) error
	IncrementView(id int) error
}

type kajianRepository struct {
	db *gorm.DB
	pg *paginate.Pagination
}

func NewKajianRepository(db *gorm.DB, pg *paginate.Pagination) KajianRepository {
	return &kajianRepository{db, pg}
}

func (r *kajianRepository) FindAll(ctx *fiber.Ctx, topic, kajianType string) *paginate.Page {
	var list []model.Kajian
	q := r.db.Model(&model.Kajian{}).Joins("Translation").Order("published_at DESC, id DESC")
	if topic != "" {
		q = q.Where("topic ILIKE ?", "%"+topic+"%")
	}
	if kajianType != "" {
		q = q.Where("type = ?", kajianType)
	}
	page := r.pg.With(q).Request(ctx.Request()).Response(&list)
	return &page
}

func (r *kajianRepository) FindByID(id int) (*model.Kajian, error) {
	var k model.Kajian
	err := r.db.Joins("Translation").First(&k, id).Error
	return &k, err
}

func (r *kajianRepository) Create(k *model.Kajian) (*model.Kajian, error) {
	err := r.db.Create(k).Error
	return k, err
}

func (r *kajianRepository) Update(id int, k *model.Kajian) (*model.Kajian, error) {
	var existing model.Kajian
	if err := r.db.First(&existing, id).Error; err != nil {
		return nil, err
	}
	err := r.db.Model(&existing).Updates(k).Error
	return &existing, err
}

func (r *kajianRepository) Delete(id int) error {
	return r.db.Delete(&model.Kajian{}, id).Error
}

func (r *kajianRepository) IncrementView(id int) error {
	return r.db.Model(&model.Kajian{}).Where("id = ?", id).UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error
}
