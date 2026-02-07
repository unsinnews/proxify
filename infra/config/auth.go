package config

import (
	"fmt"
	"net"
	"os"
	"strings"
)

type AuthConfig struct {
	IPWhitelistRaw string
	IPNets         []*net.IPNet

	TokenHeader string
	TokenKey    string
}

func LoadAuthConfig() (*AuthConfig, error) {
	cfg := &AuthConfig{
		IPWhitelistRaw: strings.TrimSpace(os.Getenv("AUTH_IP_WHITELIST")),
		TokenHeader:    strings.TrimSpace(os.Getenv("AUTH_TOKEN_HEADER")),
		TokenKey:       strings.TrimSpace(os.Getenv("AUTH_TOKEN_KEY")),
	}

	// parse ip whitelist
	if cfg.IPWhitelistRaw != "" {
		items := strings.Split(cfg.IPWhitelistRaw, ",")
		for _, item := range items {
			item = strings.TrimSpace(item)
			if item == "" {
				continue
			}

			// single IP -> host mask (/32 for IPv4, /128 for IPv6)
			if !strings.Contains(item, "/") {
				ip := net.ParseIP(item)
				if ip == nil {
					return nil, fmt.Errorf("invalid ip: %s", item)
				}
				if ip.To4() != nil {
					item += "/32"
				} else {
					item += "/128"
				}
			}

			_, ipNet, err := net.ParseCIDR(item)
			if err != nil {
				return nil, err
			}
			cfg.IPNets = append(cfg.IPNets, ipNet)
		}
	}

	return cfg, nil
}
