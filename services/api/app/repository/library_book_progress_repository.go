package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type LibraryBookProgressRepository interface {
	Upsert(progress *model.LibraryBookProgress) (*model.LibraryBookProgress, error)
	FindByUserID(userID uuid.UUID) ([]model.LibraryBookProgress, error)
	FindByUserIDAndBookID(userID uuid.UUID, bookID int) (*model.LibraryBookProgress, error)
}

type libraryBookProgressRepo struct {
	db *gorm.DB
}

func NewLibraryBookProgressRepository(db *gorm.DB) LibraryBookProgressRepository {
	return &libraryBookProgressRepo{db: db}
}

func (r *libraryBookProgressRepo) Upsert(progress *model.LibraryBookProgress) (*model.LibraryBookProgress, error) {
	err := r.db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "user_id"}, {Name: "library_book_id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"status",
			"current_page",
			"note",
			"last_studied_at",
			"updated_at",
		}),
	}).Create(progress).Error
	if err != nil {
		return nil, err
	}
	return r.FindByUserIDAndBookID(progress.UserID, progress.LibraryBookID)
}

func (r *libraryBookProgressRepo) FindByUserID(userID uuid.UUID) ([]model.LibraryBookProgress, error) {
	var progress []model.LibraryBookProgress
	err := r.db.Preload("Book").Where("user_id = ?", userID).Order("updated_at desc").Find(&progress).Error
	return progress, err
}

func (r *libraryBookProgressRepo) FindByUserIDAndBookID(userID uuid.UUID, bookID int) (*model.LibraryBookProgress, error) {
	var progress model.LibraryBookProgress
	err := r.db.Preload("Book").Where("user_id = ? AND library_book_id = ?", userID, bookID).First(&progress).Error
	if err != nil {
		return nil, err
	}
	return &progress, nil
}
