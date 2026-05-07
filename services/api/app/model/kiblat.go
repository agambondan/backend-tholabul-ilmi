package model

type KiblatResponse struct {
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Direction   float64 `json:"direction_degrees"`
	DistanceKM  float64 `json:"distance_km"`
	Compass     string  `json:"compass"`
	Description string  `json:"description"`
}
