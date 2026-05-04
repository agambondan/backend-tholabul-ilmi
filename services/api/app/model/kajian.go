package model

type KajianType string

const (
	KajianTypeVideo KajianType = "video"
	KajianTypeAudio KajianType = "audio"
	KajianTypeText  KajianType = "text"
)

type Kajian struct {
	BaseID
	Title         string       `json:"title" gorm:"type:varchar(512);not null;uniqueIndex:idx_kajian_title_speaker_published"`
	Description   string       `json:"description" gorm:"type:text"`
	Speaker       string       `json:"speaker" gorm:"type:varchar(256);index;uniqueIndex:idx_kajian_title_speaker_published"`
	Topic         string       `json:"topic" gorm:"type:varchar(256);index"`
	Type          KajianType   `json:"type" gorm:"type:varchar(20);not null;default:'video'"`
	URL           string       `json:"url" gorm:"type:varchar(1024)"`
	Duration      int          `json:"duration_seconds" gorm:"default:0"`
	ThumbnailURL  string       `json:"thumbnail_url" gorm:"type:varchar(1024)"`
	ViewCount     int          `json:"view_count" gorm:"default:0"`
	PublishedAt   string       `json:"published_at" gorm:"type:date;uniqueIndex:idx_kajian_title_speaker_published"`
	TranslationID *int         `json:"translation_id,omitempty" gorm:"index"`
	Translation   *Translation `json:"translation,omitempty" gorm:"foreignKey:TranslationID;-:migration"`
}

type CreateKajianRequest struct {
	Title        string     `json:"title" validate:"required"`
	Description  string     `json:"description"`
	Speaker      string     `json:"speaker"`
	Topic        string     `json:"topic"`
	Type         KajianType `json:"type" validate:"required,oneof=video audio text"`
	URL          string     `json:"url"`
	Duration     int        `json:"duration_seconds"`
	ThumbnailURL string     `json:"thumbnail_url"`
	PublishedAt  string     `json:"published_at"`
}
