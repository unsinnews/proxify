package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/poixeai/proxify/infra/ctx"
	"github.com/poixeai/proxify/infra/watcher"
	"github.com/poixeai/proxify/util"
)

func Extractor() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		// Check for direct URL proxy: /https://example.com/path or /http://example.com/path
		if strings.HasPrefix(path, "/https://") || strings.HasPrefix(path, "/http://") {
			targetURL := path[1:] // remove leading "/"
			if query != "" {
				targetURL = targetURL + "?" + query
			}

			c.Set(ctx.TopRoute, "")
			c.Set(ctx.SubPath, "")
			c.Set(ctx.TargetEndpoint, targetURL)
			c.Set(ctx.Proxified, true)
			c.Next()
			return
		}

		top, sub := util.ExtractRoute(path)

		if query != "" {
			if sub == "" {
				sub = "?" + query
			} else {
				sub = sub + "?" + query
			}
		}

		// store top and sub path into context for later use
		c.Set(ctx.TopRoute, top)
		c.Set(ctx.SubPath, sub)

		// check if route exists in routes.json
		cfg := watcher.GetRoutes()
		found := false
		for i := range cfg.Routes {
			r := &cfg.Routes[i]

			if r.Path == "/"+top {
				found = true
				c.Set(ctx.TargetEndpoint, r.Target)

				// store matched route config
				c.Set(ctx.RouteConfig, r)

				break
			}
		}
		c.Set(ctx.Proxified, found)

		c.Next()
	}
}
