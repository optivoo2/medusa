# 🚀 COMPREHENSIVE MEDUSA V2 PRODUCTION DEPLOYMENT PLAN

*Complete Step-by-Step Guide for Production Deployment with All Integrated Components*

---

## 📋 OVERVIEW

This plan deploys your complete Medusa v2 e-commerce platform including:
- **Core Medusa Backend** (API + Admin Dashboard)
- **Database** (PostgreSQL with Neon)
- **Caching Layer** (Redis - optional but recommended)
- **File Storage** (Local with option for S3)
- **Security Configuration** (Secrets, CORS, SSL)
- **Monitoring & Health Checks**

---

## 🏗️ PHASE 1: PRE-DEPLOYMENT PREPARATION (30 minutes)

### Step 1.1: Environment Validation
```bash
cd /home/arthur/medusa

# Check current state
npm run security:check

# Verify all required files exist
ls -la .env.production medusa-config.js app.js Dockerfile
```

### Step 1.2: Secure Environment Configuration
```bash
# Create secure production environment
cp .env.production .env.production.backup

# Generate new secure secrets (if needed)
npm run generate:secrets

# Verify current .env.production has all required variables:
cat .env.production
```

**Required Environment Variables:**
```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql://neondb_owner:npg_zpjwXBPl96Si@ep-winter-shape-acyx74fh-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
JWT_SECRET=<64-char-hex>
COOKIE_SECRET=<64-char-hex>
ADMIN_JWT_SECRET=<64-char-hex>
CORS_ORIGIN=https://store.optivoo.com,https://your-domain.com
REDIS_URL=redis://localhost:6379  # Optional but recommended
```

### Step 1.3: Security Hardening
```bash
# Set proper file permissions
chmod 600 .env.production

# Run comprehensive security check
npm run security:check

# Should show: "✅ Production configuration validated successfully"
```

### Step 1.4: Build Validation
```bash
# Install dependencies
yarn install --immutable

# Build all packages
yarn build

# Run linting
yarn lint

# Run unit tests (optional but recommended)
yarn test
```

---

## 🚀 PHASE 2: CHOOSE DEPLOYMENT METHOD (Choose One)

### OPTION A: DOCKER DEPLOYMENT (Self-Hosted) 🐳

**Best For:** Full control, custom infrastructure, VPS/dedicated servers

#### Step 2A.1: Prepare Docker Environment
```bash
# Verify Docker is running
docker --version
docker-compose --version

# Create production docker environment
cp .env.production docker.env
```

#### Step 2A.2: Deploy with Docker Compose
```bash
# Build and start services
docker-compose -f docker-compose.production.yml up -d

# Verify containers are running
docker ps

# Check logs
docker logs medusa-store-production
```

#### Step 2A.3: Database Migration
```bash
# Run database migrations inside container
docker exec medusa-store-production npx medusa db:migrate

# Verify migration success
docker exec medusa-store-production npx medusa db:show
```

---

### OPTION B: RAILWAY DEPLOYMENT 🚂

**Best For:** Easy deployment, automatic scaling, cost-effective

#### Step 2B.1: Railway Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init
```

#### Step 2B.2: Configure Environment Variables
```bash
# Set all required environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set HOST=0.0.0.0
railway variables set JWT_SECRET="$(grep JWT_SECRET .env.production | cut -d'=' -f2)"
railway variables set COOKIE_SECRET="$(grep COOKIE_SECRET .env.production | cut -d'=' -f2)"
railway variables set ADMIN_JWT_SECRET="$(grep ADMIN_JWT_SECRET .env.production | cut -d'=' -f2)"
railway variables set DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d'=' -f2)"
railway variables set CORS_ORIGIN="$(grep CORS_ORIGIN .env.production | cut -d'=' -f2)"

# Optional: Add Redis
railway add redis
railway variables set REDIS_URL="$RAILWAY_REDIS_URL"
```

#### Step 2B.3: Deploy Application
```bash
# Deploy to Railway
railway up

# Get deployment URL
railway status
```

---

### OPTION C: VERCEL DEPLOYMENT ▲

**Best For:** Serverless, global CDN, fastest deployment

#### Step 2C.1: Vercel Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Initialize project
vercel
```

#### Step 2C.2: Configure Environment Variables
```bash
# Add environment variables to Vercel
vercel env add NODE_ENV production
vercel env add PORT 3000
vercel env add HOST 0.0.0.0
vercel env add JWT_SECRET "$(grep JWT_SECRET .env.production | cut -d'=' -f2)"
vercel env add COOKIE_SECRET "$(grep COOKIE_SECRET .env.production | cut -d'=' -f2)"
vercel env add ADMIN_JWT_SECRET "$(grep ADMIN_JWT_SECRET .env.production | cut -d'=' -f2)"
vercel env add DATABASE_URL "$(grep DATABASE_URL .env.production | cut -d'=' -f2)"
vercel env add CORS_ORIGIN "$(grep CORS_ORIGIN .env.production | cut -d'=' -f2)"
```

#### Step 2C.3: Deploy Application
```bash
# Deploy to production
vercel --prod

# Get deployment URL
vercel ls
```

---

## 🔧 PHASE 3: POST-DEPLOYMENT CONFIGURATION (45 minutes)

### Step 3.1: Verify Core Deployment (5 minutes)
```bash
# Test health endpoint (replace with your actual URL)
DEPLOYMENT_URL="https://your-app-url.com"
curl $DEPLOYMENT_URL/health

# Expected response:
# {"status":"healthy","timestamp":"2024-XX-XX","environment":"production"}
```

