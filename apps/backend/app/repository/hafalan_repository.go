package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type HafalanRepository interface {
	Upsert(*model.HafalanProgress) (*model.HafalanProgress, error)
	FindByUserID(uuid.UUID) ([]model.HafalanProgress, error)
	FindByUserIDAndSurahID(uuid.UUID, int) (*model.HafalanProgress, error)
	FindMemorizedSurahIDs(uuid.UUID) ([]int, error)
	Summary(uuid.UUID) (*model.HafalanSummary, error)
}

type hafalanRepo struct {
	db *gorm.DB
}

func NewHafalanRepository(db *gorm.DB) HafalanRepository {
	return &hafalanRepo{db}
}

func (r *hafalanRepo) Upsert(h *model.HafalanProgress) (*model.HafalanProgress, error) {
	err := r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "surah_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"status", "started_at", "completed_at", "updated_at"}),
	}).Create(h).Error
	return h, err
}

func (r *hafalanRepo) FindByUserID(userID uuid.UUID) ([]model.HafalanProgress, error) {
	var list []model.HafalanProgress
	err := r.db.Preload("Surah").Preload("Surah.Translation").
		Where("user_id = ?", userID).
		Order("surah_id asc").
		Find(&list).Error
	return list, err
}

func (r *hafalanRepo) FindMemorizedSurahIDs(userID uuid.UUID) ([]int, error) {
	var ids []int
	err := r.db.Model(&model.HafalanProgress{}).
		Where("user_id = ? AND status = ?", userID, model.HafalanMemorized).
		Pluck("surah_id", &ids).Error
	return ids, err
}

func (r *hafalanRepo) FindByUserIDAndSurahID(userID uuid.UUID, surahID int) (*model.HafalanProgress, error) {
	var h model.HafalanProgress
	err := r.db.Preload("Surah").Where("user_id = ? AND surah_id = ?", userID, surahID).First(&h).Error
	if err != nil {
		return nil, err
	}
	return &h, nil
}

func (r *hafalanRepo) Summary(userID uuid.UUID) (*model.HafalanSummary, error) {
	var summary model.HafalanSummary

	type row struct {
		Status model.HafalanStatus
		Count  int
	}
	var rows []row
	err := r.db.Model(&model.HafalanProgress{}).
		Select("status, count(*) as count").
		Where("user_id = ?", userID).
		Group("status").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	summary.Total = 114
	for _, r := range rows {
		switch r.Status {
		case model.HafalanNotStarted:
			summary.NotStarted = r.Count
		case model.HafalanInProgress:
			summary.InProgress = r.Count
		case model.HafalanMemorized:
			summary.Memorized = r.Count
		}
	}
	return &summary, nil
}
