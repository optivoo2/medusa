#!/bin/bash

# Quick deployment and test script for store.optivoo.com

set -e

echo "🚀 Starting quick deployment for store.optivoo.com..."

# Start the service
echo "Starting Medusa service..."
docker-compose -f docker-compose.final.yml up -d medusa-app

# Wait for container to be ready
echo "Waiting for container to start..."
sleep 30

# Check container status
echo "Checking container status..."
docker ps | grep medusa || echo "Container not running"

# Check logs
echo "Recent logs:"
docker logs medusa-production --tail 10

# Test local endpoint
echo "Testing local health endpoint..."
curl -s http://localhost:3001/health 2>/dev/null || echo "Local endpoint not responding"

# Test domain endpoint
echo "Testing domain health endpoint..."
curl -s -H "Host: store.optivoo.com" http://localhost:3001/health 2>/dev/null || echo "Domain endpoint not responding via local"

echo "✅ Deployment check complete"