package service

import (
	"errors"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BookmarkService interface {
	Add(userID uuid.UUID, refType model.BookmarkType, refID int, color, label string) (*model.Bookmark, error)
	AddBySlug(userID uuid.UUID, refType model.BookmarkType, slug, color, label string) (*model.Bookmark, error)
	FindByUserID(userID uuid.UUID) ([]model.Bookmark, error)
	UpdateMeta(id, userID uuid.UUID, color, label *string) (*model.Bookmark, error)
	Delete(id, userID uuid.UUID) error
}

type bookmarkService struct {
	repo        repository.BookmarkRepository
	ayah        repository.AyahRepository
	hadith      repository.HadithRepository
	libraryBook repository.LibraryBookRepository
}

func NewBookmarkService(repo repository.BookmarkRepository, ayah repository.AyahRepository, hadith repository.HadithRepository, libraryBook repository.LibraryBookRepository) BookmarkService {
	return &bookmarkService{repo, ayah, hadith, libraryBook}
}

func (s *bookmarkService) AddBySlug(userID uuid.UUID, refType model.BookmarkType, slug, color, label string) (*model.Bookmark, error) {
	if existing, err := s.repo.FindByUserAndSlug(userID, refType, slug); err == nil && existing != nil {
		return nil, errors.New("bookmark already exists")
	}
	b := &model.Bookmark{
		BaseUUID: model.BaseUUID{ID: uuid.New()},
		UserID:   userID,
		RefType:  refType,
		RefSlug:  slug,
		Color:    color,
		Label:    label,
	}
	result, err := s.repo.Save(b)
	if err != nil {
		return nil, errors.New("bookmark already exists")
	}
	return result, nil
}

func (s *bookmarkService) Add(userID uuid.UUID, refType model.BookmarkType, refID int, color, label string) (*model.Bookmark, error) {
	b := &model.Bookmark{
		BaseUUID: model.BaseUUID{ID: uuid.New()},
		UserID:   userID,
		RefType:  refType,
		RefID:    refID,
		Color:    color,
		Label:    label,
	}
	result, err := s.repo.Save(b)
	if err != nil {
		return nil, errors.New("bookmark already exists")
	}
	return result, nil
}

func (s *bookmarkService) UpdateMeta(id, userID uuid.UUID, color, label *string) (*model.Bookmark, error) {
	b, err := s.repo.UpdateMeta(id, userID, color, label)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("bookmark not found")
		}
		return nil, err
	}
	return b, nil
}

func (s *bookmarkService) FindByUserID(userID uuid.UUID) ([]model.Bookmark, error) {
	bookmarks, err := s.repo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	if len(bookmarks) == 0 {
		return bookmarks, nil
	}

	var ayahIDs, hadithIDs, libraryBookIDs []int
	for _, b := range bookmarks {
		switch b.RefType {
		case model.BookmarkAyah:
			ayahIDs = append(ayahIDs, b.RefID)
		case model.BookmarkHadith:
			hadithIDs = append(hadithIDs, b.RefID)
		case model.BookmarkLibraryBook:
			libraryBookIDs = append(libraryBookIDs, b.RefID)
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

	libraryBookMap := make(map[int]*model.LibraryBook)
	if len(libraryBookIDs) > 0 && s.libraryBook != nil {
		if books, err := s.libraryBook.FindManyByIDs(libraryBookIDs); err == nil {
			for i := range books {
				libraryBookMap[*books[i].ID] = &books[i]
			}
		}
	}

	for i := range bookmarks {
		switch bookmarks[i].RefType {
		case model.BookmarkAyah:
			bookmarks[i].Ayah = ayahMap[bookmarks[i].RefID]
		case model.BookmarkHadith:
			bookmarks[i].Hadith = hadithMap[bookmarks[i].RefID]
		case model.BookmarkLibraryBook:
			bookmarks[i].LibraryBook = libraryBookMap[bookmarks[i].RefID]
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
