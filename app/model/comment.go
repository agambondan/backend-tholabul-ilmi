package model

type Comment struct {
	BaseID
	Description string         `json:"description"`
	AyahID      *int           `json:"ayah_id"`
	Ayah        *Ayah          `json:"ayah"`
	Media       []CommentAsset `json:"media,omitempty"`
}

type CommentAsset struct {
	BaseID
	CommentID    *int        `json:"comment_id,omitempty"`
	MultimediaID *int        `json:"multimedia_id,omitempty"`
	Comment      *Comment    `json:"-"`
	Multimedia   *Multimedia `json:"multimedia"`
}
