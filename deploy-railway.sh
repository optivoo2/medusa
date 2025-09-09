#!/bin/bash

# Railway Auto-Deploy Script for Medusa Production
echo "🚀 Starting Railway deployment for Medusa..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
fi

# Check if logged in
echo -e "${YELLOW}Checking Railway authentication...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${RED}Please login to Railway first:${NC}"
    echo "railway login"
    exit 1
fi

# Deploy to Railway
echo -e "${GREEN}Deploying to Railway...${NC}"
railway up --detach

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Railway deployment initiated successfully!${NC}"
    echo -e "${YELLOW}⏳ Deployment is in progress. Check Railway dashboard for status.${NC}"
    
    # Get service URL if available
    echo -e "${YELLOW}Getting service URL...${NC}"
    railway domain || echo "Domain not yet available"
    
    echo -e "${GREEN}🎉 Deployment complete!${NC}"
    echo -e "${YELLOW}Your Medusa API will be available at the Railway URL once deployment finishes.${NC}"
    echo -e "${YELLOW}Health check endpoint: https://your-app.railway.app/health${NC}"
else
    echo -e "${RED}❌ Railway deployment failed!${NC}"
    echo -e "${YELLOW}Check the logs with: railway logs${NC}"
    exit 1
fi