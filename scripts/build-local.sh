#!/bin/bash
set -e

# Local build script for testing before deployment
echo "🔨 Building Medusa locally..."

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Set Node options for build
export NODE_OPTIONS="--max-old-space-size=4096"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf packages/*/dist
rm -rf packages/*/build
rm -rf .turbo

# Install dependencies
echo "📦 Installing dependencies..."
yarn install --immutable

# Build with optimized settings
echo "🏗️ Building packages..."
yarn build --concurrency=2 --no-daemon

echo -e "${GREEN}✅ Local build completed successfully${NC}"
echo ""
echo -e "${YELLOW}To deploy to production, run: ./scripts/deploy-production.sh${NC}"
