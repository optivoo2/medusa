#!/bin/bash

# 🚀 AUTOMATIC VERCEL ENVIRONMENT VARIABLES SETUP
# This script automatically configures all environment variables for both projects

echo "🚀 Setting up Vercel Environment Variables..."

# Backend Environment Variables
echo "📦 Configuring Backend Project (medusa-backend)..."

# Database URL
echo "postgresql://neondb_owner:npg_zpjwXBPl96Si@ep-winter-shape-acyx74fh-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require" | vercel env add DATABASE_URL production

# Security Secrets
echo "010d5f52bf21f8c70f0d998bba0d76cc8cbf31606439f947f94a0149d0dce853" | vercel env add JWT_SECRET production
echo "5d761d87b63e237eb97246e49db1303fce9482e3740985810bb34a3fe70c6dba" | vercel env add COOKIE_SECRET production

# Server Configuration
echo "production" | vercel env add NODE_ENV production
echo "0.0.0.0" | vercel env add HOST production
echo "3000" | vercel env add PORT production

# Store Configuration
echo "Medusa Production Store" | vercel env add STORE_NAME production

# CORS Configuration
echo "https://medusa-storefront-arthurs-projects-129b2cca.vercel.app" | vercel env add CORS_ORIGIN production

echo "✅ Backend environment variables configured!"

# Storefront Environment Variables
echo "🛍️ Configuring Storefront Project (medusa-storefront)..."

cd my-storefront

# Medusa API URL (will be updated after backend deployment)
echo "https://medusa-backend-arthurs-projects-129b2cca.vercel.app" | vercel env add NEXT_PUBLIC_MEDUSA_BACKEND_URL production

# Publishable Key (placeholder - needs to be generated from Medusa admin)
echo "pk_placeholder_generate_from_admin" | vercel env add NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY production

# Environment
echo "production" | vercel env add NODE_ENV production

cd ..

echo "✅ Storefront environment variables configured!"
echo "🎉 All environment variables set successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Deploy backend: vercel --prod"
echo "2. Update storefront API URL with actual backend URL"
echo "3. Generate publishable key from Medusa admin"
echo "4. Deploy storefront: cd my-storefront && vercel --prod"
