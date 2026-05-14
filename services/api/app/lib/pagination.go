package lib

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type KeysetPage struct {
	Items      interface{} `json:"items"`
	NextCursor *int        `json:"next_cursor,omitempty"`
	HasMore    bool        `json:"has_more"`
	Total      int64       `json:"total"`
}

func GetKeysetParams(c *fiber.Ctx) (cursor int, limit int) {
	cursor, _ = strconv.Atoi(c.Query("cursor", "0"))
	limit, _ = strconv.Atoi(c.Query("limit", "20"))
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	return cursor, limit
}
