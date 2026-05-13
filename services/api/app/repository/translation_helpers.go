package repository

import (
	"github.com/agambondan/islamic-explorer/app/model"
	"gorm.io/gorm"
)

func strptrOrNil(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}

func upsertContentTranslation(db *gorm.DB, existingID *int, title, arabic, latin, description string) (*int, error) {
	tr := &model.Translation{
		Idn:            strptrOrNil(title),
		Ar:             strptrOrNil(arabic),
		LatinIdn:       strptrOrNil(latin),
		DescriptionIdn: strptrOrNil(description),
	}

	if existingID != nil {
		tr.ID = existingID
		if err := db.Model(&model.Translation{}).Where("id = ?", *existingID).Updates(map[string]interface{}{
			"idn":             tr.Idn,
			"ar":              tr.Ar,
			"latin_idn":       tr.LatinIdn,
			"description_idn": tr.DescriptionIdn,
		}).Error; err != nil {
			return nil, err
		}
		return existingID, nil
	}

	if err := db.Create(tr).Error; err != nil {
		return nil, err
	}
	return tr.ID, nil
}
