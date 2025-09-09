const { MedusaApp } = require("@medusajs/modules-sdk")
const { Modules } = require("@medusajs/utils")

// Production environment configuration
const isProduction = process.env.NODE_ENV === "production"
console.log("🚀 Starting Medusa in", isProduction ? "PRODUCTION" : "DEVELOPMENT", "mode")

// Database configuration
const DB_URL = process.env.DATABASE_URL || "postgres://medusa_user:medusa_password@localhost/medusa_dev"
console.log("📊 Database:", DB_URL.split('@')[1])

// Redis configuration
const REDIS_URL = process.env.REDIS_URL

async function bootstrap() {
  try {
    console.log("⚡ Initializing Medusa modules...")
    
    const appConfig = {
      databaseUrl: DB_URL,
      modules: {
        [Modules.AUTH]: {
          resolve: "@medusajs/auth",
        },
        [Modules.USER]: {
          resolve: "@medusajs/user",
        },
        [Modules.CACHE]: {
          resolve: "@medusajs/cache-inmemory",
          options: { ttl: 300 },
        },
        [Modules.EVENT_BUS]: {
          resolve: "@medusajs/event-bus-local",
        },
        [Modules.WORKFLOW_ENGINE]: {
          resolve: "@medusajs/workflow-engine-inmemory",
        },
        [Modules.CUSTOMER]: {
          resolve: "@medusajs/customer",
        },
        [Modules.PRODUCT]: {
          resolve: "@medusajs/product",
        },
        [Modules.PRICING]: {
          resolve: "@medusajs/pricing",
        },
        [Modules.SALES_CHANNEL]: {
          resolve: "@medusajs/sales-channel",
        },
        [Modules.CART]: {
          resolve: "@medusajs/cart",
        },
        [Modules.ORDER]: {
          resolve: "@medusajs/order",
        },
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
        [Modules.STOCK_LOCATION]: {
          resolve: "@medusajs/stock-location",
        },
        [Modules.INVENTORY]: {
          resolve: "@medusajs/inventory",
        },
        [Modules.TAX]: {
          resolve: "@medusajs/tax",
        },
        [Modules.REGION]: {
          resolve: "@medusajs/region",
        },
        [Modules.STORE]: {
          resolve: "@medusajs/store",
        },
        [Modules.API_KEY]: {
          resolve: "@medusajs/api-key",
        },
        [Modules.FILE]: {
          resolve: "@medusajs/file",
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

    console.log("🔧 Creating Medusa application instance...")
    const { app } = await MedusaApp({
      modulesConfig: appConfig,
    })

    // Add health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '2.10.1',
        environment: process.env.NODE_ENV || 'development'
      })
    })

    const port = process.env.PORT || 3000
    const host = process.env.HOST || '0.0.0.0'
    
    app.listen(port, host, () => {
      console.log(`🚀 Medusa server is running on ${host}:${port}`)
      console.log(`📊 Admin dashboard: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/app`)
      console.log(`🏪 Store API: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/store`)
      console.log(`❤️  Health check: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/health`)
      console.log("✅ Production deployment successful!")
    })

    return { app }
  } catch (error) {
    console.error("❌ Failed to start Medusa server:", error.message)
    console.error("Stack trace:", error.stack)
    process.exit(1)
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully")
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully")
  process.exit(0)
})

bootstrap()