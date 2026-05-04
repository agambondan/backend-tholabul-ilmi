package service

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
	"github.com/spf13/viper"
)

type NotificationService interface {
	FindSettings(userID uuid.UUID) ([]model.NotificationSetting, error)
	UpsertSettings(userID uuid.UUID, req *model.NotificationSettingsUpsertRequest) ([]model.NotificationSetting, error)
	DispatchDueReminders(now time.Time) (int, error)
	StartReminderScheduler(ctx context.Context, interval time.Duration)
}

type notificationService struct {
	repo repository.NotificationRepository
}

func NewNotificationService(repo repository.NotificationRepository) NotificationService {
	return &notificationService{repo}
}

func (s *notificationService) FindSettings(userID uuid.UUID) ([]model.NotificationSetting, error) {
	return s.repo.FindByUser(userID)
}

func (s *notificationService) UpsertSettings(userID uuid.UUID, req *model.NotificationSettingsUpsertRequest) ([]model.NotificationSetting, error) {
	unique := map[model.NotificationType]model.NotificationSettingRequest{}
	for _, setting := range req.Settings {
		unique[setting.Type] = setting
	}

	items := make([]model.NotificationSetting, 0, len(unique))
	for _, setting := range unique {
		normalizedTime, err := normalizeReminderTime(setting.Time)
		if err != nil {
			return nil, err
		}
		active := true
		if setting.IsActive != nil {
			active = *setting.IsActive
		}
		items = append(items, model.NotificationSetting{
			UserID:   userID,
			Type:     setting.Type,
			Time:     normalizedTime,
			IsActive: active,
		})
	}

	return s.repo.UpsertMany(items)
}

func (s *notificationService) DispatchDueReminders(now time.Time) (int, error) {
	items, err := s.repo.FindDue(now)
	if err != nil {
		return 0, err
	}

	sent := 0
	for _, setting := range items {
		if setting.User == nil || setting.User.Email == nil || strings.TrimSpace(*setting.User.Email) == "" {
			continue
		}

		subject, body := reminderMessage(setting.Type)
		if err := lib.SendHTMLEmail(*setting.User.Email, subject, body); err != nil {
			slog.Warn("notification reminder failed", "user_id", setting.UserID, "type", setting.Type, "err", err)
			continue
		}
		if setting.ID != nil {
			if err := s.repo.MarkSent(*setting.ID, now); err != nil {
				slog.Warn("notification mark-sent failed", "id", *setting.ID, "err", err)
			}
		}
		sent++
	}

	return sent, nil
}

func (s *notificationService) StartReminderScheduler(ctx context.Context, interval time.Duration) {
	if interval <= 0 {
		interval = time.Minute
	}
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			if _, err := s.DispatchDueReminders(time.Now()); err != nil {
				slog.Error("notification scheduler error", "err", err)
			}
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
			}
		}
	}()
}

func normalizeReminderTime(value string) (string, error) {
	parsed, err := time.Parse("15:04", value)
	if err != nil {
		return "", fmt.Errorf("time must use HH:MM format")
	}
	return parsed.Format("15:04"), nil
}

func reminderMessage(notificationType model.NotificationType) (string, string) {
	appURL := viper.GetString("APP_URL")
	if appURL == "" {
		appURL = "https://tholabul-ilmi.app"
	}

	title := "Pengingat Harian"
	description := "Waktunya kembali membaca dan menjaga rutinitas harian Anda."
	switch notificationType {
	case model.NotificationTypeDailyQuran:
		title = "Pengingat Baca Al-Quran"
		description = "Hari ini waktu yang baik untuk membaca beberapa ayat Al-Quran dan melanjutkan konsistensi tilawah Anda."
	case model.NotificationTypeDailyHadith:
		title = "Pengingat Baca Hadith"
		description = "Luangkan waktu untuk membaca satu hadith dan mengambil satu pelajaran praktis darinya."
	case model.NotificationTypeDoa:
		title = "Pengingat Doa Harian"
		description = "Perbarui dzikir dan doa harian Anda untuk menjaga hati tetap terhubung."
	}

	body := fmt.Sprintf(`
<p>Assalamu'alaikum,</p>
<p><strong>%s</strong></p>
<p>%s</p>
<p>Buka aplikasi: <a href="%s">%s</a></p>
`, title, description, appURL, appURL)

	return title, body
}
