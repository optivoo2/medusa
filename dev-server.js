const { MedusaApp } = require("@medusajs/modules-sdk")
const { Modules } = require("@medusajs/utils")

// Database configuration
const DB_URL = process.env.DATABASE_URL || "postgres://medusa_user:medusa_password@localhost/medusa_dev"

// Server configuration
async function startServer() {
  try {
    console.log("🚀 Starting Medusa development server...")
    
    const appConfig = {
      databaseUrl: DB_URL,
      modules: {
        [Modules.AUTH]: true,
        [Modules.USER]: {
          scope: "internal",
          resolve: "@medusajs/user",
          options: {
            jwt_secret: "supersecret",
          },
        },
        [Modules.CACHE]: {
          resolve: "@medusajs/cache-inmemory",
        },
        [Modules.EVENT_BUS]: {
          resolve: "@medusajs/event-bus-local",
        },
        [Modules.WORKFLOW_ENGINE]: {
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
        },
        [Modules.NOTIFICATION]: {
          resolve: "@medusajs/notification-local",
        },
      },
    }

    // Initialize the app
    const { app } = await MedusaApp({
      modulesConfig: appConfig,
    })

    const port = process.env.PORT || 9000
    
    // Start the server
    app.listen(port, () => {
      console.log(`✅ Medusa server is running on port ${port}`)
      console.log(`📊 Admin dashboard: http://localhost:${port}/app`)
      console.log(`🏪 Store API: http://localhost:${port}/store`)
      console.log(`🔍 Health check: http://localhost:${port}/health`)
    })

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received, shutting down gracefully")
      process.exit(0)
    })

    process.on("SIGINT", async () => {
      console.log("SIGINT received, shutting down gracefully")
      process.exit(0)
    })

  } catch (error) {
    console.error("❌ Failed to start Medusa server:", error)
    process.exit(1)
  }
}

startServer()
