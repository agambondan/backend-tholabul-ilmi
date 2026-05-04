package middlewares

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/golang-jwt/jwt/v5"
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
		c.Set("X-Frame-Options", "SAMEORIGIN")
		c.Set("X-DNS-Prefetch-Control", "off")

		// Go to next middlewares:
		return c.Next()
	}
}

func Cors() fiber.Handler {
	allowOrigins := viper.GetString("ALLOW_ORIGINS")
	if allowOrigins == "" {
		allowOrigins = "http://localhost:3000,http://localhost:5173"
	}
	return cors.New(cors.Config{
		AllowMethods:     viper.GetString("ALLOW_METHODS"),
		AllowOrigins:     allowOrigins,
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

func JWTAuth() fiber.Handler {
	return IsTokenValid()
}

func UserMiddleware() fiber.Handler {
	return IsTokenValid()
}

func AdminMiddleware() fiber.Handler {
	return RequireRole("admin")
}

func AuthorOrAdminMiddleware() fiber.Handler {
	return RequireRole("admin", "author")
}

func EditorOrAdminMiddleware() fiber.Handler {
	return RequireRole("admin", "editor")
}

func RequireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		token, err := lib.VerifyToken(c)
		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(map[string]interface{}{
				"error": "unauthorized",
			})
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusForbidden).JSON(map[string]interface{}{
				"error": "forbidden",
			})
		}
		role, _ := claims["role"].(string)
		for _, r := range roles {
			if role == r {
				return c.Next()
			}
		}
		return c.Status(fiber.StatusForbidden).JSON(map[string]interface{}{
			"error": "forbidden",
		})
	}
}
