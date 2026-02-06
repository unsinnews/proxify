# ========================================
# Stage 1: Build Frontend with Node
# ========================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app/web

# Copy package files first for better caching
COPY web/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps

COPY web/ ./
RUN npm run build

# ========================================
# Stage 2: Build Backend with Go
# ========================================
FROM golang:1.24-alpine AS backend-builder

RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Copy go mod files first for better caching
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Copy backend source code
COPY . .

# Copy built frontend into embed directory
COPY --from=frontend-builder /app/web/dist ./web/dist

# Build binary with optimizations
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 go build -ldflags="-s -w" -o /app/bin/proxify .

# ========================================
# Stage 3: Minimal Runtime Image
# ========================================
FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

COPY --from=backend-builder /app/bin/proxify ./

ENV TZ=Asia/Shanghai

EXPOSE 7777

ENTRYPOINT ["./proxify"]
