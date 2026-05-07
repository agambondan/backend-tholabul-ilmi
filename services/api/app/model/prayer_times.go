package model

type PrayerTimesResponse struct {
	Date    string     `json:"date"`
	Lat     float64    `json:"lat"`
	Lng     float64    `json:"lng"`
	Method  string     `json:"method"`
	Madhab  string     `json:"madhab"`
	Prayers PrayerTime `json:"prayers"`
}

type PrayerTime struct {
	Imsak   string `json:"imsak"`
	Fajr    string `json:"fajr"`
	Sunrise string `json:"sunrise"`
	Dhuhr   string `json:"dhuhr"`
	Asr     string `json:"asr"`
	Maghrib string `json:"maghrib"`
	Isha    string `json:"isha"`
}

type ImsakiyahRow struct {
	Date    string     `json:"date"`
	Hijri   string     `json:"hijri,omitempty"`
	Prayers PrayerTime `json:"prayers"`
}

type ImsakiyahResponse struct {
	Year   int            `json:"year"`
	Month  int            `json:"month"`
	Lat    float64        `json:"lat"`
	Lng    float64        `json:"lng"`
	Method string         `json:"method"`
	Madhab string         `json:"madhab"`
	Rows   []ImsakiyahRow `json:"schedule"`
}
