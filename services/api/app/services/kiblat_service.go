package service

import (
	"fmt"
	"math"

	"github.com/agambondan/islamic-explorer/app/model"
)

const (
	kaabaLat = 21.3891
	kaabaLng = 39.8579
)

type KiblatService interface {
	Calculate(lat, lng float64) (*model.KiblatResponse, error)
}

type kiblatService struct{}

func NewKiblatService() KiblatService { return &kiblatService{} }

func (s *kiblatService) Calculate(lat, lng float64) (*model.KiblatResponse, error) {
	latR := lat * math.Pi / 180
	lngR := lng * math.Pi / 180
	kLat := kaabaLat * math.Pi / 180
	kLng := kaabaLng * math.Pi / 180

	dLng := kLng - lngR
	x := math.Sin(dLng) * math.Cos(kLat)
	y := math.Cos(latR)*math.Sin(kLat) - math.Sin(latR)*math.Cos(kLat)*math.Cos(dLng)

	bearing := math.Atan2(x, y) * 180 / math.Pi
	bearing = math.Mod(bearing+360, 360)

	return &model.KiblatResponse{
		Latitude:    lat,
		Longitude:   lng,
		Direction:   math.Round(bearing*100) / 100,
		Compass:     degreesToCompass(bearing),
		Description: fmt.Sprintf("Arah kiblat dari koordinat (%.4f, %.4f) adalah %.2f° dari Utara (%s)", lat, lng, bearing, degreesToCompass(bearing)),
	}, nil
}

func degreesToCompass(d float64) string {
	directions := []string{"U", "UTL", "TL", "TTL", "T", "TTG", "TG", "BTG", "B", "BSD", "BD", "SBD", "S", "SBL", "BL", "UBL"}
	idx := int((d+11.25)/22.5) % 16
	full := []string{"Utara", "Utara-Timur Laut", "Timur Laut", "Timur-Timur Laut", "Timur", "Timur-Timur Tenggara", "Tenggara", "Selatan-Tenggara", "Selatan", "Selatan-Barat Daya", "Barat Daya", "Barat-Barat Daya", "Barat", "Barat-Barat Laut", "Barat Laut", "Utara-Barat Laut"}
	_ = directions
	return full[idx]
}
