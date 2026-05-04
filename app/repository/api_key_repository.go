package repository

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type APIKeyRepository interface {
	FindByUserID(userID uuid.UUID) ([]model.APIKey, error)
	FindByKey(key string) (*model.APIKey, error)
	Create(userID uuid.UUID, name string) (*model.APIKey, error)
	Revoke(id int, userID uuid.UUID) error
	IncrementUsage(key string) error
}

type apiKeyRepository struct{ db *gorm.DB }

func NewAPIKeyRepository(db *gorm.DB) APIKeyRepository {
	return &apiKeyRepository{db}
}

func (r *apiKeyRepository) FindByUserID(userID uuid.UUID) ([]model.APIKey, error) {
	var keys []model.APIKey
	return keys, r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&keys).Error
}

func (r *apiKeyRepository) FindByKey(key string) (*model.APIKey, error) {
	var k model.APIKey
	return &k, r.db.Where("key = ? AND is_active = true", key).First(&k).Error
}

func (r *apiKeyRepository) Create(userID uuid.UUID, name string) (*model.APIKey, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return nil, err
	}
	key := &model.APIKey{
		UserID:   userID,
		Name:     name,
		Key:      hex.EncodeToString(raw),
		IsActive: true,
	}
	return key, r.db.Create(key).Error
}

func (r *apiKeyRepository) Revoke(id int, userID uuid.UUID) error {
	return r.db.Model(&model.APIKey{}).Where("id = ? AND user_id = ?", id, userID).Update("is_active", false).Error
}

func (r *apiKeyRepository) IncrementUsage(key string) error {
	now := time.Now()
	return r.db.Model(&model.APIKey{}).Where("key = ?", key).Updates(map[string]interface{}{
		"request_count": gorm.Expr("request_count + 1"),
		"last_used_at":  now,
	}).Error
}
