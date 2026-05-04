package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
)

type CommentService interface {
	FindByRef(refType model.CommentRefType, refID int) ([]model.Comment, error)
	Create(userID uuid.UUID, req *model.CreateCommentRequest) (*model.Comment, error)
	Delete(id int, userID uuid.UUID) error
}

type commentService struct{ repo repository.CommentRepository }

func NewCommentService(repo repository.CommentRepository) CommentService {
	return &commentService{repo}
}

func (s *commentService) FindByRef(refType model.CommentRefType, refID int) ([]model.Comment, error) {
	return s.repo.FindByRef(refType, refID)
}

func (s *commentService) Create(userID uuid.UUID, req *model.CreateCommentRequest) (*model.Comment, error) {
	return s.repo.Create(&model.Comment{
		UserID:   userID,
		RefType:  req.RefType,
		RefID:    req.RefID,
		Content:  req.Content,
		ParentID: req.ParentID,
	})
}

func (s *commentService) Delete(id int, userID uuid.UUID) error {
	return s.repo.Delete(id, userID)
}
