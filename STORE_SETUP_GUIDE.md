# 🏪 **COMPLETE STORE SETUP & PERSISTENCE GUIDE**

## 📋 **UNDERSTANDING MEDUSA STORE ARCHITECTURE**

### **What is a Store in Medusa?**
A **Store** in Medusa is the central entity that contains:
- **Store Information**: Name, metadata, configuration
- **Supported Currencies**: Which currencies your store accepts
- **Default Regions**: Geographic regions for shipping/tax
- **Default Sales Channels**: Where products are sold (web, mobile, etc.)
- **Default Stock Locations**: Where inventory is stored

### **Store Data Structure**
```typescript
interface Store {
  id: string                    // Auto-generated store ID
  name: string                  // Store name (default: "Medusa Store")
  default_sales_channel_id: string    // Default sales channel
  default_region_id: string           // Default region for shipping/tax
  default_location_id: string         // Default stock location
  supported_currencies: StoreCurrency[] // Supported currencies
  metadata: Record<string, any>       // Custom store data
}
```

---

## 🚀 **STEP-BY-STEP STORE SETUP PROCESS**

### **PHASE 1: INITIAL STORE CREATION (AUTOMATIC)**

#### **Step 1.1: Database Setup & Migration**
```bash
# 1. Set up production database
DATABASE_URL=postgres://username:password@host:5432/medusa_prod

# 2. Run database migrations (creates all tables including store)
npx medusa db:migrate

# 3. This automatically creates:
#    - Default store with name "Medusa Store"
#    - Default sales channel
#    - Basic currency support
```

#### **Step 1.2: Verify Store Creation**
```bash
# Check if store was created
curl -X GET "http://localhost:3002/admin/stores" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### **PHASE 2: CONFIGURE STORE FOR PRODUCTION**

#### **Step 2.1: Create Production Store Configuration**
```typescript
// src/scripts/setup-production-store.ts
import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export async function setupProductionStore(container: MedusaContainer) {
  const storeService = container.resolve(Modules.STORE)
  const regionService = container.resolve(Modules.REGION)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const currencyService = container.resolve(Modules.CURRENCY)

  // 1. Create default region
  const region = await regionService.createRegions({
    name: "United States",
    currency_code: "usd",
    countries: ["us"],
    tax_rate: 0.08, // 8% tax rate
    metadata: {
      type: "domestic",
      shipping_zone: "continental_us"
    }
  })

  // 2. Create sales channel
  const salesChannel = await salesChannelService.createSalesChannels({
    name: "Online Store",
    description: "Main online storefront",
    is_disabled: false
  })

  // 3. Get existing store
  const [store] = await storeService.listStores({})
  
  // 4. Update store with production configuration
  const updatedStore = await storeService.updateStores(store.id, {
    name: "Your Store Name", // Replace with your store name
    default_region_id: region.id,
    default_sales_channel_id: salesChannel.id,
    supported_currencies: [
      {
        currency_code: "usd",
        is_default: true,
        is_tax_inclusive: false
      },
      {
        currency_code: "eur", 
        is_default: false,
        is_tax_inclusive: false
      }
    ],
    metadata: {
      store_type: "ecommerce",
      industry: "retail",
      established: new Date().getFullYear(),
      contact_email: "admin@yourstore.com"
    }
  })

  console.log("✅ Production store configured:", updatedStore)
  return updatedStore
}
```

#### **Step 2.2: Create Store Setup Script**
```bash
# Create setup script
mkdir -p src/scripts
```

```typescript
// src/scripts/seed-production.ts
import { MedusaApp } from "@medusajs/modules-sdk"
import { setupProductionStore } from "./setup-production-store"

async function seedProduction() {
  console.log("🌱 Seeding production store...")
  
  const { container } = await MedusaApp({
    databaseUrl: process.env.DATABASE_URL,
    // ... other config
  })

  try {
    await setupProductionStore(container)
    console.log("✅ Production store setup complete!")
  } catch (error) {
    console.error("❌ Store setup failed:", error)
    process.exit(1)
  }
}

