package model

type Tafsir struct {
	BaseID
	KemenagTranslationID    *int        `json:"-"`
	IbnuKatsirTranslationID *int        `json:"-"`
	KemenagTranslation      Translation `json:"kemenag"`
	IbnuKatsirTranslation   Translation `json:"ibnu_katsir"`
}
