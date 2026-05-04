package service

import (
	"fmt"
	"math"
	"time"

	"github.com/agambondan/islamic-explorer/app/model"
	"github.com/agambondan/islamic-explorer/app/repository"
)

type HijriService interface {
	ConvertToHijri(year, month, day int) *model.HijriDate
	Today() *model.HijriDate
	GetEvents(category string) ([]model.IslamicEvent, error)
	GetEventsByMonth(month int) ([]model.IslamicEvent, error)
}

type hijriService struct {
	repo repository.IslamicEventRepository
}

func NewHijriService(repo repository.IslamicEventRepository) HijriService {
	return &hijriService{repo}
}

// islamicEpoch is the Julian Day Number for 1 Muharram 1 AH (July 16, 622 CE Julian).
const islamicEpoch = 1948439.5

func leapGregorian(year int) bool {
	return (year%4 == 0) && (year%100 != 0 || year%400 == 0)
}

func gregorianToJD(year, month, day int) float64 {
	var extra float64
	if month <= 2 {
		extra = 0
	} else if leapGregorian(year) {
		extra = -1
	} else {
		extra = -2
	}
	return (1721425.5 - 1) +
		365*float64(year-1) +
		math.Floor(float64(year-1)/4) -
		math.Floor(float64(year-1)/100) +
		math.Floor(float64(year-1)/400) +
		math.Floor((367*float64(month)-362)/12+extra+float64(day))
}

func islamicToJD(year, month, day int) float64 {
	return float64(day) +
		math.Ceil(29.5*float64(month-1)) +
		float64(year-1)*354 +
		math.Floor(float64(3+11*year)/30) +
		islamicEpoch - 1
}

func jdToIslamic(jd float64) (int, int, int) {
	jd = math.Floor(jd) + 0.5
	year := int(math.Floor((30*(jd-islamicEpoch) + 10646) / 10631))
	month := int(math.Min(12, math.Ceil((jd-(29+islamicToJD(year, 1, 1)))/29.5)+1))
	day := int(jd-islamicToJD(year, month, 1)) + 1
	return year, month, day
}

func (s *hijriService) ConvertToHijri(year, month, day int) *model.HijriDate {
	jd := gregorianToJD(year, month, day)
	hy, hm, hd := jdToIslamic(jd)
	return &model.HijriDate{
		Year:           hy,
		Month:          hm,
		Day:            hd,
		MonthName:      model.HijriMonthName(hm),
		YearStr:        fmt.Sprintf("%d H", hy),
		DateStr:        fmt.Sprintf("%d %s %d H", hd, model.HijriMonthName(hm), hy),
		GregorianYear:  year,
		GregorianMonth: month,
		GregorianDay:   day,
	}
}

func (s *hijriService) Today() *model.HijriDate {
	now := time.Now()
	return s.ConvertToHijri(now.Year(), int(now.Month()), now.Day())
}

func (s *hijriService) GetEvents(category string) ([]model.IslamicEvent, error) {
	return s.repo.FindAll(category)
}

func (s *hijriService) GetEventsByMonth(month int) ([]model.IslamicEvent, error) {
	return s.repo.FindByMonth(month)
}
