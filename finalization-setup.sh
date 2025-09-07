#!/bin/bash

# 🚀 MEDUSA E-COMMERCE FINALIZATION SETUP SCRIPT
# This script helps complete the final deployment steps

set -e

echo "🚀 Starting Medusa E-commerce Finalization Setup..."
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}📋 $1${NC}"
}

# Check if running in correct directory
if [ ! -f "medusa-config.js" ]; then
    print_error "Please run this script from the Medusa project root directory"
    exit 1
fi

print_info "Step 1: Environment Variables Setup"
echo "=================================="

# Check if production.env.example exists
if [ -f "production.env.example" ]; then
    print_success "Found production environment template"
    
    # Copy to .env.production if it doesn't exist
    if [ ! -f ".env.production" ]; then
        cp production.env.example .env.production
        print_success "Created .env.production from template"
        print_warning "Please edit .env.production with your actual values!"
    else
        print_warning ".env.production already exists"
    fi
else
    print_error "production.env.example not found"
    exit 1
fi

print_info "Step 2: Install Dependencies"
echo "=========================="

if [ -f "yarn.lock" ]; then
    print_info "Installing dependencies with Yarn..."
    yarn install
elif [ -f "package-lock.json" ]; then
    print_info "Installing dependencies with NPM..."
    npm install
else
    print_error "No lock file found. Please run yarn install or npm install first"
    exit 1
fi

print_success "Dependencies installed"

print_info "Step 3: Build the Project"
echo "======================="

print_info "Building Medusa packages..."
npm run build

print_success "Project built successfully"

print_info "Step 4: Database Setup"
echo "===================="

print_warning "Before running database migrations, ensure your DATABASE_URL is set in .env.production"
echo ""
echo "To run database migrations manually:"
echo "  export NODE_ENV=production"
echo "  source .env.production"
echo "  npx medusa db:migrate"
echo ""

# Ask if user wants to run migrations now
read -p "Do you want to run database migrations now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Running database migrations..."
    export NODE_ENV=production
    if [ -f ".env.production" ]; then
        set -a
        source .env.production
        set +a
    fi
    npx medusa db:migrate
    print_success "Database migrations completed"
else
    print_warning "Skipping database migrations. Remember to run them before starting the server!"
fi

print_info "Step 5: Store Configuration"
echo "========================"

print_warning "After database setup, you can configure your store by:"
echo "1. Setting up environment variables in .env.production"
echo "2. Running the store setup script: npm run setup:store"
echo "3. Or using the admin dashboard at: /app"

print_info "Step 6: Security Check"
echo "===================="

print_info "Running security validation..."
npm run security:check

print_info "Step 7: Deployment Options"
echo "========================"

echo ""
print_success "🎉 Finalization Setup Complete!"
echo ""
print_info "Next Steps:"
echo "1. Edit .env.production with your actual values"
echo "2. Deploy to your chosen platform:"
echo "   - Vercel: npm run deploy:vercel"
echo "   - Railway: railway deploy"
echo "   - Docker: docker build -t medusa-app ."
echo ""
print_info "3. Configure your storefront:"
echo "   cd my-storefront"
echo "   npm run build"
echo "   npm run deploy"
echo ""
print_info "4. Set up admin access:"
echo "   Visit: https://your-domain.com/app"
echo "   Create admin user account"
echo ""
print_success "Your Medusa e-commerce platform is ready for production!"

