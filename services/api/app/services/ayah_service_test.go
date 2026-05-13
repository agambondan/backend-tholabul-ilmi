package service

import (
	"testing"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/gofiber/fiber/v2"
	"github.com/morkid/paginate"
)

type fakeAyahRepo struct {
	count      int64
	dailyInput int
}

func (f *fakeAyahRepo) Save(ayah *model.Ayah) (*model.Ayah, error) { return ayah, nil }
func (f *fakeAyahRepo) FindAll(ctx *fiber.Ctx) *paginate.Page      { return &paginate.Page{} }
func (f *fakeAyahRepo) FindById(id *int) (*model.Ayah, error)      { return &model.Ayah{}, nil }
func (f *fakeAyahRepo) FindManyByIds(ids []int) ([]model.Ayah, error) {
	return []model.Ayah{}, nil
}
func (f *fakeAyahRepo) FindDaily(number int) (*model.Ayah, error) {
	f.dailyInput = number
	return &model.Ayah{Number: &number}, nil
}
func (f *fakeAyahRepo) FindByNumber(ctx *fiber.Ctx, number *int) (*paginate.Page, error) {
	return &paginate.Page{}, nil
}
func (f *fakeAyahRepo) FindBySurahNumber(ctx *fiber.Ctx, number *int) (*paginate.Page, error) {
	return &paginate.Page{}, nil
}
func (f *fakeAyahRepo) FindByPage(page int) ([]model.Ayah, error) {
	return []model.Ayah{}, nil
}
func (f *fakeAyahRepo) FindByHizbQuarter(hizb int) ([]model.Ayah, error) {
	return []model.Ayah{}, nil
}
func (f *fakeAyahRepo) UpdateById(id *int, ayah *model.Ayah) (*model.Ayah, error) {
	return ayah, nil
}
func (f *fakeAyahRepo) DeleteById(id *int, scoped *string) error { return nil }
func (f *fakeAyahRepo) Count() (*int64, error)                   { return &f.count, nil }

func TestAyahServiceFindDailyUsesActualCount(t *testing.T) {
	repo := &fakeAyahRepo{count: 7}
	svc := NewAyahService(repo)

	ayah, err := svc.FindDaily()
	if err != nil {
		t.Fatalf("find daily: %v", err)
	}
	if repo.dailyInput < 1 || repo.dailyInput > int(repo.count) {
		t.Fatalf("daily input out of range: %d for count %d", repo.dailyInput, repo.count)
	}
	if ayah.Number == nil || *ayah.Number != repo.dailyInput {
		t.Fatalf("expected ayah number %d, got %#v", repo.dailyInput, ayah.Number)
	}
}

func TestAyahServiceFindDailyRejectsEmptyCount(t *testing.T) {
	repo := &fakeAyahRepo{count: 0}
	svc := NewAyahService(repo)

	if _, err := svc.FindDaily(); err == nil {
		t.Fatal("expected error for empty ayah count")
	}
}
