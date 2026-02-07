package config

import "testing"

func TestLoadAuthConfigSingleIPv4Uses32Mask(t *testing.T) {
	t.Setenv("AUTH_IP_WHITELIST", "127.0.0.1")

	cfg, err := LoadAuthConfig()
	if err != nil {
		t.Fatalf("LoadAuthConfig returned error: %v", err)
	}
	if len(cfg.IPNets) != 1 {
		t.Fatalf("expected 1 parsed network, got %d", len(cfg.IPNets))
	}

	ones, bits := cfg.IPNets[0].Mask.Size()
	if ones != 32 || bits != 32 {
		t.Fatalf("expected IPv4 host mask /32, got /%d (%d bits)", ones, bits)
	}
}

func TestLoadAuthConfigSingleIPv6Uses128Mask(t *testing.T) {
	t.Setenv("AUTH_IP_WHITELIST", "::1")

	cfg, err := LoadAuthConfig()
	if err != nil {
		t.Fatalf("LoadAuthConfig returned error: %v", err)
	}
	if len(cfg.IPNets) != 1 {
		t.Fatalf("expected 1 parsed network, got %d", len(cfg.IPNets))
	}

	ones, bits := cfg.IPNets[0].Mask.Size()
	if ones != 128 || bits != 128 {
		t.Fatalf("expected IPv6 host mask /128, got /%d (%d bits)", ones, bits)
	}
}
