package model

type SirohCategory struct {
	BaseID
	Title    string         `json:"title" gorm:"type:varchar(256);not null"`
	Slug     string         `json:"slug" gorm:"type:varchar(256);uniqueIndex;not null"`
	Order    int            `json:"order" gorm:"default:0"`
	Contents []SirohContent `json:"contents,omitempty" gorm:"foreignKey:CategoryID;-:migration"`
}

type SirohContent struct {
	BaseID
	CategoryID *int           `json:"category_id,omitempty" gorm:"not null;index"`
	Title      string         `json:"title" gorm:"type:varchar(256);not null"`
	Slug       string         `json:"slug" gorm:"type:varchar(256);uniqueIndex;not null"`
	Content    string         `json:"content" gorm:"type:text;not null"`
	Order      int            `json:"order" gorm:"default:0"`
	Category   *SirohCategory `json:"category,omitempty"`
}
