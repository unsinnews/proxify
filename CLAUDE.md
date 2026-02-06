# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Proxify is a self-hosted reverse proxy gateway for AI APIs, written in Go with a React frontend. It provides unified access to multiple AI providers (OpenAI, Claude, Gemini, etc.) through configurable route prefixes, with special optimizations for LLM streaming responses.

## Build Commands

### Full Build (Frontend + Backend)
```bash
./build.sh
```
This builds the frontend (Vite) and embeds it into the Go binary at `./bin/proxify`.

### Manual Build Steps
```bash
# Frontend
cd web && pnpm install && pnpm build && cd ..

# Backend
go mod tidy && go build -o ./bin/proxify .
```

### Run
```bash
./bin/proxify
```
The server runs on the port specified in `.env` (default: 7777).

### Frontend Development
```bash
cd web
pnpm dev      # Development server
pnpm lint     # ESLint
pnpm build    # Production build
```

## Architecture

### Request Flow
1. **Middleware chain** (`router/router.go`): Recover → CORS → GinRequestLogger → Extractor → Auth → ModelRewrite
2. **Route extraction** (`middleware/extractor.go`): Parses URL path to match against routes config
3. **Proxy handling** (`static.go` NoRoute): Unmatched routes that have a valid `routes.json` entry go to `controller.ProxyHandler`
4. **Streaming** (`controller/proxy.go`): Detects SSE/chunked responses and applies optional smoothing

### Key Components

**Backend (Go/Gin)**
- `main.go` - Entry point, loads config, initializes Gin router
- `static.go` - Embeds frontend (`web/dist`) and handles dynamic proxy routing via `NoRoute`
- `controller/proxy.go` - Core reverse proxy logic with stream detection
- `infra/stream/smoothing.go` - Flow control for LLM streaming (buffer management, heartbeat, tail acceleration)
- `infra/watcher/routes.go` - Routes config loading (env var priority) and hot-reloading via fsnotify
- `middleware/` - Auth (IP whitelist + token), CORS, request logging, model field rewriting

**Frontend (React/Vite/TypeScript)**
- `web/src/` - Standard React app with i18n, Tailwind CSS, Radix UI components

### Configuration Files
- `.env` - Server port, mode, auth settings, stream optimization flags, and optional `ROUTES` JSON config
- `routes.json` - Route definitions mapping path prefixes to upstream targets (fallback if `ROUTES` env var not set)

### Configuration Priority
Routes configuration is loaded in this order:
1. `ROUTES` environment variable (JSON string) - takes priority, disables file watching
2. `routes.json` file - hot-reloaded via fsnotify
3. Default config (single OpenAI route) - if neither above exists

### Stream Optimization
Controlled via environment variables:
- `STREAM_SMOOTHING_ENABLED=true` - Enables flow-controlled output with buffer management
- `STREAM_HEARTBEAT_ENABLED=true` - Sends periodic SSE heartbeats to prevent timeouts

### Dynamic Route Matching
Routes are matched by extracting the first path segment (e.g., `/openai/v1/chat` → matches route with `path: "/openai"`). The route's `target` becomes the upstream URL. Routes support `model_map` for request body rewriting. When using `routes.json` file, changes are hot-reloaded without restart.
