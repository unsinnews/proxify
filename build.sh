#!/usr/bin/env bash
set -e  # Exit immediately if a command exits with a non-zero status
set -o pipefail

# === Project Path Definitions ===
ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
WEB_DIR="$ROOT_DIR/web"
OUTPUT_DIR="$ROOT_DIR/bin"
BINARY_NAME="proxify" # You can change this to your project name

# === Color Definitions ===
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Proxify Build Process...${NC}"

# === Step 1: Build Frontend ===
echo -e "${GREEN}📦 [1/3] Building Frontend (Vite Build)...${NC}"
cd "$WEB_DIR"

# Check Node.js Environment
if ! command -v npm >/dev/null 2>&1; then
  echo -e "${RED}❌ npm not found. Please install Node.js environment.${NC}"
  exit 1
fi

npm install --legacy-peer-deps >/dev/null 2>&1
npm run build

# Check dist folder
if [ ! -d "dist" ]; then
  echo -e "${RED}❌ Frontend build failed: 'web/dist' directory not found.${NC}"
  exit 1
fi

cd "$ROOT_DIR"

# === Step 2: Clean old builds ===
echo -e "${GREEN}🧹 [2/3] Cleaning previous build artifacts...${NC}"
mkdir -p "$OUTPUT_DIR"
rm -f "$OUTPUT_DIR/$BINARY_NAME"

# === Step 3: Build Backend (Embed Frontend) ===
echo -e "${GREEN}⚙️ [3/3] Building Backend (Go Build)...${NC}"

if ! command -v go >/dev/null 2>&1; then
  echo -e "${RED}❌ Go not found. Please install Go toolchain.${NC}"
  exit 1
fi

go mod tidy
go build -o "$OUTPUT_DIR/$BINARY_NAME" .

# === Build Completed ===
echo -e ""
echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo -e ""
echo -e "Executable generated at: ${YELLOW}$OUTPUT_DIR/$BINARY_NAME${NC}"
echo -e ""
echo -e "👉 To start the project, run the following command:"
echo -e "${GREEN}   ./bin/$BINARY_NAME${NC}"
echo -e ""