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
	CollectionID    *int   `json:"collection_id,omitempty" gorm:"not null;index;uniqueIndex:idx_tahlil_collection_sort"`
	SortOrder       int    `json:"sort_order" gorm:"default:0;uniqueIndex:idx_tahlil_collection_sort"`
	Label           string `json:"label" gorm:"type:varchar(256)"`
	Arabic          string `json:"arabic" gorm:"type:text"`
	Transliteration string `json:"transliteration" gorm:"type:text"`
	Translation     string `json:"translation" gorm:"type:text"`
	Repeat          int    `json:"repeat" gorm:"default:1"`
}
