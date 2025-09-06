const { Modules } = require("@medusajs/utils")

// Database configuration
const DB_URL = process.env.DATABASE_URL || "postgres://medusa_user:medusa_password@localhost/medusa_dev"

module.exports = {
  admin: {
    disable: false, // Enable admin dashboard
    path: "/app",
  },
  plugins: [],
  projectConfig: {
    port: process.env.PORT || 3002,
    host: process.env.HOST || "localhost",
    databaseUrl: DB_URL,
    databaseType: "postgres",
    http: {
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
      cors: {
        origin: ["http://localhost:8000", "http://localhost:3001", "http://localhost:3002"],
        credentials: true,
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
        jwt_secret: process.env.JWT_SECRET || "supersecret",
      },
    },
    [Modules.CACHE]: {
      resolve: "@medusajs/cache-inmemory",
      options: { ttl: 0 }, // Cache disabled for development
    },
    [Modules.STOCK_LOCATION]: {
      resolve: "@medusajs/stock-location",
      options: {},
    },
    [Modules.INVENTORY]: {
      resolve: "@medusajs/inventory",
      options: {},
    },
    [Modules.FILE]: {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
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
    [Modules.WORKFLOW_ENGINE]: true,
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
    [Modules.NOTIFICATION]: {
      options: {
        providers: [
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
  },
}
