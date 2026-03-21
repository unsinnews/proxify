// for dynamic routes and frontend routes
package main

import (
	"embed"
	"io/fs"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/poixeai/proxify/controller"
	"github.com/poixeai/proxify/infra/config"
	"github.com/poixeai/proxify/infra/ctx"
	"github.com/poixeai/proxify/infra/logger"
	"github.com/poixeai/proxify/infra/response"
)

//go:embed web/dist/*
var embeddedFiles embed.FS

func MountFrontend(r *gin.Engine) {
	sub, err := fs.Sub(embeddedFiles, "web/dist")
	if err != nil {
		panic(err)
	}

	assetsFS, err := fs.Sub(sub, "assets")
	if err != nil {
		panic(err)
	}
	r.StaticFS("/assets", http.FS(assetsFS))

	h := http.FS(sub)
	r.StaticFileFS("/x.svg", "x.svg", h)
	r.StaticFileFS("/favicon.ico", "favicon.ico", h)
	r.StaticFileFS("/vite.svg", "vite.svg", h)

	r.NoRoute(func(c *gin.Context) {
		proxified := c.GetBool(ctx.Proxified)
		if proxified {
			// logger.Debugf("NoRoute: Matched dynamic route. Handing to ProxyHandler for %s", c.Request.URL.Path)
			controller.ProxyHandler(c)
			return
		}

		topRoute := c.GetString(ctx.TopRoute)
		if config.ReservedTopRoutes[topRoute] {
			logger.Warnf("404 Not Found: %s", topRoute)
			response.RespondSystemRouteNotFoundError(c)
			return
		}

		c.FileFromFS("/", h)
	})
}
