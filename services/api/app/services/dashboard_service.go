package service

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/google/uuid"
	"golang.org/x/sync/errgroup"
	"gorm.io/gorm"
)

type DashboardResponse struct {
	DailyAyah      *model.Ayah              `json:"daily_ayah,omitempty"`
	DailyHadith    *model.Hadith            `json:"daily_hadith,omitempty"`
	Streak         *model.StreakResponse    `json:"streak,omitempty"`
	SholatToday    *model.SholatDailyStatus `json:"sholat_today,omitempty"`
	Notifications  []model.UserNotification `json:"notifications,omitempty"`
	UnreadCount    int64                    `json:"unread_count"`
	TilawahSummary *model.TilawahSummary    `json:"tilawah_summary,omitempty"`
}

type DashboardService interface {
	GetHome(userID uuid.UUID) (*DashboardResponse, error)
}

type dashboardService struct {
	db           *gorm.DB
	ayah         AyahService
	hadith       HadithService
	streak       StreakService
	sholat       SholatService
	notification NotificationInboxService
	tilawah      TilawahService
}

func NewDashboardService(db *gorm.DB, ayah AyahService, hadith HadithService, streak StreakService, sholat SholatService, notification NotificationInboxService, tilawah TilawahService) DashboardService {
	return &dashboardService{db, ayah, hadith, streak, sholat, notification, tilawah}
}

func (s *dashboardService) GetHome(userID uuid.UUID) (*DashboardResponse, error) {
	resp := &DashboardResponse{}
	g := new(errgroup.Group)

	g.Go(func() (err error) {
		resp.DailyAyah, err = s.ayah.FindDaily()
		return err
	})
	g.Go(func() (err error) {
		resp.DailyHadith, err = s.hadith.FindDaily()
		return err
	})
	g.Go(func() (err error) {
		resp.Streak, err = s.streak.GetStreak(userID)
		return err
	})
	g.Go(func() (err error) {
		resp.SholatToday, err = s.sholat.GetToday(userID)
		return err
	})
	g.Go(func() (err error) {
		resp.UnreadCount, err = s.notification.UnreadCount(userID)
		return err
	})
	g.Go(func() (err error) {
		resp.Notifications, err = s.notification.List(userID)
		return err
	})
	g.Go(func() (err error) {
		resp.TilawahSummary, err = s.tilawah.Summary(userID)
		return err
	})

	if err := g.Wait(); err != nil {
		return nil, err
	}
	return resp, nil
}
