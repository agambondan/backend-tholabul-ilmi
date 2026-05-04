package model

type IslamicEventCategory string

const (
	EventCategoryPuasa     IslamicEventCategory = "puasa"
	EventCategoryEid       IslamicEventCategory = "eid"
	EventCategoryPeristiwa IslamicEventCategory = "peristiwa"
)

type IslamicEvent struct {
	BaseID
	Name        string               `json:"name" gorm:"type:varchar(256);not null;uniqueIndex:idx_islamic_event_date_name"`
	HijriMonth  int                  `json:"hijri_month" gorm:"not null;index;uniqueIndex:idx_islamic_event_date_name"`
	HijriDay    int                  `json:"hijri_day" gorm:"not null;uniqueIndex:idx_islamic_event_date_name"`
	Description string               `json:"description" gorm:"type:text"`
	Category    IslamicEventCategory `json:"category" gorm:"type:varchar(20);not null;index"`
}

type HijriDate struct {
	Year           int    `json:"year"`
	Month          int    `json:"month"`
	Day            int    `json:"day"`
	MonthName      string `json:"month_name"`
	YearStr        string `json:"year_str"`
	DateStr        string `json:"date_str"`
	GregorianYear  int    `json:"gregorian_year"`
	GregorianMonth int    `json:"gregorian_month"`
	GregorianDay   int    `json:"gregorian_day"`
}

var hijriMonthNames = []string{
	"", "Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir",
	"Jumadal Ula", "Jumadal Akhirah", "Rajab", "Sya'ban",
	"Ramadan", "Syawal", "Dzulqa'dah", "Dzulhijjah",
}

func HijriMonthName(m int) string {
	if m < 1 || m > 12 {
		return ""
	}
	return hijriMonthNames[m]
}
