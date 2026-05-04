package middlewares

import (
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/spf13/viper"
)

func TestCorsAllowsDefaultDockerFrontendOrigin(t *testing.T) {
	viper.Reset()
	t.Cleanup(viper.Reset)

	app := fiber.New()
	app.Use(Cors())
	app.Get("/api/v1/surah", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(fiber.MethodOptions, "/api/v1/surah", nil)
	req.Header.Set(fiber.HeaderOrigin, "http://localhost:23000")
	req.Header.Set(fiber.HeaderAccessControlRequestMethod, fiber.MethodGet)
	req.Header.Set(fiber.HeaderAccessControlRequestHeaders, "Authorization,Content-Type")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("preflight request failed: %v", err)
	}
	if resp.StatusCode != fiber.StatusNoContent {
		t.Fatalf("expected status %d, got %d", fiber.StatusNoContent, resp.StatusCode)
	}
	if got := resp.Header.Get(fiber.HeaderAccessControlAllowOrigin); got != "http://localhost:23000" {
		t.Fatalf("expected allow origin http://localhost:23000, got %q", got)
	}
	if got := resp.Header.Get(fiber.HeaderAccessControlAllowCredentials); got != "true" {
		t.Fatalf("expected allow credentials true, got %q", got)
	}

	allowMethods := resp.Header.Get(fiber.HeaderAccessControlAllowMethods)
	for _, method := range []string{fiber.MethodGet, fiber.MethodOptions} {
		if !strings.Contains(allowMethods, method) {
			t.Fatalf("expected allow methods %q to contain %q", allowMethods, method)
		}
	}

	allowHeaders := resp.Header.Get(fiber.HeaderAccessControlAllowHeaders)
	for _, header := range []string{"Authorization", "Content-Type"} {
		if !strings.Contains(allowHeaders, header) {
			t.Fatalf("expected allow headers %q to contain %q", allowHeaders, header)
		}
	}
}
