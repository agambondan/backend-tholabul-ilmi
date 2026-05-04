package model

type Tafsir struct {
	BaseID
	AyahID                  *int        `json:"ayah_id,omitempty" gorm:"uniqueIndex"`
	KemenagTranslationID    *int        `json:"kemenag_translation_id,omitempty"`
	IbnuKatsirTranslationID *int        `json:"ibnu_katsir_translation_id,omitempty"`
	KemenagTranslation      Translation `json:"kemenag,omitempty" gorm:"foreignKey:KemenagTranslationID"`
	IbnuKatsirTranslation   Translation `json:"ibnu_katsir,omitempty" gorm:"foreignKey:IbnuKatsirTranslationID"`
	Ayah                    *Ayah       `json:"ayah,omitempty"`
}
