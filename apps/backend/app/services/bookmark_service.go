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
	if len(bookmarks) == 0 {
		return bookmarks, nil
	}

	var ayahIDs, hadithIDs []int
	for _, b := range bookmarks {
		switch b.RefType {
		case model.BookmarkAyah:
			ayahIDs = append(ayahIDs, b.RefID)
		case model.BookmarkHadith:
			hadithIDs = append(hadithIDs, b.RefID)
		}
	}

	ayahMap := make(map[int]*model.Ayah)
	if len(ayahIDs) > 0 {
		if ayahs, err := s.ayah.FindManyByIds(ayahIDs); err == nil {
			for i := range ayahs {
				ayahMap[*ayahs[i].ID] = &ayahs[i]
			}
		}
	}

	hadithMap := make(map[int]*model.Hadith)
	if len(hadithIDs) > 0 {
		if hadiths, err := s.hadith.FindManyByIds(hadithIDs); err == nil {
			for i := range hadiths {
				hadithMap[*hadiths[i].ID] = &hadiths[i]
			}
		}
	}

	for i := range bookmarks {
		switch bookmarks[i].RefType {
		case model.BookmarkAyah:
			bookmarks[i].Ayah = ayahMap[bookmarks[i].RefID]
		case model.BookmarkHadith:
			bookmarks[i].Hadith = hadithMap[bookmarks[i].RefID]
		}
	}

	return bookmarks, nil
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
