package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
	"gorm.io/gorm"
)

type UserRepository interface {
	Save(*model.User) (*model.User, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(string) (*model.User, error)
	FindByEmail(string) (*model.User, error)
	UpdateById(string, *model.User) (*model.User, error)
	DeleteById(string) error
	Count() (*int64, error)
}

type userRepo struct {
	db *gorm.DB
	pg *paginate.Pagination
}

func NewUserRepository(db *gorm.DB, pg *paginate.Pagination) UserRepository {
	return &userRepo{db, pg}
}

func (r *userRepo) Save(user *model.User) (*model.User, error) {
	if err := r.db.Create(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepo) FindAll(ctx *fiber.Ctx) *paginate.Page {
	var users []model.User
	mod := r.db.Model(&model.User{}).Order("created_at desc")
	page := r.pg.With(mod).Request(ctx.Request()).Response(&users)
	return &page
}

func (r *userRepo) FindById(id string) (*model.User, error) {
	var user model.User
	if err := r.db.First(&user, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) FindByEmail(email string) (*model.User, error) {
	var user model.User
	if err := r.db.First(&user, "email = ?", email).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) UpdateById(id string, user *model.User) (*model.User, error) {
	if err := r.db.Model(&model.User{}).Where("id = ?", id).Updates(user).Error; err != nil {
		return nil, err
	}
	return r.FindById(id)
}

func (r *userRepo) DeleteById(id string) error {
	return r.db.Delete(&model.User{}, "id = ?", id).Error
}

func (r *userRepo) Count() (*int64, error) {
	var count int64
	r.db.Model(&model.User{}).Count(&count)
	return &count, nil
}
