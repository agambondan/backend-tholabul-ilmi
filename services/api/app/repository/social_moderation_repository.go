package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type SocialModerationRepository interface {
	Upsert(action *model.SocialModerationAction) (*model.SocialModerationAction, error)
	HiddenTargetIDs(userID uuid.UUID, targetType model.SocialModerationTargetType) ([]string, error)
}

type socialModerationRepository struct{ db *gorm.DB }

func NewSocialModerationRepository(db *gorm.DB) SocialModerationRepository {
	return &socialModerationRepository{db}
}

func (r *socialModerationRepository) Upsert(action *model.SocialModerationAction) (*model.SocialModerationAction, error) {
	if err := r.db.Clauses(clause.OnConflict{
		Columns: []clause.Column{
			{Name: "user_id"},
			{Name: "target_type"},
			{Name: "target_id"},
			{Name: "action"},
		},
		DoUpdates: clause.AssignmentColumns([]string{"reason"}),
	}).Create(action).Error; err != nil {
		return nil, err
	}

	var saved model.SocialModerationAction
	err := r.db.Where(
		"user_id = ? AND target_type = ? AND target_id = ? AND action = ?",
		action.UserID,
		action.TargetType,
		action.TargetID,
		action.Action,
	).First(&saved).Error
	return &saved, err
}

func (r *socialModerationRepository) HiddenTargetIDs(userID uuid.UUID, targetType model.SocialModerationTargetType) ([]string, error) {
	var ids []string
	err := r.db.Model(&model.SocialModerationAction{}).
		Where("user_id = ? AND target_type = ? AND action = ?", userID, targetType, model.SocialModerationActionHide).
		Pluck("target_id", &ids).Error
	return ids, err
}
