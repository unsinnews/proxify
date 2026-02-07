package watcher

import (
	"errors"
	"fmt"
	"os"
	"strings"
	"sync/atomic"

	"github.com/fsnotify/fsnotify"
	"github.com/poixeai/proxify/infra/config"
	"github.com/poixeai/proxify/infra/logger"
)

var ConfigValue atomic.Value // global config value
var usingEnvConfig bool      // track if config is from env var

func WatchJSON(file string) {
	// Skip file watching if using env var config
	if usingEnvConfig {
		logger.Info("[routes] using ROUTES env var, file watching disabled")
		return
	}

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		logger.Errorf("failed to create fsnotify watcher: %v", err)
		return
	}

	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				if event.Op&(fsnotify.Write|fsnotify.Create) != 0 {
					cfg, err := config.LoadRoutesConfig(file)
					if err != nil {
						logger.Errorf("[routes.json] file reload failed: %v", err)
						continue
					}

					if err := validateRoutes(cfg); err != nil {
						logger.Errorf("[routes.json] validation failed: %v", err)
						continue
					}

					ConfigValue.Store(cfg)
					logger.Info("[routes.json] file reloaded successfully.")
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				logger.Errorf("[routes.json] watch error: %v", err)
			}
		}
	}()

	if err := watcher.Add(file); err != nil {
		logger.Warnf("watcher: file [%s] not found, skip watching", file)
	}
}

func InitRoutesWatcher() error {
	const file = "routes.json"

	// Priority 1: Try to load from ROUTES environment variable
	cfg, err := config.LoadRoutesFromEnv()
	if err != nil {
		logger.Errorf("failed to parse ROUTES env var: %v", err)
		return err
	}

	if cfg != nil {
		usingEnvConfig = true
		logger.Infof("[ROUTES env] loaded successfully (%d routes)", len(cfg.Routes))
	} else {
		// Priority 2: Try to load from routes.json file
		cfg, err = config.LoadRoutesConfig(file)
		if err != nil {
			if os.IsNotExist(err) {
				// if file not found, load default config
				logger.Warnf("[routes.json] not found, loading default config.")
				cfg = &config.RoutesConfig{
					Routes: []config.Route{
						// default routes, add more
						{Path: "/openai", Target: "https://api.openai.com"},
					},
				}
			} else {
				logger.Errorf("failed to load routes config: %v", err)
				return err
			}
		} else {
			logger.Infof("[routes.json] loaded successfully (%d routes)", len(cfg.Routes))
		}
	}

	// validate routes
	if err := validateRoutes(cfg); err != nil {
		logger.Errorf("route validation failed: %v", err)
		return err
	}

	ConfigValue.Store(cfg)
	WatchJSON(file)

	return nil
}

func GetRoutes() *config.RoutesConfig {
	v := ConfigValue.Load()
	if v == nil {
		return &config.RoutesConfig{}
	}
	return v.(*config.RoutesConfig)
}

func validateRoutes(cfg *config.RoutesConfig) error {
	seen := make(map[string]bool)
	for _, r := range cfg.Routes {
		path := strings.TrimSpace(r.Path)

		// 1. check empty
		if path == "" {
			return errors.New("invalid route: empty path is not allowed")
		}

		// 2. route path must be like "/openai"
		if !strings.HasPrefix(path, "/") {
			return fmt.Errorf("invalid route: path '%s' must start with '/'", path)
		}
		if strings.Contains(path, "?") {
			return fmt.Errorf("invalid route: path '%s' must not contain query string", path)
		}

		top := strings.TrimPrefix(path, "/")
		if idx := strings.Index(top, "/"); idx >= 0 {
			top = top[:idx]
		}
		if top == "" {
			return errors.New("invalid route: top-level path segment is required")
		}

		// 3. check reserved top-level routes like /api
		if config.ReservedTopRoutes[top] {
			return fmt.Errorf("invalid route: path '%s' is reserved by system", path)
		}

		// 4. check duplicate
		if seen[path] {
			return fmt.Errorf("invalid route: duplicate path '%s'", path)
		}
		seen[path] = true
	}
	return nil
}
