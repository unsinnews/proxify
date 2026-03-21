package config

import "testing"

func TestResolveRoutesConfigSourcePrefersJSONEnv(t *testing.T) {
	t.Setenv(RoutesConfigJSONEnv, `{"routes":[{"name":"OpenAI","path":"/openai","target":"https://api.openai.com"}]}`)
	t.Setenv(RoutesConfigPathEnv, "/tmp/routes.json")

	source := ResolveRoutesConfigSource()
	if source.Type != RoutesConfigSourceEnv {
		t.Fatalf("expected env source, got %q", source.Type)
	}
	if source.EnvVar != RoutesConfigJSONEnv {
		t.Fatalf("expected env var %q, got %q", RoutesConfigJSONEnv, source.EnvVar)
	}
	if source.SupportsWatch() {
		t.Fatal("expected env source to disable watch")
	}
}

func TestResolveRoutesConfigSourceUsesPathEnv(t *testing.T) {
	t.Setenv(RoutesConfigJSONEnv, "")
	t.Setenv(RoutesConfigPathEnv, "/tmp/custom-routes.json")

	source := ResolveRoutesConfigSource()
	if source.Type != RoutesConfigSourceFile {
		t.Fatalf("expected file source, got %q", source.Type)
	}
	if source.Path != "/tmp/custom-routes.json" {
		t.Fatalf("expected custom path, got %q", source.Path)
	}
	if !source.SupportsWatch() {
		t.Fatal("expected file source to support watch")
	}
}

func TestResolveRoutesConfigSourceDefaultsPath(t *testing.T) {
	t.Setenv(RoutesConfigJSONEnv, "")
	t.Setenv(RoutesConfigPathEnv, "")

	source := ResolveRoutesConfigSource()
	if source.Type != RoutesConfigSourceFile {
		t.Fatalf("expected file source, got %q", source.Type)
	}
	if source.Path != DefaultRoutesConfigPath {
		t.Fatalf("expected default path %q, got %q", DefaultRoutesConfigPath, source.Path)
	}
}

func TestLoadRoutesConfigFromSourceEnv(t *testing.T) {
	source := RoutesConfigSource{
		Type:    RoutesConfigSourceEnv,
		EnvVar:  RoutesConfigJSONEnv,
		RawJSON: `{"routes":[{"name":"OpenAI","path":"/openai","target":"https://api.openai.com"}]}`,
	}

	cfg, err := LoadRoutesConfigFromSource(source)
	if err != nil {
		t.Fatalf("expected env config to load, got error: %v", err)
	}
	if len(cfg.Routes) != 1 {
		t.Fatalf("expected 1 route, got %d", len(cfg.Routes))
	}
	if cfg.Routes[0].Path != "/openai" {
		t.Fatalf("expected /openai, got %q", cfg.Routes[0].Path)
	}
}
