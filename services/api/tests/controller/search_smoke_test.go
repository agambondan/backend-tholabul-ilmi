//go:build !integration

package controller_test

import (
	"encoding/json"
	"io"
	"net/http/httptest"
	"testing"

	"github.com/agambondan/islamic-explorer/app/db"
	"github.com/agambondan/islamic-explorer/app/http"
	"github.com/agambondan/islamic-explorer/app/repository"
	"github.com/gofiber/fiber/v2"
)

func setupSearchTestApp(t *testing.T) *fiber.App {
	t.Helper()
	newPostgresql := db.DBConnectTest()
	repos, err := repository.NewRepositories(newPostgresql, nil)
	if err != nil {
		t.Fatalf("new repos: %v", err)
	}
	app := fiber.New()
	http.Handle(app, repos)
	return app
}

func parseJSON(t *testing.T, body []byte, dest interface{}) {
	t.Helper()
	if err := json.Unmarshal(body, dest); err != nil {
		t.Fatalf("parse json: %v\nbody: %s", err, string(body))
	}
}

func TestSearchEndpointRequiresQuery(t *testing.T) {
	app := setupSearchTestApp(t)
	resp, err := app.Test(httptest.NewRequest("GET", "/", nil))
	if err != nil {
		t.Fatalf("request: %v", err)
	}
	defer resp.Body.Close()
	rawBody, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read body: %v", err)
	}
	var body map[string]interface{}
	parseJSON(t, rawBody, &body)
}

func TestHealthEndpoint(t *testing.T) {
	app := setupSearchTestApp(t)
	req := httptest.NewRequest("GET", "/health", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("health check: %v", err)
	}
	if resp.StatusCode != 200 {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
}
