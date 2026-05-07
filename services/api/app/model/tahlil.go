package model

type TahlilType string

const (
	TahlilTypeYasin    TahlilType = "yasin"
	TahlilTypeTahlil   TahlilType = "tahlil"
	TahlilTypeDoaArwah TahlilType = "doa_arwah"
)

type TahlilCollection struct {
	BaseID
	Type        TahlilType   `json:"type" gorm:"type:varchar(50);not null;uniqueIndex"`
	Title       string       `json:"title" gorm:"type:varchar(256);not null"`
	Description string       `json:"description" gorm:"type:text"`
	Items       []TahlilItem `json:"items,omitempty" gorm:"foreignKey:CollectionID;-:migration"`
}

type TahlilItem struct {
	BaseID
	CollectionID    *int         `json:"collection_id,omitempty" gorm:"not null;index;uniqueIndex:idx_tahlil_collection_sort"`
	SortOrder       int          `json:"sort_order" gorm:"default:0;uniqueIndex:idx_tahlil_collection_sort"`
	Label           string       `json:"-" gorm:"type:varchar(256)"`
	Arabic          string       `json:"-" gorm:"type:text"`
	Transliteration string       `json:"-" gorm:"type:text"`
	TranslationText string       `json:"-" gorm:"column:translation;type:text"`
	Repeat          int          `json:"repeat" gorm:"default:1"`
	TranslationID   *int         `json:"translation_id,omitempty" gorm:"index"`
	Translation     *Translation `json:"translation,omitempty" gorm:"foreignKey:TranslationID;-:migration"`
}
