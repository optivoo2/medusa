const { Modules } = require("@medusajs/utils")

// Environment detection
const isProduction = process.env.NODE_ENV === "production"
const isDevelopment = process.env.NODE_ENV === "development" || !process.env.NODE_ENV

// Database configuration with fallback
const DB_URL = process.env.DATABASE_URL || "postgres://medusa_user:medusa_password@localhost/medusa_dev"

// Redis configuration
const REDIS_URL = process.env.REDIS_URL

// CORS origins based on environment
const getCorsOrigins = () => {
  if (isProduction) {
    const origins = process.env.CORS_ORIGIN?.split(",") || []
    return origins.length > 0 ? origins : ["https://yourdomain.com"]
  }
  return ["http://localhost:8000", "http://localhost:3001", "http://localhost:3002"]
}

module.exports = {
  admin: {
    disable: false, // Enable admin dashboard
    path: "/app",
  },
  plugins: [],
  projectConfig: {
    port: process.env.PORT || (isProduction ? 3000 : 3002),
    host: process.env.HOST || (isProduction ? "0.0.0.0" : "localhost"),
    databaseUrl: DB_URL,
    databaseType: "postgres",
    // Enhanced database configuration for production
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
      // CRITICAL FIX: Remove default fallback secrets
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
      // Additional security headers for production
      ...(isProduction && {
        compression: true,
        trustProxy: 1,
      }),
      cors: {
        origin: getCorsOrigins(),
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: [
          "Authorization",
          "Content-Type",
          "x-medusa-access-token",
          "Cookie",
        ],
      },
    },
  },
  featureFlags: {
    medusa_v2: true, // Enable Medusa v2 features
  },
  modules: {
    [Modules.AUTH]: true,
    [Modules.USER]: {
      scope: "internal",
      resolve: "@medusajs/user",
      options: {
        jwt_secret: process.env.JWT_SECRET,
      },
    },
    // CRITICAL FIX: Production-ready caching
    [Modules.CACHE]: isProduction && REDIS_URL ? {
      resolve: "@medusajs/cache-redis",
      options: { 
        redisUrl: REDIS_URL,
        ttl: 3600, // 1 hour default TTL
      },
    } : {
      resolve: "@medusajs/cache-inmemory",
      options: { ttl: isDevelopment ? 0 : 300 }, // Disabled for dev, 5min for others
    },
    // Enhanced workflow engine for production
    [Modules.WORKFLOW_ENGINE]: isProduction && REDIS_URL ? {
      resolve: "@medusajs/workflow-engine-redis",
      options: {
        redis: { url: REDIS_URL },
      },
    } : {
      resolve: "@medusajs/workflow-engine-inmemory",
    },
    [Modules.STOCK_LOCATION]: {
      resolve: "@medusajs/stock-location",
      options: {},
    },
    [Modules.INVENTORY]: {
      resolve: "@medusajs/inventory",
      options: {},
    },
    // CRITICAL FIX: Production-ready file storage
    [Modules.FILE]: {
      resolve: "@medusajs/file",
      options: {
        providers: isProduction ? [
          // S3 for production (configure AWS credentials in environment)
          {
            resolve: "@medusajs/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.AWS_ACCESS_KEY_ID,
              secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
              region: process.env.AWS_REGION || "us-east-1",
              bucket: process.env.S3_BUCKET,
              prefix: process.env.S3_PREFIX || "medusa",
              // Enable multipart uploads for large files
              upload_options: {
                ACL: "public-read",
              },
            },
          },
        ] : [
          // Local storage for development
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: {
              upload_dir: "uploads",
            },
          },
        ],
      },
    },
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
    [Modules.PAYMENT]: {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment/dist/providers/system",
            id: "system",
          },
        ],
      },
    },
    [Modules.FULFILLMENT]: {
      options: {
        providers: [
          {
            resolve: "@medusajs/fulfillment-manual",
            id: "manual",
          },
        ],
      },
    },
    // Enhanced notification system
    [Modules.NOTIFICATION]: {
      resolve: "@medusajs/notification",
      options: {
        providers: isProduction ? [
          // SendGrid for production emails
          {
            resolve: "@medusajs/notification-sendgrid",
            id: "sendgrid",
            options: {
              api_key: process.env.SENDGRID_API_KEY,
              from: process.env.SENDGRID_FROM_EMAIL || "noreply@yourdomain.com",
              template_path: "templates",
            },
          },
        ] : [
          // Local notifications for development
          {
            resolve: "@medusajs/notification-local",
            id: "local-notification-provider",
            options: {
              name: "Local Notification Provider",
              channels: ["log", "email"],
            },
          },
        ],
      },
    },
    // Add event bus configuration for better performance
    [Modules.EVENT_BUS]: isProduction && REDIS_URL ? {
      resolve: "@medusajs/event-bus-redis",
      options: {
        redisUrl: REDIS_URL,
      },
    } : {
      resolve: "@medusajs/event-bus-local",
    },
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
  
  // Warn about optional but recommended variables
  const recommendedVars = ['REDIS_URL', 'AWS_ACCESS_KEY_ID', 'SENDGRID_API_KEY']
  const missingRecommended = recommendedVars.filter(varName => !process.env[varName])
  
  if (missingRecommended.length > 0) {
    console.warn('⚠️  WARNING: Missing recommended environment variables:')
    missingRecommended.forEach(varName => {
      console.warn(`   - ${varName}`)
    })
    console.warn('Some features may not work optimally without these variables.')
  }
  
  console.log('✅ Production configuration validated successfully')
}

