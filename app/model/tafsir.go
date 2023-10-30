package model

type Tafsir struct {
	BaseID
	KemenagTranslationID    *int        `json:"kemenag_translation_id,omitempty"`
	IbnuKatsirTranslationID *int        `json:"ibnu_katsir_translation_id,omitempty"`
	KemenagTranslation      Translation `json:"kemenag,omitempty"`
	IbnuKatsirTranslation   Translation `json:"ibnu_katsir,omitempty"`
}
