package controller

import (
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/poixeai/proxify/infra/ctx"
	"github.com/poixeai/proxify/infra/logger"
	"github.com/poixeai/proxify/infra/response"
	"github.com/poixeai/proxify/infra/stream"
	"github.com/poixeai/proxify/util"
)

func ProxyHandler(c *gin.Context) {
	// build target URL
	targetEndpoint := c.GetString(ctx.TargetEndpoint)
	subPath := c.GetString(ctx.SubPath)
	targetURL := util.JoinURL(targetEndpoint, subPath)
	c.Set(ctx.TargetURL, targetURL)

	// construct new request
	ctx := c.Request.Context()
	req, err := http.NewRequestWithContext(ctx, c.Request.Method, targetURL, c.Request.Body)
	if err != nil {
		logger.Errorf("Failed to create new request: %v", err)
		response.RespondInternalError(c)
		return
	}

	// copy headers
	for k, v := range c.Request.Header {
		req.Header[k] = v
	}

	// strip sensitive headers (e.g. Cloudflare headers)
	stripHeaders := []string{
		"Cdn-Loop",
		"Cf-Connecting-Ip",
		"Cf-Ipcountry",
		"Cf-Ray",
		"Cf-Visitor",
		"True-Client-Ip",
	}
	for _, h := range stripHeaders {
		req.Header.Del(h)
	}

	// create client
	client := &http.Client{
		Timeout: 0, // no timeout, let ctx control it
		Transport: &http.Transport{
			Proxy:               http.ProxyFromEnvironment,
			DisableCompression:  true, // disable gzip, avoid stream cache
			MaxIdleConnsPerHost: 50,
		},
	}

	// do request
	resp, err := client.Do(req)
	if err != nil {
		logger.Errorf("Failed to do request to target: %v", err)
		response.RespondInternalError(c)
		return
	}
	defer resp.Body.Close()

	// copy response headers
	for k, v := range resp.Header {
		c.Writer.Header()[k] = v
	}

	// set status code
	c.Status(resp.StatusCode)

	// determine if response is a stream
	if isStreamResponse(resp) {
		// stream copy with optional smoothing
		if os.Getenv("STREAM_SMOOTHING_ENABLED") == "true" {
			stream.Smoothing(c, resp)
		} else {
			streamCopy(c, resp)
		}
	} else {
		io.Copy(c.Writer, resp.Body)
	}
}

// stream support SSE / chunked
func streamCopy(c *gin.Context, resp *http.Response) {
	ctx := c.Request.Context()
	buf := make([]byte, 4096)
	writer := c.Writer

	for {
		select {
		case <-ctx.Done():
			logger.Warnf("client disconnected, stop streaming")
			return
		default:
			n, err := resp.Body.Read(buf)
			if n > 0 {
				_, writeErr := writer.Write(buf[:n])
				if writeErr != nil {
					logger.Warnf("failed to write to client: %v", writeErr)
					return // client disconnected
				}
				writer.Flush() // keep flushing to client
			}
			if err != nil {
				if err == io.EOF {
					return
				}
				logger.Errorf("stream read error: %v", err)
				return
			}
		}
	}
}

// isStreamResponse checks if the response is a stream based on headers
func isStreamResponse(resp *http.Response) bool {
	ct := strings.ToLower(resp.Header.Get("Content-Type"))
	te := strings.ToLower(resp.Header.Get("Transfer-Encoding"))

	// clearly SSE
	if strings.Contains(ct, "text/event-stream") {
		return true
	}

	// HTTP/1.1 chunked
	if strings.Contains(te, "chunked") && !strings.Contains(ct, "application/json") {
		return true
	}

	// other known stream content types
	if strings.Contains(ct, "application/octet-stream") ||
		strings.Contains(ct, "application/x-ndjson") ||
		strings.Contains(ct, "application/stream+json") {
		return true
	}

	return false
}
