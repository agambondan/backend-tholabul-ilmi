package model

type Recitation struct {
	BaseID
	Name  *string           `json:"name,omitempty"`
	Media []RecitationAsset `json:"media,omitempty"`
}

type RecitationAsset struct {
	BaseID
	RecitationID *int        `json:"recitation_id,omitempty"`
	MultimediaID *int        `json:"multimedia_id,omitempty"`
	Recitation   *Recitation `json:"-"`
	Multimedia   *Multimedia `json:"multimedia"`
}
