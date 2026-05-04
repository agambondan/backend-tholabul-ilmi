package model

type DoaCategory string

const (
	DoaCategoryPagi       DoaCategory = "pagi"
	DoaCategoryPetang     DoaCategory = "petang"
	DoaCategoryMakan      DoaCategory = "makan"
	DoaCategoryTidur      DoaCategory = "tidur"
	DoaCategoryBangun     DoaCategory = "bangun"
	DoaCategoryKamarMandi DoaCategory = "kamar_mandi"
	DoaCategoryMasjid     DoaCategory = "masjid"
	DoaCategorySafar      DoaCategory = "safar"
	DoaCategoryBelajar    DoaCategory = "belajar"
	DoaCategoryUmum       DoaCategory = "umum"
)

type Doa struct {
	BaseID
	Category            DoaCategory  `json:"category" gorm:"type:varchar(100);not null;uniqueIndex:idx_doa_category_title"`
	Title               string       `json:"title" gorm:"type:varchar(256);not null;uniqueIndex:idx_doa_category_title"`
	Arabic              string       `json:"arabic" gorm:"type:text;not null"`
	Transliteration     string       `json:"transliteration" gorm:"type:text"`
	Translation         string       `json:"translation" gorm:"type:text;not null"`
	Source              string       `json:"source" gorm:"type:varchar(256)"`
	TranslationID       *int         `json:"translation_id,omitempty" gorm:"index"`
	TranslationRelation *Translation `json:"translation_rel,omitempty" gorm:"foreignKey:TranslationID;-:migration"`
}
