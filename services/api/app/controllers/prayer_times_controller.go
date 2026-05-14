package controllers

import (
	"fmt"
	"strconv"
	"time"

	"github.com/agambondan/islamic-explorer/app/lib"
	service "github.com/agambondan/islamic-explorer/app/services"
	"github.com/gofiber/fiber/v2"
)

type PrayerTimesController interface {
	GetByDate(ctx *fiber.Ctx) error
	GetWeekly(ctx *fiber.Ctx) error
	GetImsakiyah(ctx *fiber.Ctx) error
}

type prayerTimesController struct{ svc service.PrayerTimesService }

func NewPrayerTimesController(services *service.Services) PrayerTimesController {
	return &prayerTimesController{services.PrayerTimes}
}

// GetTimes prayer times by date
// @Summary Get prayer times by date
// @Tags Ibadah, Jadwal Sholat
// @Accept json
// @Produce json
// @Param lat query number true "Latitude"
// @Param lng query number true "Longitude"
// @Param method query string false "Calculation method (kemenag)" default(kemenag)
// @Param madhab query string false "Madhab (shafi)" default(shafi)
// @Param date query string false "Date YYYY-MM-DD" default(2024-01-01)
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Router /sholat-times [get]
func (c *prayerTimesController) GetByDate(ctx *fiber.Ctx) error {
	lat, lng, err := prayerParseLatLng(ctx)
	if err != nil {
		return lib.ErrorBadRequest(ctx, err.Error())
	}
	method := ctx.Query("method", "kemenag")
	madhab := ctx.Query("madhab", "shafi")
	dateStr := ctx.Query("date", time.Now().Format("2006-01-02"))
	date, err := time.ParseInLocation("2006-01-02", dateStr, time.Now().Location())
	if err != nil {
		return lib.ErrorBadRequest(ctx, "format tanggal harus YYYY-MM-DD")
	}
	result, err := c.svc.GetByDate(lat, lng, date, method, madhab)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, result)
}

// GetWeek weekly prayer times
// @Summary Get weekly prayer times
// @Tags Ibadah, Jadwal Sholat
// @Accept json
// @Produce json
// @Param lat query number true "Latitude"
// @Param lng query number true "Longitude"
// @Param method query string false "Calculation method (kemenag)" default(kemenag)
// @Param madhab query string false "Madhab (shafi)" default(shafi)
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Router /sholat-times/week [get]
func (c *prayerTimesController) GetWeekly(ctx *fiber.Ctx) error {
	lat, lng, err := prayerParseLatLng(ctx)
	if err != nil {
		return lib.ErrorBadRequest(ctx, err.Error())
	}
	method := ctx.Query("method", "kemenag")
	madhab := ctx.Query("madhab", "shafi")
	result, err := c.svc.GetWeekly(lat, lng, method, madhab)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, result)
}

// GetImsakiyah get imsakiyah schedule
// @Summary Get imsakiyah schedule for a month
// @Tags Ibadah, Jadwal Sholat
// @Accept json
// @Produce json
// @Param lat query number false "Latitude" default(-6.2088)
// @Param lng query number false "Longitude" default(106.8456)
// @Param method query string false "Calculation method (kemenag)" default(kemenag)
// @Param madhab query string false "Madhab (shafi)" default(shafi)
// @Param year query int false "Year"
// @Param month query int false "Month (1-12)"
// @Success 200 {object} lib.Response
// @Failure 400 {object} lib.Response
// @Router /imsakiyah [get]
func (c *prayerTimesController) GetImsakiyah(ctx *fiber.Ctx) error {
	lat, lng, err := prayerParseLatLng(ctx)
	if err != nil {
		if ctx.Query("lat") == "" && ctx.Query("lng") == "" {
			lat = -6.2088
			lng = 106.8456
		} else {
			return lib.ErrorBadRequest(ctx, err.Error())
		}
	}
	method := ctx.Query("method", "kemenag")
	madhab := ctx.Query("madhab", "shafi")
	now := time.Now()
	year, _ := strconv.Atoi(ctx.Query("year", strconv.Itoa(now.Year())))
	month, _ := strconv.Atoi(ctx.Query("month", strconv.Itoa(int(now.Month()))))
	if month < 1 || month > 12 {
		return lib.ErrorBadRequest(ctx, "month harus antara 1 dan 12")
	}
	result, err := c.svc.GetImsakiyah(lat, lng, year, month, method, madhab)
	if err != nil {
		return lib.ErrorInternal(ctx)
	}
	return lib.OK(ctx, result)
}

func prayerParseLatLng(ctx *fiber.Ctx) (float64, float64, error) {
	lat, err := strconv.ParseFloat(ctx.Query("lat"), 64)
	if err != nil {
		return 0, 0, fmt.Errorf("lat harus berupa angka")
	}
	lng, err := strconv.ParseFloat(ctx.Query("lng"), 64)
	if err != nil {
		return 0, 0, fmt.Errorf("lng harus berupa angka")
	}
	return lat, lng, nil
}
