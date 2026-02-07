package util

import "testing"

func TestExtractRoute(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		path         string
		wantRoute    string
		wantSubRoute string
	}{
		{
			name:         "path with subroute",
			path:         "/openai/v1/chat",
			wantRoute:    "openai",
			wantSubRoute: "/v1/chat",
		},
		{
			name:         "path without leading slash",
			path:         "openai/v1",
			wantRoute:    "openai",
			wantSubRoute: "/v1",
		},
		{
			name:         "path with only route",
			path:         "/openai",
			wantRoute:    "openai",
			wantSubRoute: "",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			route, subRoute := ExtractRoute(tt.path)
			if route != tt.wantRoute || subRoute != tt.wantSubRoute {
				t.Fatalf("ExtractRoute(%q) = (%q, %q), want (%q, %q)", tt.path, route, subRoute, tt.wantRoute, tt.wantSubRoute)
			}
		})
	}
}

func TestJoinURL(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		base     string
		sub      string
		expected string
	}{
		{
			name:     "joins with single slash",
			base:     "https://api.example.com/",
			sub:      "/v1/chat",
			expected: "https://api.example.com/v1/chat",
		},
		{
			name:     "joins without trailing slash",
			base:     "https://api.example.com",
			sub:      "v1/chat",
			expected: "https://api.example.com/v1/chat",
		},
		{
			name:     "empty subpath returns base",
			base:     "https://api.example.com/",
			sub:      "",
			expected: "https://api.example.com",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			if got := JoinURL(tt.base, tt.sub); got != tt.expected {
				t.Fatalf("JoinURL(%q, %q) = %q, want %q", tt.base, tt.sub, got, tt.expected)
			}
		})
	}
}
