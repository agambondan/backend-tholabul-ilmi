package middlewares

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func PoolProtection(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		sqlDB, err := db.DB()
		if err != nil {
			return c.Next()
		}
		stats := sqlDB.Stats()
		if stats.MaxOpenConnections > 0 && stats.InUse >= stats.MaxOpenConnections-2 {
			return c.Status(503).JSON(fiber.Map{
				"error": "server busy, retry later",
				"pool": fiber.Map{
					"open":   stats.OpenConnections,
					"in_use": stats.InUse,
					"max":    stats.MaxOpenConnections,
				},
			})
		}
		return c.Next()
	}
}
