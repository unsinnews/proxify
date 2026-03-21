package config

// defines the system-level routes that should not be proxied
var ReservedTopRoutes = map[string]bool{
	"api": true,
}
