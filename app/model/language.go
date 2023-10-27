package model

type Language struct {
	BaseID
	Name       *string `json:"name"`
	IsoCode    *string `json:"iso_code"`
	NativeName *string `json:"native_name"`
}

func (l *Language) Seeder() []Language {
	var languages []Language

	return languages
}
