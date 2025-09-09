#!/bin/bash

# Monitoring script for Medusa Production
echo "📊 Medusa Production Monitoring Dashboard"
echo "========================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Container name
CONTAINER="medusa-store-production"

# Check container status
check_status() {
    echo -e "\n${BLUE}📦 Container Status:${NC}"
    
    if docker ps | grep -q $CONTAINER; then
        echo -e "${GREEN}✅ Container is running${NC}"
        
        # Get container details
        docker ps --filter "name=$CONTAINER" --format "table {{.Status}}\t{{.Ports}}"
    else
        echo -e "${RED}❌ Container is not running${NC}"
        
        # Check if container exists but stopped
        if docker ps -a | grep -q $CONTAINER; then
            echo -e "${YELLOW}⚠️ Container exists but is stopped${NC}"
            docker ps -a --filter "name=$CONTAINER" --format "table {{.Status}}\t{{.ExitCode}}"
        fi
    fi
}

# Check resource usage
check_resources() {
    echo -e "\n${BLUE}💻 Resource Usage:${NC}"
    
    if docker ps | grep -q $CONTAINER; then
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" $CONTAINER
    else
        echo "Container not running - no stats available"
    fi
}

# Check health endpoint
check_health() {
    echo -e "\n${BLUE}🏥 Health Check:${NC}"
    
    # Check local health endpoint
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health | grep -q "200"; then
        echo -e "${GREEN}✅ Health endpoint responding (200 OK)${NC}"
    else
        echo -e "${RED}❌ Health endpoint not responding${NC}"
    fi
    
    # Check public endpoints
    echo -e "\n${BLUE}🌐 Public Endpoints:${NC}"
    
    endpoints=(
        "https://store.optivoo.com"
        "https://admin.store.optivoo.com/app"
    )
    
    for endpoint in "${endpoints[@]}"; do
        response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 $endpoint)
        if [ "$response" = "200" ] || [ "$response" = "301" ] || [ "$response" = "302" ]; then
            echo -e "${GREEN}✅ $endpoint - OK ($response)${NC}"
        else
            echo -e "${RED}❌ $endpoint - Failed ($response)${NC}"
        fi
    done
}

# Show recent logs
show_logs() {
    echo -e "\n${BLUE}📋 Recent Logs (last 20 lines):${NC}"
    
    if docker ps | grep -q $CONTAINER; then
        docker logs --tail 20 $CONTAINER
    else
        echo "Container not running - no logs available"
    fi
}

# Check restart count
check_restarts() {
    echo -e "\n${BLUE}🔄 Restart Information:${NC}"
    
    if docker inspect $CONTAINER &>/dev/null; then
        restarts=$(docker inspect $CONTAINER --format='{{.RestartCount}}')
        last_start=$(docker inspect $CONTAINER --format='{{.State.StartedAt}}')
        
        if [ "$restarts" -eq 0 ]; then
            echo -e "${GREEN}✅ No restarts detected${NC}"
        else
            echo -e "${YELLOW}⚠️ Container has restarted $restarts times${NC}"
        fi
        echo "Last started: $last_start"
    else
        echo "Container does not exist"
    fi
}

# Main monitoring loop
main() {
    while true; do
        clear
        echo "📊 Medusa Production Monitoring Dashboard"
        echo "========================================="
        echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
        
        check_status
        check_resources
        check_health
        check_restarts
        
        echo -e "\n${YELLOW}Press Ctrl+C to exit, refreshing in 30 seconds...${NC}"
        
        # Show logs on first run or if container is unhealthy
        if [ "$1" = "--logs" ]; then
            show_logs
        fi
        
        sleep 30
    done
}

# Parse arguments
if [ "$1" = "--once" ]; then
    # Run once and exit
    check_status
    check_resources
    check_health
    check_restarts
    [ "$2" = "--logs" ] && show_logs
else
    # Run continuous monitoring
    main "$@"
fi
