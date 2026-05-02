package service

import (
	"time"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/google/uuid"
)

type StreakService interface {
	Record(userID uuid.UUID, actType model.ActivityType) error
	GetStreak(userID uuid.UUID) (*model.StreakResponse, error)
	GetWeekly(userID uuid.UUID) ([]model.WeeklyActivity, error)
}

type streakService struct {
	repo repository.UserActivityRepository
}

func NewStreakService(repo repository.UserActivityRepository) StreakService {
	return &streakService{repo}
}

func (s *streakService) Record(userID uuid.UUID, actType model.ActivityType) error {
	return s.repo.Record(userID, actType)
}

func (s *streakService) GetStreak(userID uuid.UUID) (*model.StreakResponse, error) {
	activities, err := s.repo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	// Collect distinct dates
	dateSet := map[string]struct{}{}
	for _, a := range activities {
		dateSet[a.ActivityDate.Format("2006-01-02")] = struct{}{}
	}

	current := 0
	longest := 0
	streak := 0
	today := time.Now()

	for i := 0; i <= 3650; i++ {
		day := today.AddDate(0, 0, -i).Format("2006-01-02")
		if _, ok := dateSet[day]; ok {
			streak++
			if i == 0 || current > 0 {
				current = streak
			}
			if streak > longest {
				longest = streak
			}
		} else {
			if i > 1 {
				streak = 0
			}
		}
	}

	return &model.StreakResponse{
		CurrentStreak: current,
		LongestStreak: longest,
		TotalDays:     len(dateSet),
	}, nil
}

func (s *streakService) GetWeekly(userID uuid.UUID) ([]model.WeeklyActivity, error) {
	since := time.Now().AddDate(0, 0, -6).Truncate(24 * time.Hour)
	activities, err := s.repo.FindByUserIDSince(userID, since)
	if err != nil {
		return nil, err
	}

	// Sum counts per date
	countByDate := map[string]int{}
	for _, a := range activities {
		key := a.ActivityDate.Format("2006-01-02")
		countByDate[key] += a.Count
	}

	var result []model.WeeklyActivity
	for i := 6; i >= 0; i-- {
		day := time.Now().AddDate(0, 0, -i).Format("2006-01-02")
		result = append(result, model.WeeklyActivity{
			Date:  day,
			Count: countByDate[day],
		})
	}
	return result, nil
}
