#!/bin/bash

# Medusa Production Deployment Script
# This script handles the complete deployment process with proper validation

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# Configuration
COMPOSE_FILE="docker-compose.final.yml"
ENV_FILE=".env.production"
IMAGE_NAME="medusa-store:production"
CONTAINER_NAME="medusa-production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ SUCCESS:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}❌ ERROR:${NC} $1"
}

# Function to check if required files exist
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local missing_files=()
    
    [[ ! -f "Dockerfile" ]] && missing_files+=("Dockerfile")
    [[ ! -f "$COMPOSE_FILE" ]] && missing_files+=("$COMPOSE_FILE")
    [[ ! -f "medusa-config.js" ]] && missing_files+=("medusa-config.js")
    [[ ! -f "app.js" ]] && missing_files+=("app.js")
    [[ ! -f "package.json" ]] && missing_files+=("package.json")
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        log_error "Missing required files: ${missing_files[*]}"
        return 1
    fi
    
    log_success "All required files present"
}

# Function to validate environment file
validate_environment() {
    log_info "Validating environment configuration..."
    
    if [[ ! -f "$ENV_FILE" ]]; then
        log_warning "Environment file $ENV_FILE not found. Creating template..."
        cp "$ENV_FILE" "${ENV_FILE}.example" 2>/dev/null || true
        log_error "Please create $ENV_FILE with your production values"
        log_info "Use ${ENV_FILE}.example as a template"
        return 1
    fi
    
    # Check for required environment variables
    local required_vars=("DATABASE_URL" "JWT_SECRET" "COOKIE_SECRET")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$ENV_FILE" || grep -q "^${var}=$" "$ENV_FILE"; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing or empty required environment variables: ${missing_vars[*]}"
        log_info "Please set these variables in $ENV_FILE"
        return 1
    fi
    
    log_success "Environment configuration validated"
}

# Function to stop existing containers
stop_existing_containers() {
    log_info "Stopping existing containers..."
    
    # Stop containers using the compose file
    if docker-compose -f "$COMPOSE_FILE" ps -q | grep -q .; then
        docker-compose -f "$COMPOSE_FILE" down
        log_success "Existing containers stopped"
    else
        log_info "No existing containers to stop"
    fi
    
    # Clean up any orphaned containers
    if docker ps -a --filter "name=$CONTAINER_NAME" --format "table {{.Names}}" | grep -q "$CONTAINER_NAME"; then
        log_info "Removing orphaned container: $CONTAINER_NAME"
        docker rm -f "$CONTAINER_NAME" || true
    fi
}

# Function to build the Docker image
build_image() {
    log_info "Building Docker image..."
    
    # Clean build with no cache for production
    if docker build --no-cache -t "$IMAGE_NAME" .; then
        log_success "Docker image built successfully"
    else
        log_error "Docker build failed"
        return 1
    fi
}

# Function to start services
start_services() {
    log_info "Starting production services..."
    
    # Create external network if it doesn't exist
    docker network create traefik-net 2>/dev/null || true
    
    # Start services
    if docker-compose -f "$COMPOSE_FILE" up -d; then
        log_success "Services started successfully"
    else
        log_error "Failed to start services"
        return 1
    fi
}

# Function to wait for service health
wait_for_health() {
    log_info "Waiting for service to be healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose -f "$COMPOSE_FILE" ps medusa-app | grep -q "healthy"; then
            log_success "Service is healthy"
            return 0
        fi
        
        log_info "Attempt $attempt/$max_attempts - Service not ready yet..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Service failed to become healthy within timeout"
    return 1
}

# Function to run post-deployment tests
run_health_checks() {
    log_info "Running health checks..."
    
    # Check if container is running
    if ! docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}" | grep -q "$CONTAINER_NAME"; then
        log_error "Container is not running"
        return 1
    fi
    
    # Check health endpoint
    local health_url="http://localhost:3001/health"
    if curl -f -s "$health_url" > /dev/null; then
        log_success "Health endpoint responding"
    else
        log_error "Health endpoint not responding at $health_url"
        log_info "Container logs:"
        docker logs "$CONTAINER_NAME" --tail 20
        return 1
    fi
    
    log_success "All health checks passed"
}

# Function to show deployment status
show_status() {
    log_info "Deployment Status:"
    echo "==================="
    
    # Show running containers
    echo -e "${BLUE}Running Containers:${NC}"
    docker-compose -f "$COMPOSE_FILE" ps
    echo
    
    # Show service URLs
    echo -e "${BLUE}Service URLs:${NC}"
    echo "• Health Check: http://localhost:3001/health"
    echo "• Admin Dashboard: http://localhost:3001/app"
    echo "• Store API: http://localhost:3001/store"
    echo
    
    # Show logs command
    echo -e "${BLUE}View Logs:${NC}"
    echo "docker-compose -f $COMPOSE_FILE logs -f medusa-app"
}

# Function to handle cleanup on error
cleanup_on_error() {
    log_error "Deployment failed. Cleaning up..."
    docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || true
}

# Main deployment function
main() {
    log_info "Starting Medusa production deployment..."
    echo "========================================"
    
    # Set up error handling
    trap cleanup_on_error ERR
    
    # Run deployment steps
    check_prerequisites
    validate_environment
    stop_existing_containers
    build_image
    start_services
    wait_for_health
    run_health_checks
    
    # Show final status
    show_status
    
    log_success "🎉 Deployment completed successfully!"
    log_info "Your Medusa store is now running in production mode"
}

# Run main function
main "$@"