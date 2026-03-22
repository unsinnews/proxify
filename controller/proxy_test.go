package controller

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	routectx "github.com/poixeai/proxify/infra/ctx"
)

func TestProxyHandlerStripsTrueClientIPAndFirstForwardedIP(t *testing.T) {
	t.Helper()
	gin.SetMode(gin.TestMode)

	var upstreamHeaders http.Header
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		upstreamHeaders = r.Header.Clone()
		_, _ = io.Copy(io.Discard, r.Body)
		w.WriteHeader(http.StatusNoContent)
	}))
	defer upstream.Close()

	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Request = httptest.NewRequest(http.MethodPost, "/openai/v1/chat/completions", http.NoBody)
	c.Request.Header.Set("Authorization", "Bearer test-token")
	c.Request.Header.Set("X-Forwarded-For", "198.51.100.7, 198.51.100.11, 198.51.100.12")
	c.Request.Header.Set("True-Client-Ip", "198.51.100.8")
	c.Request.Header.Set("X-Real-IP", "198.51.100.9")
	c.Request.Header.Set("CF-Connecting-IP", "198.51.100.10")
	c.Set(routectx.TargetEndpoint, upstream.URL)
	c.Set(routectx.SubPath, "/v1/chat/completions")

	ProxyHandler(c)

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("expected status %d, got %d", http.StatusNoContent, recorder.Code)
	}

	if got := upstreamHeaders.Get("Authorization"); got != "Bearer test-token" {
		t.Fatalf("expected Authorization to be preserved, got %q", got)
	}

	if got := upstreamHeaders.Get("X-Forwarded-For"); got != "198.51.100.11, 198.51.100.12" {
		t.Fatalf("expected X-Forwarded-For to drop the first IP, got %q", got)
	}

	if values := upstreamHeaders.Values("True-Client-Ip"); len(values) != 0 {
		t.Fatalf("expected True-Client-Ip to be stripped, got %v", values)
	}

	for _, header := range []string{
		"X-Real-IP",
		"CF-Connecting-IP",
	} {
		if values := upstreamHeaders.Values(header); len(values) != 0 {
			t.Fatalf("expected %s to be stripped, got %v", header, values)
		}
	}
}

func TestCopyRequestHeadersRemovesSingleForwardedIP(t *testing.T) {
	dst := http.Header{}
	src := http.Header{}
	src.Set("X-Forwarded-For", "198.51.100.7")

	copyRequestHeaders(dst, src)

	if values := dst.Values("X-Forwarded-For"); len(values) != 0 {
		t.Fatalf("expected X-Forwarded-For to be removed when only one IP is present, got %v", values)
	}
}
