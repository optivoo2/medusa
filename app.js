const { MedusaApp } = require("@medusajs/modules-sdk")
const { Modules } = require("@medusajs/utils")

// Environment detection
const isProduction = process.env.NODE_ENV === "production"
const isDevelopment = process.env.NODE_ENV === "development" || !process.env.NODE_ENV

// Database configuration with fallback
const DB_URL = process.env.DATABASE_URL || "postgres://medusa_user:medusa_password@localhost/medusa_dev"

// Redis configuration
const REDIS_URL = process.env.REDIS_URL

async function bootstrap() {
  try {
    console.log("Starting Medusa server...")
    
    const appConfig = {
      databaseUrl: DB_URL,
      modules: {
        [Modules.AUTH]: true,
        [Modules.USER]: {
          scope: "internal",
          resolve: "@medusajs/user",
          options: {
            jwt_secret: process.env.JWT_SECRET,
          },
        },
        [Modules.CACHE]: isProduction && REDIS_URL ? {
          resolve: "@medusajs/cache-redis",
          options: { 
            redisUrl: REDIS_URL,
            ttl: 3600,
          },
        } : {
          resolve: "@medusajs/cache-inmemory",
          options: { ttl: isDevelopment ? 0 : 300 },
        },
        [Modules.EVENT_BUS]: isProduction && REDIS_URL ? {
          resolve: "@medusajs/event-bus-redis",
          options: {
            redisUrl: REDIS_URL,
          },
        } : {
          resolve: "@medusajs/event-bus-local",
        },
        [Modules.WORKFLOW_ENGINE]: isProduction && REDIS_URL ? {
          resolve: "@medusajs/workflow-engine-redis",
          options: {
            redis: { url: REDIS_URL },
          },
        } : {
          resolve: "@medusajs/workflow-engine-inmemory",
        },
        [Modules.CUSTOMER]: true,
        [Modules.PRODUCT]: true,
        [Modules.PRICING]: true,
        [Modules.PROMOTION]: true,
        [Modules.SALES_CHANNEL]: true,
        [Modules.CART]: true,
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
          resolve: "@medusajs/fulfillment",
          options: {
            providers: [
              {
                resolve: "@medusajs/fulfillment-manual",
                id: "manual_fulfillment",
              },
            ],
          },
        },
        [Modules.STOCK_LOCATION]: true,
        [Modules.INVENTORY]: true,
        [Modules.TAX]: true,
        [Modules.REGION]: true,
        [Modules.STORE]: true,
        [Modules.API_KEY]: true,
        [Modules.FILE]: {
          resolve: "@medusajs/file-local",
          options: {
            providers: [
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
        [Modules.NOTIFICATION]: {
          resolve: "@medusajs/notification-local",
        },
      },
    }

    const { app, shutdown } = await MedusaApp({
      modulesConfig: appConfig,
    })

    // Add health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      })
    })

    const port = process.env.PORT || 9000
    
    app.listen(port, () => {
      console.log(`🚀 Medusa server is running on port ${port}`)
      console.log(`📊 Admin dashboard: http://localhost:${port}/app`)
      console.log(`🏪 Store API: http://localhost:${port}/store`)
    })

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received, shutting down gracefully")
      await shutdown()
      process.exit(0)
    })

    process.on("SIGINT", async () => {
      console.log("SIGINT received, shutting down gracefully")
      await shutdown()
      process.exit(0)
    })
  } catch (error) {
    console.error("Failed to start Medusa server:", error)
    process.exit(1)
  }
}

bootstrap()
