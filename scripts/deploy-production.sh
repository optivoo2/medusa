#!/bin/bash
set -e

# Deployment script for Medusa Production
echo "🚀 Starting Medusa Production Deployment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for required environment variables
check_env_vars() {
    echo "🔍 Checking environment variables..."
    
    required_vars=("DATABASE_URL" "JWT_SECRET" "COOKIE_SECRET" "ADMIN_JWT_SECRET")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=($var)
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required environment variables:${NC}"
        printf '%s\n' "${missing_vars[@]}"
        echo -e "${YELLOW}Please set these in your .env file or environment${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All required environment variables are set${NC}"
}

# Build Docker image with caching
build_image() {
    echo "🏗️ Building Docker image with BuildKit..."
    
    # Enable BuildKit for better caching
    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1
    
    # Build the image
    docker-compose -f docker-compose.production.yml build --progress=plain
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Docker image built successfully${NC}"
    else
        echo -e "${RED}❌ Docker build failed${NC}"
        exit 1
    fi
}

# Stop existing container
stop_container() {
    echo "🛑 Stopping existing container..."
    
    if docker ps | grep -q medusa-store-production; then
        docker-compose -f docker-compose.production.yml down
        echo -e "${GREEN}✅ Existing container stopped${NC}"
    else
        echo "ℹ️ No existing container running"
    fi
}

# Start new container
start_container() {
    echo "🚀 Starting new container..."
    
    docker-compose -f docker-compose.production.yml up -d
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Container started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start container${NC}"
        exit 1
    fi
}

# Check container health
check_health() {
    echo "🏥 Checking container health..."
    
    # Wait for container to be healthy
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker ps | grep -q "healthy.*medusa-store-production"; then
            echo -e "${GREEN}✅ Container is healthy${NC}"
            return 0
        fi
        
        echo "⏳ Waiting for container to be healthy... ($attempt/$max_attempts)"
        sleep 10
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ Container health check failed${NC}"
    echo "📋 Container logs:"
    docker logs --tail 50 medusa-store-production
    exit 1
}

# Main deployment flow
main() {
    echo "======================================"
    echo "   Medusa Production Deployment"
    echo "======================================"
    echo ""
    
    # Load environment variables from .env file if it exists
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Run deployment steps
    check_env_vars
    build_image
    stop_container
    start_container
    check_health
    
    echo ""
    echo -e "${GREEN}======================================"
    echo -e "   ✅ Deployment Successful!"
    echo -e "======================================${NC}"
    echo ""
    echo "📍 Access your store at: https://store.optivoo.com"
    echo "📍 Admin panel at: https://admin.store.optivoo.com/app"
    echo ""
    echo "📊 Monitor logs with: docker logs -f medusa-store-production"
    echo "📊 Check status with: docker ps | grep medusa-store-production"
}

# Run the deployment
main "$@"