### Step 3.2: Database Setup & Migration (10 minutes)
```bash
# For Docker deployment:
docker exec medusa-store-production npx medusa db:migrate

# For Railway/Vercel (if they support CLI access):
# Connect via railway shell or vercel shell
npx medusa db:migrate

# Verify database connection
curl $DEPLOYMENT_URL/health | grep "healthy"
```

### Step 3.3: Admin Dashboard Setup (15 minutes)

1. **Access Admin Dashboard:**
   ```
   https://your-app-url.com/app
   ```

2. **Create Admin User:**
   - Open admin dashboard
   - Follow initial setup wizard
   - Create your admin account
   - Set up store basic information

3. **Configure Store Settings:**
   - Store name and details
   - Default currency
   - Default region
   - Tax settings

### Step 3.4: Core Commerce Configuration (15 minutes)

1. **Set Up Regions & Currencies:**
   ```
   Admin Dashboard → Settings → Regions
   - Create regions for your markets
   - Configure currencies
   - Set up tax rates
   ```

2. **Configure Shipping Options:**
   ```
   Admin Dashboard → Settings → Shipping
   - Add shipping profiles
   - Configure shipping methods
   - Set up fulfillment providers
   ```

3. **Payment Configuration:**
   ```
   Admin Dashboard → Settings → Payment
   - Configure payment providers (Stripe recommended)
   - Set up webhook endpoints
   - Test payment processing
   ```

---

## 📊 PHASE 4: MONITORING & OPTIMIZATION (30 minutes)

### Step 4.1: Health Monitoring Setup
```bash
# Set up monitoring script (if using Docker)
chmod +x monitor-production.sh

# Test monitoring commands
./monitor-production.sh status
./monitor-production.sh health
./monitor-production.sh logs 10
```

### Step 4.2: Performance Optimization

#### Enable Redis Caching (Recommended)
```bash
# For Docker deployment - add Redis service
# Update docker-compose.production.yml to include Redis

# For Railway
railway add redis

# For Vercel - use external Redis provider (Upstash recommended)
```

#### Configure File Storage
```bash
# Local storage (default) - already configured
# Or configure S3 storage:
# Add S3 environment variables if needed
```

### Step 4.3: Security Final Check
```bash
# Run final security validation
npm run security:check

# Verify HTTPS is working
curl -I https://your-app-url.com/health | grep "HTTP/2 200"

# Check CORS configuration
curl -H "Origin: https://unauthorized-domain.com" \
     -I https://your-app-url.com/health
```

---

## ✅ PHASE 5: VALIDATION & TESTING (20 minutes)

### Step 5.1: Core Functionality Test
```bash
# Test API endpoints
curl https://your-app-url.com/store/regions
curl https://your-app-url.com/admin/auth
curl https://your-app-url.com/health
```

### Step 5.2: Admin Dashboard Test
1. Login to admin dashboard
2. Create a test product
3. Verify product appears in store API
4. Test order management
5. Check analytics dashboard

### Step 5.3: Store API Test
```bash
# Test store endpoints
curl https://your-app-url.com/store/products
curl https://your-app-url.com/store/regions
curl https://your-app-url.com/store/collections
```

---

## 🚨 TROUBLESHOOTING GUIDE

### Common Issues & Solutions

#### 1. Health Check Fails
```bash
# Check application logs
docker logs medusa-store-production  # Docker
railway logs                         # Railway
vercel logs                         # Vercel

# Verify environment variables
docker exec medusa-store-production env | grep -E "(JWT|DATABASE|NODE_ENV)"
```

#### 2. Database Connection Issues
```bash
# Test database connectivity
node -e "
const config = require('./medusa-config.js');
console.log('Testing DB:', config.projectConfig.databaseUrl);
"

# Check if database URL is accessible
curl -I "$(grep DATABASE_URL .env.production | cut -d'=' -f2)"
```

#### 3. Admin Dashboard Not Loading
- Check CORS_ORIGIN includes your domain
- Verify JWT secrets are set correctly
- Check browser network tab for error details
- Ensure admin path is `/app`

#### 4. API Errors
- Check application logs for specific error messages
- Verify all required environment variables are set
- Test database migrations completed successfully
- Check memory limits (increase if needed)

---

## 📈 SUCCESS CRITERIA

Your deployment is successful when:

✅ **Core Services:**
- Health endpoint returns 200 OK
- Database migrations completed successfully
- Application starts without errors

✅ **Admin Dashboard:**
- Admin dashboard loads at `/app`
- Can create admin user successfully
- Store configuration accessible

✅ **Store API:**
- Store endpoints respond correctly
- Products/regions/collections accessible
- CORS configured properly

✅ **Performance:**
- Response times < 500ms for basic endpoints
- Memory usage stable
- No memory leaks detected

✅ **Security:**
- HTTPS enabled and working
- Security headers present
- No secrets exposed in logs
- File permissions properly set

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

### Week 1 Tasks:
1. **Payment Integration:** Complete Stripe/PayPal setup
2. **Email Configuration:** Set up transactional emails
3. **Product Catalog:** Import/create initial product catalog
4. **Testing:** Comprehensive end-to-end testing

### Month 1 Tasks:
1. **Performance Monitoring:** Set up APM tools
2. **Backup Strategy:** Implement database backups
3. **CDN Setup:** Configure file storage CDN
4. **Analytics:** Implement tracking and analytics

---

## 🆘 EMERGENCY CONTACTS & RESOURCES

- **Medusa Documentation:** https://docs.medusajs.com
- **Medusa Discord:** https://discord.gg/medusajs
- **Neon Database Support:** https://neon.tech/docs
- **Railway Support:** https://railway.app/help
- **Vercel Support:** https://vercel.com/help

---

**🚀 You're ready for production! Choose your deployment method and follow the phase-by-phase steps above for a successful launch.**