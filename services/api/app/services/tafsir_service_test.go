package service

import (
	"errors"
	"testing"

	"github.com/agambondan/islamic-explorer/app/model"
)

func intPtr(i int) *int { return &i }

type fakeTafsirRepo struct {
	tafsir     *model.Tafsir
	tafsirs    []model.Tafsir
	err        error
	surahErr   error
	saveResult *model.Tafsir
	saveErr    error
	updateErr  error
}

func (f *fakeTafsirRepo) FindByAyahID(ayahID int) (*model.Tafsir, error) {
	return f.tafsir, f.err
}

func (f *fakeTafsirRepo) FindBySurahNumber(surahNumber, limit, offset int) ([]model.Tafsir, error) {
	return f.tafsirs, f.surahErr
}

func (f *fakeTafsirRepo) Save(t *model.Tafsir) (*model.Tafsir, error) {
	return f.saveResult, f.saveErr
}

func (f *fakeTafsirRepo) UpdateByAyahID(ayahID int, t *model.Tafsir) (*model.Tafsir, error) {
	return f.tafsir, f.updateErr
}

func TestTafsirServiceFindByAyahID(t *testing.T) {
	repo := &fakeTafsirRepo{
		tafsir: &model.Tafsir{AyahID: intPtr(1)},
	}
	svc := NewTafsirService(repo)

	result, err := svc.FindByAyahID(1)
	if err != nil {
		t.Fatalf("find by ayah id: %v", err)
	}
	if result.AyahID == nil || *result.AyahID != 1 {
		t.Fatalf("expected ayah id 1, got %v", result.AyahID)
	}
}

func TestTafsirServiceFindByAyahIDNotFound(t *testing.T) {
	repo := &fakeTafsirRepo{}
	svc := NewTafsirService(repo)

	result, err := svc.FindByAyahID(999)
	if err != nil {
		t.Fatalf("find by ayah id: %v", err)
	}
	if result != nil {
		t.Fatal("expected nil result for not found")
	}
}

func TestTafsirServiceFindByAyahIDPropagatesError(t *testing.T) {
	repo := &fakeTafsirRepo{err: errors.New("db error")}
	svc := NewTafsirService(repo)

	if _, err := svc.FindByAyahID(1); err == nil {
		t.Fatal("expected error to propagate")
	}
}

func TestTafsirServiceFindBySurahNumber(t *testing.T) {
	repo := &fakeTafsirRepo{
		tafsirs: []model.Tafsir{
			{AyahID: intPtr(1)},
			{AyahID: intPtr(2)},
		},
	}
	svc := NewTafsirService(repo)

	result, err := svc.FindBySurahNumber(1, 10, 0)
	if err != nil {
		t.Fatalf("find by surah: %v", err)
	}
	if len(result) != 2 {
		t.Fatalf("expected 2 tafsirs, got %d", len(result))
	}
}

func TestTafsirServiceFindBySurahNumberEmpty(t *testing.T) {
	repo := &fakeTafsirRepo{}
	svc := NewTafsirService(repo)

	result, err := svc.FindBySurahNumber(999, 10, 0)
	if err != nil {
		t.Fatalf("find by surah: %v", err)
	}
	if len(result) != 0 {
		t.Fatalf("expected 0 tafsirs, got %d", len(result))
	}
}

func TestTafsirServiceSave(t *testing.T) {
	repo := &fakeTafsirRepo{
		saveResult: &model.Tafsir{AyahID: intPtr(1)},
	}
	svc := NewTafsirService(repo)

	result, err := svc.Save(&model.Tafsir{AyahID: intPtr(1)})
	if err != nil {
		t.Fatalf("save: %v", err)
	}
	if result.AyahID == nil || *result.AyahID != 1 {
		t.Fatalf("expected ayah id 1, got %v", result.AyahID)
	}
}

func TestTafsirServiceSavePropagatesError(t *testing.T) {
	repo := &fakeTafsirRepo{saveErr: errors.New("db error")}
	svc := NewTafsirService(repo)

	if _, err := svc.Save(&model.Tafsir{}); err == nil {
		t.Fatal("expected error to propagate")
	}
}

func TestTafsirServiceUpdateByAyahID(t *testing.T) {
	repo := &fakeTafsirRepo{
		tafsir: &model.Tafsir{AyahID: intPtr(1)},
	}
	svc := NewTafsirService(repo)

	result, err := svc.UpdateByAyahID(1, &model.Tafsir{})
	if err != nil {
		t.Fatalf("update: %v", err)
	}
	if result.AyahID == nil || *result.AyahID != 1 {
		t.Fatalf("expected ayah id 1, got %v", result.AyahID)
	}
}

func TestTafsirServiceUpdateByAyahIDPropagatesError(t *testing.T) {
	repo := &fakeTafsirRepo{updateErr: errors.New("db error")}
	svc := NewTafsirService(repo)

	if _, err := svc.UpdateByAyahID(1, &model.Tafsir{}); err == nil {
		t.Fatal("expected error to propagate")
	}
}
