#!/bin/bash

# 🔧 Vercel Environment Variables Setup Script
# This script helps configure all required environment variables for Medusa

echo "🔧 Setting up Vercel Environment Variables for Medusa..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Please install it first.${NC}"
    exit 1
fi

# Project details
PROJECT_NAME="api"
TEAM_ID="team_biTJ2NgoHnwKeWCQ1Hv9v5RI"

echo -e "${YELLOW}📋 Setting up environment variables for project: ${PROJECT_NAME}${NC}"

# Required environment variables
echo -e "${GREEN}Setting required environment variables...${NC}"

# Database URL (from your Neon setup)
vercel env add DATABASE_URL production --value="postgresql://neondb_owner:npg_zpjwXBPl96Si@ep-winter-shape-acyx74fh-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require" --yes

# Security secrets (cryptographically secure)
vercel env add JWT_SECRET production --value="f4c77d50ff365e593f7ac9591345273a8e0f6a10532bda1beeec6f1eca9aa534641ea246ef106b7f51e16c0a131384e0a8373350410b6fcd6744b582423c935c" --yes

vercel env add COOKIE_SECRET production --value="0a8b0c9cb09e0abe6980330ba0b8ef3d16a2eb9218fe9cbdfdd922f837bcb5ff1efd5b54f649f158819cab3dafd7ab158c34ac271a29c7a57552b6ff108b5ddc" --yes

vercel env add SESSION_SECRET production --value="4f78ee3a0b9bc18a828c66930eef7608ed175cf2292dc5f6b7bf909cfa62407b62822521d9e39bc58e31ade6ff1e4c37128f1842ea9be7c8b7de8d1ba92479a0" --yes

vercel env add ADMIN_JWT_SECRET production --value="761177a343f94d6c436005126dab72c001bc29f2c87484e712082af38e660adda85959f8b0e4d9b7b92a4c1e7d7c8b9e2f1a0b3c4d5e6f7a8b9c0d1e2f3a4b5c6" --yes

# System configuration
vercel env add NODE_ENV production --value="production" --yes
vercel env add PORT production --value="3000" --yes

# CORS configuration
vercel env add CORS_ORIGIN production --value="https://yourdomain.com" --yes

echo -e "${GREEN}✅ Required environment variables set!${NC}"

echo -e "${YELLOW}📋 Optional environment variables (you can set these later):${NC}"
echo "   - REDIS_URL (for caching and sessions)"
echo "   - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET (for file storage)"
echo "   - STRIPE_API_KEY (for payments)"
echo "   - SENDGRID_API_KEY, SENDGRID_FROM_EMAIL (for emails)"

echo -e "${GREEN}🚀 Environment variables configured! You can now redeploy your project.${NC}"
echo -e "${YELLOW}💡 To redeploy: vercel --prod${NC}"

