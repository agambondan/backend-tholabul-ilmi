package middlewares

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/spf13/viper"
)

func SecurityHeaders() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Set some security headers:
		c.Set("X-XSS-Protection", "1; mode=block")
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-Download-Options", "noopen")
		c.Set("Strict-Transport-Security", "max-age=5184000")
		//c.Set("X-Frame-Options", "SAMEORIGIN")
		c.Set("X-DNS-Prefetch-Control", "off")

		// Go to next middlewares:
		return c.Next()
	}
}

func Cors() fiber.Handler {
	return cors.New(cors.Config{
		AllowMethods:     viper.GetString("ALLOW_METHODS"),
		AllowOrigins:     viper.GetString("ALLOW_ORIGINS"),
		AllowHeaders:     viper.GetString("ALLOW_HEADERS"),
		ExposeHeaders:    viper.GetString("EXPOSE_HEADERS"),
		AllowCredentials: true,
	})
}

func IsTokenValid() fiber.Handler {
	return func(c *fiber.Ctx) error {
		err := lib.TokenValid(c)
		if err != nil {
			return c.Status(401).JSON(map[string]interface{}{
				"error": "unauthorized",
			})
		}
		return c.Next()
	}
}

func UserMiddleware() {

}

func AdminMiddleware() {

}
