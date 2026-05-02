package service

import (
	"errors"
	"time"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/morkid/paginate"
	"github.com/spf13/viper"
)

type UserService interface {
	Register(*model.RegisterRequest) (*model.User, error)
	Login(*model.LoginRequest) (*model.LoginResponse, error)
	FindAll(*fiber.Ctx) *paginate.Page
	FindById(string) (*model.User, error)
	UpdateById(string, *model.User) (*model.User, error)
	UpdatePassword(string, *model.UpdatePasswordRequest) error
	DeleteById(string) error
	Count() (*int64, error)
}

type userService struct {
	user repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo}
}

func (s *userService) Register(req *model.RegisterRequest) (*model.User, error) {
	if _, err := s.user.FindByEmail(req.Email); err == nil {
		return nil, errors.New("email already registered")
	}

	salt := viper.GetString("SALT")
	key := viper.GetString("AES")
	hashed := lib.PasswordEncrypt(req.Password, salt, key)

	id := uuid.New()
	user := &model.User{
		BaseUUID: model.BaseUUID{ID: id},
		Name:     lib.Strptr(req.Name),
		Email:    lib.Strptr(req.Email),
		Password: lib.Strptr(hashed),
		Role:     model.RoleUser,
	}
	return s.user.Save(user)
}

func (s *userService) Login(req *model.LoginRequest) (*model.LoginResponse, error) {
	user, err := s.user.FindByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	salt := viper.GetString("SALT")
	key := viper.GetString("AES")
	if !lib.PasswordCompare(*user.Password, req.Password, salt, key) {
		return nil, errors.New("invalid email or password")
	}

	token, err := createToken(user.ID.String(), *user.Email, string(user.Role))
	if err != nil {
		return nil, err
	}

	user.Password = nil
	return &model.LoginResponse{Token: token, User: user}, nil
}

func (s *userService) FindAll(ctx *fiber.Ctx) *paginate.Page {
	return s.user.FindAll(ctx)
}

func (s *userService) FindById(id string) (*model.User, error) {
	return s.user.FindById(id)
}

func (s *userService) UpdateById(id string, user *model.User) (*model.User, error) {
	user.Password = nil
	return s.user.UpdateById(id, user)
}

func (s *userService) UpdatePassword(id string, req *model.UpdatePasswordRequest) error {
	user, err := s.user.FindById(id)
	if err != nil {
		return errors.New("user not found")
	}

	salt := viper.GetString("SALT")
	key := viper.GetString("AES")
	if !lib.PasswordCompare(*user.Password, req.OldPassword, salt, key) {
		return errors.New("old password is incorrect")
	}

	hashed := lib.PasswordEncrypt(req.NewPassword, salt, key)
	_, err = s.user.UpdateById(id, &model.User{Password: lib.Strptr(hashed)})
	return err
}

func (s *userService) DeleteById(id string) error {
	return s.user.DeleteById(id)
}

func (s *userService) Count() (*int64, error) {
	return s.user.Count()
}

func createToken(userID, email, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"role":    role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := viper.GetString("ACCESS_SECRET")
	if secret == "" {
		secret = "tholabul-ilmi-secret"
	}
	return token.SignedString([]byte(secret))
}