seedProduction()
```

#### **Step 2.3: Add Script to package.json**
```json
{
  "scripts": {
    "seed:production": "ts-node src/scripts/seed-production.ts",
    "setup:store": "npm run seed:production"
  }
}
```

### **PHASE 3: PERSISTENT STORE CONFIGURATION**

#### **Step 3.1: Environment-Based Store Configuration**
```typescript
// src/config/store-config.ts
export const getStoreConfig = () => {
  const environment = process.env.NODE_ENV || 'development'
  
  const configs = {
    development: {
      name: "Medusa Dev Store",
      currencies: ["usd"],
      regions: ["us"],
      taxRate: 0.08
    },
    production: {
      name: process.env.STORE_NAME || "Your Production Store",
      currencies: (process.env.SUPPORTED_CURRENCIES || "usd,eur").split(','),
      regions: (process.env.SUPPORTED_REGIONS || "us,eu").split(','),
      taxRate: parseFloat(process.env.DEFAULT_TAX_RATE || "0.08")
    }
  }
  
  return configs[environment] || configs.development
}
```

#### **Step 3.2: Production Environment Variables**
```env
# .env.production
STORE_NAME=Your Amazing Store
SUPPORTED_CURRENCIES=usd,eur,gbp
SUPPORTED_REGIONS=us,eu,uk
DEFAULT_TAX_RATE=0.08
STORE_EMAIL=admin@yourstore.com
STORE_PHONE=+1-555-0123
```

### **PHASE 4: AUTOMATED STORE SETUP WORKFLOW**

#### **Step 4.1: Create Store Setup Workflow**
```typescript
// src/workflows/setup-store.ts
import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const createRegionStep = createStep(
  "create-region",
  async (data: { name: string, currency: string }, { container }) => {
    const regionService = container.resolve(Modules.REGION)
    
    const region = await regionService.createRegions({
      name: data.name,
      currency_code: data.currency,
      countries: [data.currency === 'usd' ? 'us' : 'eu'],
      tax_rate: 0.08
    })
    
    return new StepResponse(region)
  }
)

const createSalesChannelStep = createStep(
  "create-sales-channel", 
  async (data: { name: string }, { container }) => {
    const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
    
    const channel = await salesChannelService.createSalesChannels({
      name: data.name,
      description: "Main sales channel",
      is_disabled: false
    })
    
    return new StepResponse(channel)
  }
)

const updateStoreStep = createStep(
  "update-store",
  async (data: { 
    regionId: string, 
    channelId: string, 
    storeName: string 
  }, { container }) => {
    const storeService = container.resolve(Modules.STORE)
    const [store] = await storeService.listStores({})
    
    const updatedStore = await storeService.updateStores(store.id, {
      name: data.storeName,
      default_region_id: data.regionId,
      default_sales_channel_id: data.channelId,
      supported_currencies: [
        { currency_code: "usd", is_default: true }
      ]
    })
    
    return new StepResponse(updatedStore)
  }
)

export const setupStoreWorkflow = createWorkflow(
  "setup-store",
  (input: { storeName: string, regionName: string, currency: string }) => {
    const region = createRegionStep({
      name: input.regionName,
      currency: input.currency
    })
    
    const salesChannel = createSalesChannelStep({
      name: "Online Store"
    })
    
    const store = updateStoreStep({
      regionId: region.id,
      channelId: salesChannel.id,
      storeName: input.storeName
    })
    
    return new WorkflowResponse({ store, region, salesChannel })
  }
)
```

#### **Step 4.2: API Endpoint for Store Setup**
```typescript
// src/api/admin/setup-store/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { setupStoreWorkflow } from "../../workflows/setup-store"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { storeName, regionName, currency } = req.body
  
  const { result } = await setupStoreWorkflow(req.scope).run({
    input: {
      storeName: storeName || "My Store",
      regionName: regionName || "United States", 
      currency: currency || "usd"
    }
  })
  
  res.json({
    success: true,
    store: result.store,
    region: result.region,
    salesChannel: result.salesChannel
  })
}
```

---

## 🔧 **PRODUCTION DEPLOYMENT INTEGRATION**

### **Step 5.1: Docker Setup with Store Persistence**
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Create startup script
RUN echo '#!/bin/sh\n\
echo "Running database migrations..."\n\
npx medusa db:migrate\n\
\n\
echo "Setting up store..."\n\
npm run setup:store\n\
\n\
echo "Starting Medusa server..."\n\
npm start' > /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 3000
CMD ["/app/start.sh"]
```

### **Step 5.2: Railway Deployment Configuration**
```yaml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run setup:store && npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"

[env]
NODE_ENV = "production"
```

