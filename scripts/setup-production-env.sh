#!/bin/bash

# 🔐 Production Environment Setup Script
# This script helps set up environment variables for different deployment platforms

set -e

echo "🚀 Setting up production environment variables..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production template exists
if [ ! -f "production.env.template" ]; then
    echo -e "${RED}Error: production.env.template not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found production environment template${NC}"

# Function to validate required environment variables
validate_env_vars() {
    local missing_vars=()
    
    # Required variables
    local required_vars=(
        "JWT_SECRET"
        "COOKIE_SECRET" 
        "DATABASE_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing required environment variables:${NC}"
        printf '%s\n' "${missing_vars[@]}"
        return 1
    fi
    
    echo -e "${GREEN}✅ All required environment variables are set${NC}"
    return 0
}

# Function to setup Vercel environment variables
setup_vercel() {
    echo -e "${YELLOW}Setting up Vercel environment variables...${NC}"
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}Vercel CLI not installed. Installing...${NC}"
        npm install -g vercel
    fi
    
    # Backend environment variables
    echo "Setting up backend environment variables..."
    echo "$DATABASE_URL" | vercel env add DATABASE_URL production
    echo "$JWT_SECRET" | vercel env add JWT_SECRET production
    echo "$COOKIE_SECRET" | vercel env add COOKIE_SECRET production
    echo "production" | vercel env add NODE_ENV production
    echo "0.0.0.0" | vercel env add HOST production
    echo "3000" | vercel env add PORT production
    
    # Optional variables
    if [ -n "$REDIS_URL" ]; then
        echo "$REDIS_URL" | vercel env add REDIS_URL production
    fi
    
    if [ -n "$AWS_ACCESS_KEY_ID" ]; then
        echo "$AWS_ACCESS_KEY_ID" | vercel env add AWS_ACCESS_KEY_ID production
        echo "$AWS_SECRET_ACCESS_KEY" | vercel env add AWS_SECRET_ACCESS_KEY production
        echo "$S3_BUCKET" | vercel env add S3_BUCKET production
    fi
    
    if [ -n "$SENDGRID_API_KEY" ]; then
        echo "$SENDGRID_API_KEY" | vercel env add SENDGRID_API_KEY production
        echo "$SENDGRID_FROM_EMAIL" | vercel env add SENDGRID_FROM_EMAIL production
    fi
    
    echo -e "${GREEN}✅ Vercel environment variables configured${NC}"
}

# Function to setup Railway environment variables
setup_railway() {
    echo -e "${YELLOW}Setting up Railway environment variables...${NC}"
    
    if ! command -v railway &> /dev/null; then
        echo -e "${RED}Railway CLI not installed. Installing...${NC}"
        npm install -g @railway/cli
    fi
    
    # Set environment variables
    railway variables set DATABASE_URL="$DATABASE_URL"
    railway variables set JWT_SECRET="$JWT_SECRET"
    railway variables set COOKIE_SECRET="$COOKIE_SECRET"
    railway variables set NODE_ENV="production"
    railway variables set HOST="0.0.0.0"
    railway variables set PORT="3000"
    
    # Optional variables
    if [ -n "$REDIS_URL" ]; then
        railway variables set REDIS_URL="$REDIS_URL"
    fi
    
    if [ -n "$AWS_ACCESS_KEY_ID" ]; then
        railway variables set AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
        railway variables set AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
        railway variables set S3_BUCKET="$S3_BUCKET"
    fi
    
    if [ -n "$SENDGRID_API_KEY" ]; then
        railway variables set SENDGRID_API_KEY="$SENDGRID_API_KEY"
        railway variables set SENDGRID_FROM_EMAIL="$SENDGRID_FROM_EMAIL"
    fi
    
    echo -e "${GREEN}✅ Railway environment variables configured${NC}"
}

# Main execution
echo "Please choose your deployment platform:"
echo "1) Vercel"
echo "2) Railway"
echo "3) Both"
echo "4) Generate .env file only"

read -p "Enter your choice (1-4): " choice

# Load environment variables from template
source production.env.template

case $choice in
    1)
        setup_vercel
        ;;
    2)
        setup_railway
        ;;
    3)
        setup_vercel
        setup_railway
        ;;
    4)
        echo -e "${YELLOW}Generating .env.production file...${NC}"
        cp production.env.template .env.production
        echo -e "${GREEN}✅ .env.production file created${NC}"
        echo -e "${YELLOW}⚠️  Remember to update the values with your actual credentials${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Environment setup completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update environment variables with your actual values"
echo "2. Deploy your application"
echo "3. Test the deployment"
