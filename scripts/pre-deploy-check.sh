#!/bin/bash
# Pre-deployment validation script
# Run this before pushing to production to catch issues early

set -e

echo "🚀 Starting pre-deployment validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in project root directory. Please run from medusa project root."
    exit 1
fi

print_status "Checking project structure..."

# Install dependencies
print_status "Installing dependencies..."
yarn install --immutable

# Type checking and build
print_status "Running TypeScript build..."
if yarn build; then
    print_status "TypeScript build successful"
else
    print_error "TypeScript build failed"
    exit 1
fi

# Linting (non-blocking)
print_status "Running ESLint..."
if yarn lint; then
    print_status "ESLint passed"
else
    print_warning "ESLint found issues (non-blocking)"
fi

# Security check
print_status "Running security checks..."
if npm run security:check; then
    print_status "Security checks passed"
else
    print_error "Security checks failed"
    exit 1
fi

# Test Docker build
print_status "Testing Docker build..."
if docker build -t medusa-pre-deploy-test . --quiet; then
    print_status "Docker build successful"
    docker rmi medusa-pre-deploy-test > /dev/null 2>&1 || true
else
    print_error "Docker build failed"
    exit 1
fi

# Check environment variables template
print_status "Validating environment configuration..."
if [ -f "medusa-config.js" ]; then
    print_status "Medusa config found"
else
    print_warning "medusa-config.js not found"
fi

# Railway-specific checks
if [ -f "railway.json" ] || [ -f "railway.toml" ]; then
    print_status "Railway configuration found"
else
    print_warning "Railway configuration not found (using defaults)"
fi

echo ""
print_status "🎉 All pre-deployment checks passed!"
echo -e "${GREEN}Your project is ready for deployment to Railway${NC}"
echo ""
echo "To deploy to Railway:"
echo "  git add . && git commit -m 'Deploy: $(date +%Y-%m-%d_%H-%M-%S)' && git push"
