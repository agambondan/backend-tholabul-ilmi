package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

type AudioRepository interface {
	FindSurahAudioBySurahID(int) ([]model.SurahAudio, error)
	FindAyahAudioByAyahID(int) ([]model.AyahAudio, error)
	SaveSurahAudio(*model.SurahAudio) (*model.SurahAudio, error)
	SaveAyahAudio(*model.AyahAudio) (*model.AyahAudio, error)
	DeleteSurahAudio(int) error
	DeleteAyahAudio(int) error
}

type audioRepo struct {
	db *gorm.DB
}

func NewAudioRepository(db *gorm.DB) AudioRepository {
	return &audioRepo{db}
}

func (r *audioRepo) FindSurahAudioBySurahID(surahID int) ([]model.SurahAudio, error) {
	var list []model.SurahAudio
	err := r.db.Where("surah_id = ?", surahID).Find(&list).Error
	return list, err
}

func (r *audioRepo) FindAyahAudioByAyahID(ayahID int) ([]model.AyahAudio, error) {
	var list []model.AyahAudio
	err := r.db.Where("ayah_id = ?", ayahID).Find(&list).Error
	return list, err
}

func (r *audioRepo) SaveSurahAudio(a *model.SurahAudio) (*model.SurahAudio, error) {
	if err := r.db.Create(a).Error; err != nil {
		return nil, err
	}
	return a, nil
}

func (r *audioRepo) SaveAyahAudio(a *model.AyahAudio) (*model.AyahAudio, error) {
	if err := r.db.Create(a).Error; err != nil {
		return nil, err
	}
	return a, nil
}

func (r *audioRepo) DeleteSurahAudio(id int) error {
	return r.db.Delete(&model.SurahAudio{}, id).Error
}

func (r *audioRepo) DeleteAyahAudio(id int) error {
	return r.db.Delete(&model.AyahAudio{}, id).Error
}
