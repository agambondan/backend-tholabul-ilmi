package service

import (
	"errors"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BookmarkService interface {
	Add(userID uuid.UUID, refType model.BookmarkType, refID int) (*model.Bookmark, error)
	FindByUserID(userID uuid.UUID) ([]model.Bookmark, error)
	Delete(id, userID uuid.UUID) error
}

type bookmarkService struct {
	repo   repository.BookmarkRepository
	ayah   repository.AyahRepository
	hadith repository.HadithRepository
}

func NewBookmarkService(repo repository.BookmarkRepository, ayah repository.AyahRepository, hadith repository.HadithRepository) BookmarkService {
	return &bookmarkService{repo, ayah, hadith}
}

func (s *bookmarkService) Add(userID uuid.UUID, refType model.BookmarkType, refID int) (*model.Bookmark, error) {
	b := &model.Bookmark{
		BaseUUID: model.BaseUUID{ID: uuid.New()},
		UserID:   userID,
		RefType:  refType,
		RefID:    refID,
	}
	result, err := s.repo.Save(b)
	if err != nil {
		return nil, errors.New("bookmark already exists")
	}
	return result, nil
}

func (s *bookmarkService) FindByUserID(userID uuid.UUID) ([]model.Bookmark, error) {
	bookmarks, err := s.repo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	for i := range bookmarks {
		s.attachContent(&bookmarks[i])
	}
	return bookmarks, nil
}

func (s *bookmarkService) attachContent(b *model.Bookmark) {
	id := b.RefID
	switch b.RefType {
	case model.BookmarkAyah:
		if ayah, err := s.ayah.FindById(&id); err == nil {
			b.Ayah = ayah
		}
	case model.BookmarkHadith:
		if hadith, err := s.hadith.FindById(&id); err == nil {
			b.Hadith = hadith
		}
	}
}

func (s *bookmarkService) Delete(id, userID uuid.UUID) error {
	b, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("bookmark not found")
		}
		return err
	}
	if b.UserID != userID {
		return errors.New("forbidden")
	}
	return s.repo.DeleteByID(id, userID)
}
