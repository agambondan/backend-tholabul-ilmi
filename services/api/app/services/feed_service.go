package service

import (
	"errors"
	"strings"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/morkid/paginate"
)

type FeedService interface {
	FindAll(*fiber.Ctx, model.FeedRefType, *uuid.UUID) *paginate.Page
	FindByID(string) (*model.FeedPost, error)
	CreatePost(userID uuid.UUID, req *model.CreateFeedPostRequest) (*model.FeedPost, error)
	LikePost(id string) (*model.FeedPost, error)
	DeletePost(id string, userID uuid.UUID, isAdmin bool) error
	HidePost(id string, userID uuid.UUID) (*model.SocialModerationAction, error)
	ReportPost(id string, userID uuid.UUID, reason string) (*model.SocialModerationAction, error)
}

type feedService struct {
	repo       repository.FeedRepository
	moderation repository.SocialModerationRepository
	ayah       AyahService
	hadith     HadithService
}

func NewFeedService(repo repository.FeedRepository, moderation repository.SocialModerationRepository, ayah AyahService, hadith HadithService) FeedService {
	return &feedService{repo: repo, moderation: moderation, ayah: ayah, hadith: hadith}
}

func (s *feedService) FindAll(ctx *fiber.Ctx, refType model.FeedRefType, viewerID *uuid.UUID) *paginate.Page {
	hiddenIDs := []string{}
	if viewerID != nil && s.moderation != nil {
		ids, err := s.moderation.HiddenTargetIDs(*viewerID, model.SocialModerationTargetFeedPost)
		if err == nil {
			hiddenIDs = ids
		}
	}
	return s.repo.FindAll(ctx, refType, hiddenIDs)
}

func (s *feedService) FindByID(id string) (*model.FeedPost, error) {
	return s.repo.FindByID(id)
}

func (s *feedService) CreatePost(userID uuid.UUID, req *model.CreateFeedPostRequest) (*model.FeedPost, error) {
	if req == nil {
		return nil, errors.New("invalid request")
	}

	switch req.RefType {
	case model.FeedRefTypeAyah:
		if _, err := s.ayah.FindById(&req.RefID); err != nil {
			return nil, errors.New("reference not found")
		}
	case model.FeedRefTypeHadith:
		if _, err := s.hadith.FindById(&req.RefID); err != nil {
			return nil, errors.New("reference not found")
		}
	default:
		return nil, errors.New("invalid ref_type")
	}

	post := &model.FeedPost{
		BaseUUID: model.BaseUUID{ID: uuid.New()},
		UserID:   userID,
		RefType:  req.RefType,
		RefID:    req.RefID,
		Caption:  strings.TrimSpace(req.Caption),
	}

	return s.repo.Create(post)
}

func (s *feedService) LikePost(id string) (*model.FeedPost, error) {
	if err := s.repo.IncrementLikes(id); err != nil {
		return nil, err
	}
	return s.repo.FindByID(id)
}

func (s *feedService) DeletePost(id string, userID uuid.UUID, isAdmin bool) error {
	existing, err := s.repo.FindByID(id)
	if err != nil {
		return errors.New("post not found")
	}
	if !isAdmin && existing.UserID != userID {
		return errors.New("forbidden")
	}
	if isAdmin {
		return s.repo.Delete(id, nil)
	}
	return s.repo.Delete(id, &userID)
}

func (s *feedService) HidePost(id string, userID uuid.UUID) (*model.SocialModerationAction, error) {
	return s.moderatePost(id, userID, model.SocialModerationActionHide, "")
}

func (s *feedService) ReportPost(id string, userID uuid.UUID, reason string) (*model.SocialModerationAction, error) {
	return s.moderatePost(id, userID, model.SocialModerationActionReport, reason)
}

func (s *feedService) moderatePost(id string, userID uuid.UUID, action model.SocialModerationActionType, reason string) (*model.SocialModerationAction, error) {
	if s.moderation == nil {
		return nil, errors.New("moderation repository unavailable")
	}
	if _, err := s.repo.FindByID(id); err != nil {
		return nil, errors.New("post not found")
	}
	if _, err := uuid.Parse(id); err != nil {
		return nil, errors.New("invalid post id")
	}
	return s.moderation.Upsert(&model.SocialModerationAction{
		UserID:     userID,
		TargetType: model.SocialModerationTargetFeedPost,
		TargetID:   id,
		Action:     action,
		Reason:     strings.TrimSpace(reason),
	})
}
