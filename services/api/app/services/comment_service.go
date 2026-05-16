package service

import (
	"errors"
	"strconv"
	"strings"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
)

type CommentService interface {
	FindByRef(refType model.CommentRefType, refID int, viewerID *uuid.UUID) ([]model.Comment, error)
	Create(userID uuid.UUID, req *model.CreateCommentRequest) (*model.Comment, error)
	Delete(id int, userID uuid.UUID, isAdmin bool) error
	Hide(id int, userID uuid.UUID) (*model.SocialModerationAction, error)
	Report(id int, userID uuid.UUID, reason string) (*model.SocialModerationAction, error)
}

type commentService struct {
	repo       repository.CommentRepository
	moderation repository.SocialModerationRepository
}

func NewCommentService(repo repository.CommentRepository, moderation repository.SocialModerationRepository) CommentService {
	return &commentService{repo: repo, moderation: moderation}
}

func (s *commentService) FindByRef(refType model.CommentRefType, refID int, viewerID *uuid.UUID) ([]model.Comment, error) {
	hiddenIDs := []string{}
	if viewerID != nil && s.moderation != nil {
		ids, err := s.moderation.HiddenTargetIDs(*viewerID, model.SocialModerationTargetComment)
		if err == nil {
			hiddenIDs = ids
		}
	}
	return s.repo.FindByRef(refType, refID, hiddenIDs)
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

func (s *commentService) Delete(id int, userID uuid.UUID, isAdmin bool) error {
	existing, err := s.repo.FindByID(id)
	if err != nil {
		return errors.New("comment not found")
	}
	if !isAdmin && existing.UserID != userID {
		return errors.New("forbidden")
	}
	if isAdmin {
		return s.repo.Delete(id, nil)
	}
	return s.repo.Delete(id, &userID)
}

func (s *commentService) Hide(id int, userID uuid.UUID) (*model.SocialModerationAction, error) {
	return s.moderate(id, userID, model.SocialModerationActionHide, "")
}

func (s *commentService) Report(id int, userID uuid.UUID, reason string) (*model.SocialModerationAction, error) {
	return s.moderate(id, userID, model.SocialModerationActionReport, reason)
}

func (s *commentService) moderate(id int, userID uuid.UUID, action model.SocialModerationActionType, reason string) (*model.SocialModerationAction, error) {
	if s.moderation == nil {
		return nil, errors.New("moderation repository unavailable")
	}
	if _, err := s.repo.FindByID(id); err != nil {
		return nil, errors.New("comment not found")
	}
	return s.moderation.Upsert(&model.SocialModerationAction{
		UserID:     userID,
		TargetType: model.SocialModerationTargetComment,
		TargetID:   strconv.Itoa(id),
		Action:     action,
		Reason:     strings.TrimSpace(reason),
	})
}
