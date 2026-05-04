package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type ReadingProgressRepository interface {
	Upsert(*model.ReadingProgress) (*model.ReadingProgress, error)
	FindByUserIDAndType(uuid.UUID, model.ProgressType) (*model.ReadingProgress, error)
	FindAllByUserID(uuid.UUID) ([]model.ReadingProgress, error)
}

type readingProgressRepo struct {
	db *gorm.DB
}

func NewReadingProgressRepository(db *gorm.DB) ReadingProgressRepository {
	return &readingProgressRepo{db}
}

func (r *readingProgressRepo) Upsert(p *model.ReadingProgress) (*model.ReadingProgress, error) {
	err := r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "content_type"}},
		DoUpdates: clause.AssignmentColumns([]string{"surah_number", "ayah_number", "ayah_id", "book_slug", "hadith_id", "last_read_at", "updated_at"}),
	}).Create(p).Error
	return p, err
}

func (r *readingProgressRepo) FindByUserIDAndType(userID uuid.UUID, contentType model.ProgressType) (*model.ReadingProgress, error) {
	var p model.ReadingProgress
	err := r.db.Where("user_id = ? AND content_type = ?", userID, contentType).First(&p).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *readingProgressRepo) FindAllByUserID(userID uuid.UUID) ([]model.ReadingProgress, error) {
	var progress []model.ReadingProgress
	err := r.db.Where("user_id = ?", userID).Find(&progress).Error
	return progress, err
}
