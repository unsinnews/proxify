package watcher

import (
	"testing"

	"github.com/poixeai/proxify/infra/config"
)

func TestValidateRoutesRejectsReservedTopRoute(t *testing.T) {
	cfg := &config.RoutesConfig{
		Routes: []config.Route{
			{Path: "/api", Target: "https://example.com"},
		},
	}

	if err := validateRoutes(cfg); err == nil {
		t.Fatal("expected reserved route '/api' to be rejected")
	}
}

func TestValidateRoutesRejectsRouteWithoutLeadingSlash(t *testing.T) {
	cfg := &config.RoutesConfig{
		Routes: []config.Route{
			{Path: "openai", Target: "https://api.openai.com"},
		},
	}

	if err := validateRoutes(cfg); err == nil {
		t.Fatal("expected route without leading slash to be rejected")
	}
}

func TestValidateRoutesAcceptsNormalRoute(t *testing.T) {
	cfg := &config.RoutesConfig{
		Routes: []config.Route{
			{Path: "/openai", Target: "https://api.openai.com"},
		},
	}

	if err := validateRoutes(cfg); err != nil {
		t.Fatalf("expected normal route to pass validation, got error: %v", err)
	}
}
