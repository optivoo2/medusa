const { Modules } = require("@medusajs/utils")

// Environment detection
const isProduction = process.env.NODE_ENV === "production"

// Database configuration with fallback
const DB_URL = process.env.DATABASE_URL || "postgres://medusa_user:medusa_password@localhost/medusa_dev"

// Redis configuration
const REDIS_URL = process.env.REDIS_URL

// CORS origins based on environment
const getCorsOrigins = () => {
  if (isProduction) {
    const origins = process.env.CORS_ORIGIN?.split(",") || []
    return origins.length > 0 ? origins : ["https://store.optivoo.com"]
  }
  return ["http://localhost:8000", "http://localhost:3001", "http://localhost:3002"]
}

module.exports = {
  admin: {
    disable: false,
    path: "/app",
  },
  plugins: [],
  projectConfig: {
    port: process.env.PORT || (isProduction ? 3000 : 3002),
    host: process.env.HOST || (isProduction ? "0.0.0.0" : "localhost"),
    databaseUrl: DB_URL,
    databaseType: "postgres",
    databaseDriverOptions: isProduction ? {
      pool: {
        min: 2,
        max: 10,
        idleTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        acquireTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
      },
      ssl: { rejectUnauthorized: false }
    } : {},
    http: {
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
      cors: {
        origin: getCorsOrigins(),
        credentials: true,
      },
    },
  },
  modules: {
    // Essential modules only with minimal configuration
    [Modules.AUTH]: true,
    [Modules.USER]: true,
    [Modules.CACHE]: isProduction && REDIS_URL ? {
      resolve: "@medusajs/cache-redis",
      options: { 
        redisUrl: REDIS_URL,
        ttl: 3600,
      },
    } : {
      resolve: "@medusajs/cache-inmemory",
      options: { ttl: 300 },
    },
    [Modules.EVENT_BUS]: isProduction && REDIS_URL ? {
      resolve: "@medusajs/event-bus-redis",
      options: {
        redisUrl: REDIS_URL,
      },
    } : {
      resolve: "@medusajs/event-bus-local",
    },
    [Modules.STOCK_LOCATION]: true,
    [Modules.INVENTORY]: true,
    [Modules.PRODUCT]: true,
    [Modules.PRICING]: true,
    [Modules.PROMOTION]: true,
    [Modules.REGION]: true,
    [Modules.CUSTOMER]: true,
    [Modules.SALES_CHANNEL]: true,
    [Modules.CART]: true,
    [Modules.API_KEY]: true,
    [Modules.STORE]: true,
    [Modules.TAX]: true,
    [Modules.CURRENCY]: true,
    [Modules.ORDER]: true,
    [Modules.PAYMENT]: true,
    [Modules.FULFILLMENT]: true,
    [Modules.FILE]: true,
    [Modules.NOTIFICATION]: true,
  },
}

// SECURITY VALIDATION: Ensure required environment variables are set in production
if (isProduction) {
  const requiredEnvVars = [
    'JWT_SECRET',
    'COOKIE_SECRET', 
    'DATABASE_URL'
  ]
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('🚨 CRITICAL: Missing required environment variables for production:')
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    console.error('Please set these environment variables before starting the production server.')
    process.exit(1)
  }
  
  console.log('✅ Production configuration validated successfully')
}


