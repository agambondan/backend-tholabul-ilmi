package model

type LibraryBookStatus string
type LibraryBookFormat string

const (
	LibraryBookStatusDraft     LibraryBookStatus = "draft"
	LibraryBookStatusPublished LibraryBookStatus = "published"

	LibraryBookFormatPDF  LibraryBookFormat = "pdf"
	LibraryBookFormatEPUB LibraryBookFormat = "epub"
	LibraryBookFormatHTML LibraryBookFormat = "html"
	LibraryBookFormatLink LibraryBookFormat = "link"
)

type LibraryBook struct {
	BaseID
	Title       string            `json:"title" gorm:"type:varchar(256);not null;index"`
	Slug        string            `json:"slug" gorm:"type:varchar(256);not null;uniqueIndex"`
	Author      string            `json:"author" gorm:"type:varchar(256);index"`
	Description string            `json:"description" gorm:"type:text"`
	Category    string            `json:"category" gorm:"type:varchar(100);index"`
	Level       string            `json:"level" gorm:"type:varchar(50);index"`
	Language    string            `json:"language" gorm:"type:varchar(50);index"`
	Format      LibraryBookFormat `json:"format" gorm:"type:varchar(30);default:'link';index"`
	SourceURL   string            `json:"source_url" gorm:"type:varchar(700)"`
	CoverURL    string            `json:"cover_url" gorm:"type:varchar(700)"`
	License     string            `json:"license" gorm:"type:varchar(256)"`
	Pages       int               `json:"pages" gorm:"default:0"`
	Tags        string            `json:"tags" gorm:"type:varchar(500)"`
	Status      LibraryBookStatus `json:"status" gorm:"type:varchar(30);default:'published';index"`
}

type CreateLibraryBookRequest struct {
	Title       string            `json:"title" validate:"required,max=256"`
	Slug        string            `json:"slug" validate:"max=256"`
	Author      string            `json:"author" validate:"max=256"`
	Description string            `json:"description" validate:"max=5000"`
	Category    string            `json:"category" validate:"max=100"`
	Level       string            `json:"level" validate:"max=50"`
	Language    string            `json:"language" validate:"max=50"`
	Format      LibraryBookFormat `json:"format"`
	SourceURL   string            `json:"source_url" validate:"max=700"`
	CoverURL    string            `json:"cover_url" validate:"max=700"`
	License     string            `json:"license" validate:"max=256"`
	Pages       int               `json:"pages"`
	Tags        string            `json:"tags" validate:"max=500"`
	Status      LibraryBookStatus `json:"status"`
}
