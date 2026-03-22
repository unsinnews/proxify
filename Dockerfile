# syntax=docker/dockerfile:1.7

# ========================================
# Stage 1: Build Frontend with Node
# ========================================
FROM --platform=$BUILDPLATFORM node:22-alpine3.22 AS frontend-deps

WORKDIR /app/web

COPY web/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --no-audit --prefer-offline

FROM frontend-deps AS frontend-builder

COPY web/ ./
RUN npm run build

# ========================================
# Stage 2: Build Backend with Go
# ========================================
FROM --platform=$BUILDPLATFORM golang:1.24-alpine3.22 AS backend-builder

ARG TARGETOS
ARG TARGETARCH

WORKDIR /app

COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

COPY . .
COPY --from=frontend-builder /app/web/dist ./web/dist

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    TARGET_OS="${TARGETOS:-$(go env GOOS)}" && \
    TARGET_ARCH="${TARGETARCH:-$(go env GOARCH)}" && \
    CGO_ENABLED=0 GOOS="$TARGET_OS" GOARCH="$TARGET_ARCH" \
    go build -trimpath -o /app/bin/proxify .

# ========================================
# Stage 3: Runtime dependencies
# ========================================
FROM --platform=$BUILDPLATFORM alpine:3.20 AS runtime-deps

RUN apk add --no-cache ca-certificates tzdata

# ========================================
# Stage 4: Minimal Runtime Image
# ========================================
FROM alpine:3.20

WORKDIR /app

COPY --from=runtime-deps /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=runtime-deps /usr/share/zoneinfo/Asia/Shanghai /usr/share/zoneinfo/Asia/Shanghai
COPY --from=backend-builder /app/bin/proxify ./

ENV TZ=Asia/Shanghai

EXPOSE 8080

ENTRYPOINT ["./proxify"]
