package config

import (
	"encoding/json"
	"os"
	"strings"
)

type Route struct {
	Path        string `json:"path"`
	Target      string `json:"target"`
	Name        string `json:"name"`
	Description string `json:"description"`

	// model mapping (optional)
	ModelMap map[string]string `json:"model_map,omitempty"`
}

type RoutesConfig struct {
	Routes []Route `json:"routes"`
}

// LoadRoutesFromEnv loads routes configuration from ROUTES environment variable.
// Returns nil if ROUTES env var is not set or empty.
func LoadRoutesFromEnv() (*RoutesConfig, error) {
	routesJSON := strings.TrimSpace(os.Getenv("ROUTES"))
	if routesJSON == "" {
		return nil, nil
	}

	var cfg RoutesConfig
	if err := json.Unmarshal([]byte(routesJSON), &cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}

// LoadRoutesConfig loads routes configuration from a JSON file.
func LoadRoutesConfig(path string) (*RoutesConfig, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var cfg RoutesConfig
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}
