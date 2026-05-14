package middlewares

import (
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

func CacheControl(maxAge int) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if err := c.Next(); err != nil {
			return err
		}

		if c.Method() != "GET" {
			return nil
		}

		if c.Response().StatusCode() >= 400 {
			return nil
		}

		c.Response().Header.Set("Cache-Control", "public, max-age="+strconv.Itoa(maxAge))
		c.Response().Header.Set("Vary", "Accept-Language, Accept-Encoding")
		return nil
	}
}

func NoCache() fiber.Handler {
	return func(c *fiber.Ctx) error {
		if err := c.Next(); err != nil {
			return err
		}
		c.Response().Header.Set("Cache-Control", "no-store, no-cache, must-revalidate")
		return nil
	}
}

func CacheByType(staticMaxAge, dynamicMaxAge int) fiber.Handler {
	staticPrefixes := []string{"/api/v1/surah", "/api/v1/juz", "/api/v1/asmaul-husna",
		"/api/v1/doa", "/api/v1/dzikir", "/api/v1/tahlil", "/api/v1/fiqh",
		"/api/v1/manasik", "/api/v1/books", "/api/v1/themes", "/api/v1/chapters",
		"/api/v1/hijri", "/api/v1/dictionary", "/api/v1/perawi"}

	return func(c *fiber.Ctx) error {
		path := c.Path()
		if c.Method() == "GET" && c.Response().StatusCode() < 400 {
			maxAge := dynamicMaxAge
			for _, prefix := range staticPrefixes {
				if strings.HasPrefix(path, prefix) {
					maxAge = staticMaxAge
					break
				}
			}
			c.Response().Header.Set("Cache-Control", "public, max-age="+strconv.Itoa(maxAge))
			c.Response().Header.Set("Vary", "Accept-Language, Accept-Encoding")
			c.Response().Header.Set("X-Cache-TTL", strconv.Itoa(maxAge))
		}
		return c.Next()
	}
}

func init() {
	_ = time.Now
}