### **Step 5.3: Environment Variables for Production**
```env
# Production Environment Variables
DATABASE_URL=postgres://user:pass@host:5432/medusa_prod
STORE_NAME=Your Production Store
SUPPORTED_CURRENCIES=usd,eur
DEFAULT_TAX_RATE=0.08
STORE_EMAIL=admin@yourstore.com
REDIS_URL=redis://redis-host:6379
```

---

## 📊 **STORE PERSISTENCE STRATEGIES**

### **Strategy 1: Database-First (RECOMMENDED)**
- ✅ **Store data stored in PostgreSQL**
- ✅ **Automatic migrations on deployment**
- ✅ **Backup and recovery included**
- ✅ **Multi-region replication possible**

### **Strategy 2: Configuration Files**
```typescript
// src/config/store-persistence.ts
import fs from 'fs/promises'
import path from 'path'

export class StorePersistence {
  private configPath = path.join(process.cwd(), 'store-config.json')
  
  async saveStoreConfig(store: any) {
    await fs.writeFile(this.configPath, JSON.stringify(store, null, 2))
  }
  
  async loadStoreConfig() {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8')
      return JSON.parse(data)
    } catch {
      return null
    }
  }
}
```

### **Strategy 3: External Configuration Service**
```typescript
// src/services/store-config-service.ts
export class StoreConfigService {
  async getStoreConfig(): Promise<StoreConfig> {
    // Fetch from external service (AWS Parameter Store, etc.)
    const response = await fetch(process.env.STORE_CONFIG_URL)
    return response.json()
  }
  
  async updateStoreConfig(config: StoreConfig) {
    // Update external service
    await fetch(process.env.STORE_CONFIG_URL, {
      method: 'PUT',
      body: JSON.stringify(config)
    })
  }
}
```

---

## 🎯 **QUICK START COMMANDS**

### **For Development**
```bash
# 1. Start with fresh database
npx medusa db:migrate

# 2. Setup development store
npm run setup:store

# 3. Start development server
npm run dev
```

### **For Production**
```bash
# 1. Set production environment
export NODE_ENV=production
export DATABASE_URL=your_production_db_url

# 2. Run migrations
npx medusa db:migrate

# 3. Setup production store
npm run setup:store

# 4. Start production server
npm start
```

### **For Docker Deployment**
```bash
# 1. Build image
docker build -t medusa-store .

# 2. Run with environment
docker run -e DATABASE_URL=your_db_url \
           -e STORE_NAME="Your Store" \
           -p 3000:3000 \
           medusa-store
```

---

## 🔍 **VERIFICATION & TESTING**

### **Test Store Setup**
```typescript
// src/scripts/test-store-setup.ts
import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export async function testStoreSetup(container: MedusaContainer) {
  const storeService = container.resolve(Modules.STORE)
  const regionService = container.resolve(Modules.REGION)
  
  // Test store exists
  const [store] = await storeService.listStores({})
  console.log("✅ Store exists:", store.name)
  
  // Test region exists
  const regions = await regionService.listRegions({})
  console.log("✅ Regions configured:", regions.length)
  
  // Test currencies
  console.log("✅ Supported currencies:", store.supported_currencies)
  
  return {
    store,
    regions,
    isConfigured: !!(store.default_region_id && store.default_sales_channel_id)
  }
}
```

### **Health Check Endpoint**
```typescript
// src/api/health/route.ts
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const storeService = req.scope.resolve(Modules.STORE)
  const [store] = await storeService.listStores({})
  
  const health = {
    status: 'healthy',
    store: {
      name: store.name,
      configured: !!(store.default_region_id && store.default_sales_channel_id),
      currencies: store.supported_currencies?.length || 0
    },
    timestamp: new Date().toISOString()
  }
  
  res.json(health)
}
```

---

## 🎉 **SUCCESS METRICS**

### **Store Setup Complete When:**
- ✅ Store exists with proper name
- ✅ Default region configured
- ✅ Default sales channel configured  
- ✅ Supported currencies set
- ✅ Store metadata populated
- ✅ Health check passes

### **Production Ready When:**
- ✅ Store persists across deployments
- ✅ Environment-specific configuration
- ✅ Automated setup on deployment
- ✅ Backup and recovery tested
- ✅ Multi-currency support
- ✅ Tax configuration complete

---

**🏆 BOTTOM LINE**: This guide provides a complete, production-ready store setup process that ensures your Medusa store is properly configured and persists across deployments. The database-first approach with automated workflows ensures reliability and scalability.

**NEXT STEP**: Start with Phase 1 (Database Setup) and work through each phase systematically for a robust, production-ready store configuration.
