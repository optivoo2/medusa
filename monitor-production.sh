#!/bin/bash

# Medusa Production Monitoring Script
# This script provides monitoring and troubleshooting utilities

set -euo pipefail

# Configuration
COMPOSE_FILE="docker-compose.final.yml"
CONTAINER_NAME="medusa-production"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Helper functions
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

# Function to show service status
show_status() {
    echo -e "${BLUE}=== Service Status ===${NC}"
    docker-compose -f "$COMPOSE_FILE" ps
    echo
}

# Function to show resource usage
show_resources() {
    echo -e "${BLUE}=== Resource Usage ===${NC}"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}" \
        $(docker-compose -f "$COMPOSE_FILE" ps -q) 2>/dev/null || echo "No containers running"
    echo
}

# Function to show logs
show_logs() {
    local lines=${1:-50}
    echo -e "${BLUE}=== Recent Logs (${lines} lines) ===${NC}"
    docker-compose -f "$COMPOSE_FILE" logs --tail "$lines" medusa-app
    echo
}

# Function to run health checks
health_check() {
    echo -e "${BLUE}=== Health Checks ===${NC}"
    
    # Container health
    if docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}" | grep -q "$CONTAINER_NAME"; then
        log_success "Container is running"
    else
        log_error "Container is not running"
        return 1
    fi
    
    # Health endpoint
    local health_url="http://localhost:3001/health"
    if health_response=$(curl -s -f "$health_url" 2>/dev/null); then
        log_success "Health endpoint responding"
        echo "Response: $health_response"
    else
        log_error "Health endpoint not responding"
        return 1
    fi
    
    # Database connectivity (if available)
    if docker exec "$CONTAINER_NAME" node -e "
        const config = require('./medusa-config.js');
        console.log('Database URL configured:', !!config.projectConfig.databaseUrl);
    " 2>/dev/null; then
        log_success "Configuration loaded successfully"
    else
        log_warning "Could not verify configuration"
    fi
    
    echo
}

# Function to show environment info
show_environment() {
    echo -e "${BLUE}=== Environment Information ===${NC}"
    
    if docker exec "$CONTAINER_NAME" env | grep -E "^(NODE_ENV|PORT|DATABASE_URL|JWT_SECRET)" | head -10 2>/dev/null; then
        echo
    else
        log_warning "Could not retrieve environment variables"
    fi
}

# Function to restart services
restart_services() {
    log_info "Restarting services..."
    docker-compose -f "$COMPOSE_FILE" restart
    log_success "Services restarted"
}

# Function to show disk usage
show_disk_usage() {
    echo -e "${BLUE}=== Disk Usage ===${NC}"
    
    echo "Docker volumes:"
    docker volume ls --filter name=medusa
    echo
    
    echo "Log files:"
    docker exec "$CONTAINER_NAME" du -sh /app/logs 2>/dev/null || echo "No logs directory"
    echo
    
    echo "Upload files:"
    docker exec "$CONTAINER_NAME" du -sh /app/uploads 2>/dev/null || echo "No uploads directory"
    echo
}

# Function to backup data
backup_data() {
    local backup_dir="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    log_info "Creating backup in $backup_dir..."
    
    # Backup uploads
    if docker run --rm -v medusa-uploads:/source -v "$(pwd)/$backup_dir":/backup alpine tar czf /backup/uploads.tar.gz -C /source .; then
        log_success "Uploads backed up"
    fi
    
    # Backup logs
    if docker run --rm -v medusa-logs:/source -v "$(pwd)/$backup_dir":/backup alpine tar czf /backup/logs.tar.gz -C /source . 2>/dev/null; then
        log_success "Logs backed up"
    fi
    
    log_success "Backup completed: $backup_dir"
}

# Function to show help
show_help() {
    echo "Medusa Production Monitor"
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  status      - Show service status and resource usage"
    echo "  logs [N]    - Show last N lines of logs (default: 50)"
    echo "  health      - Run comprehensive health checks"
    echo "  restart     - Restart all services"
    echo "  backup      - Create backup of uploads and logs"
    echo "  env         - Show environment variables"
    echo "  disk        - Show disk usage"
    echo "  watch       - Watch logs in real-time"
    echo "  shell       - Open shell in container"
    echo "  help        - Show this help message"
}

# Main function
main() {
    local command=${1:-status}
    
    case "$command" in
        "status")
            show_status
            show_resources
            ;;
        "logs")
            show_logs "${2:-50}"
            ;;
        "health")
            health_check
            ;;
        "restart")
            restart_services
            ;;
        "backup")
            backup_data
            ;;
        "env")
            show_environment
            ;;
        "disk")
            show_disk_usage
            ;;
        "watch")
            log_info "Watching logs (Ctrl+C to exit)..."
            docker-compose -f "$COMPOSE_FILE" logs -f medusa-app
            ;;
        "shell")
            log_info "Opening shell in container..."
            docker exec -it "$CONTAINER_NAME" /bin/sh
            ;;
        "help")
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"