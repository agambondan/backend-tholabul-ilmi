package model

type Multimedia struct {
	BaseID
	Title            *string  `json:"title,omitempty" gorm:"type:varchar(256)"`                                                       // Title
	FileName         *string  `json:"file_name,omitempty" gorm:"type:varchar(256)"`                                                   // File Name
	FileSize         *float64 `json:"file_size,omitempty" format:"float" swaggertype:"number"`                                        // File Size
	OriginalFileName *string  `json:"original_file_name,omitempty" gorm:"type:varchar(256)"`                                          // Original File Name
	URL              *string  `json:"url,omitempty" gorm:"type:varchar(256)" example:"protocol://domain.ltd/path/to/image.extension"` // Url
	Description      *string  `json:"description,omitempty" gorm:"type:text"`                                                         // Description
	Format           *string  `json:"format,omitempty" gorm:"type:enum('pdf', 'jpg', 'mp3');column:format"`                           // Format
}
