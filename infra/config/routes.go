package config

import (
	"encoding/json"
	"os"
	"strings"
)

const (
	DefaultRoutesConfigPath = "routes.json"
	RoutesConfigJSONEnv     = "ROUTES_CONFIG_JSON"
	RoutesConfigPathEnv     = "ROUTES_CONFIG_PATH"
)

type RoutesConfigSourceType string

const (
	RoutesConfigSourceFile RoutesConfigSourceType = "file"
	RoutesConfigSourceEnv  RoutesConfigSourceType = "env"
)

type RoutesConfigSource struct {
	Type    RoutesConfigSourceType
	Path    string
	EnvVar  string
	RawJSON string
}

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

func ResolveRoutesConfigSource() RoutesConfigSource {
	if rawJSON := strings.TrimSpace(os.Getenv(RoutesConfigJSONEnv)); rawJSON != "" {
		return RoutesConfigSource{
			Type:    RoutesConfigSourceEnv,
			EnvVar:  RoutesConfigJSONEnv,
			RawJSON: rawJSON,
		}
	}

	path := strings.TrimSpace(os.Getenv(RoutesConfigPathEnv))
	if path == "" {
		path = DefaultRoutesConfigPath
	}

	return RoutesConfigSource{
		Type:   RoutesConfigSourceFile,
		Path:   path,
		EnvVar: RoutesConfigPathEnv,
	}
}

func (s RoutesConfigSource) SupportsWatch() bool {
	return s.Type == RoutesConfigSourceFile && s.Path != ""
}

func (s RoutesConfigSource) Description() string {
	if s.Type == RoutesConfigSourceEnv {
		return "env var " + s.EnvVar
	}
	return "file " + s.Path
}

func LoadRoutesConfig(path string) (*RoutesConfig, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	return ParseRoutesConfig(data)
}

func LoadRoutesConfigFromSource(source RoutesConfigSource) (*RoutesConfig, error) {
	if source.Type == RoutesConfigSourceEnv {
		return ParseRoutesConfig([]byte(source.RawJSON))
	}

	return LoadRoutesConfig(source.Path)
}

func ParseRoutesConfig(data []byte) (*RoutesConfig, error) {
	var cfg RoutesConfig
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}
