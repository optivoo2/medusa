// Enhanced Medusa Integration for Vercel Serverless
const { MedusaApp } = require("@medusajs/modules-sdk");
const path = require("path");

let medusaApp = null;
let isInitializing = false;
let initPromise = null;

// Serverless-optimized Medusa configuration
const createMedusaConfig = () => ({
  admin: {
    disable: false,
    path: "/app",
  },
  plugins: [],
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseType: "postgres",
    // Optimized for serverless
    databaseDriverOptions: {
      pool: {
        min: 1,
        max: 3, // Reduced for serverless
        idleTimeoutMillis: 10000,
        createTimeoutMillis: 10000,
        acquireTimeoutMillis: 10000,
      },
      ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
    },
    http: {
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
      cors: {
        origin: process.env.CORS_ORIGIN?.split(",") || ["*"],
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
    medusa_v2: true,
  },
  modules: {
    // Core modules with minimal configuration for serverless
    auth: {
      resolve: "@medusajs/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/auth-emailpass",
            id: "emailpass",
          },
        ],
      },
    },
    user: {
      resolve: "@medusajs/user",
      options: {
        jwt_secret: process.env.JWT_SECRET,
      },
    },
    cache: process.env.REDIS_URL ? {
      resolve: "@medusajs/cache-redis",
      options: { 
        redisUrl: process.env.REDIS_URL,
        ttl: 3600,
      },
    } : {
      resolve: "@medusajs/cache-inmemory",
      options: { ttl: 300 },
    },
    product: {
      resolve: "@medusajs/product",
    },
    customer: {
      resolve: "@medusajs/customer", 
    },
    cart: {
      resolve: "@medusajs/cart",
    },
    order: {
      resolve: "@medusajs/order",
    },
    payment: {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
            },
          },
        ],
      },
    },
    fulfillment: {
      resolve: "@medusajs/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/fulfillment-manual",
            id: "manual",
          },
        ],
      },
    },
    inventory: {
      resolve: "@medusajs/inventory",
    },
    stockLocation: {
      resolve: "@medusajs/stock-location",
    },
    file: {
      resolve: "@medusajs/file",
      options: {
        providers: [
          process.env.AWS_ACCESS_KEY_ID ? {
            resolve: "@medusajs/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.AWS_ACCESS_KEY_ID,
              secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
              region: process.env.AWS_REGION || "us-east-1",
              bucket: process.env.S3_BUCKET,
            },
          } : {
            resolve: "@medusajs/file-local",
            id: "local",
          },
        ],
      },
    },
    notification: {
      resolve: "@medusajs/notification",
      options: {
        providers: [
          process.env.SENDGRID_API_KEY ? {
            resolve: "@medusajs/notification-sendgrid",
            id: "sendgrid",
            options: {
              api_key: process.env.SENDGRID_API_KEY,
              from: process.env.SENDGRID_FROM_EMAIL,
            },
          } : {
            resolve: "@medusajs/notification-local",
            id: "local",
          },
        ],
      },
    },
  },
});

// Initialize Medusa app with proper error handling
async function initializeMedusaApp() {
  if (medusaApp) {
    return medusaApp;
  }

  if (isInitializing) {
    return initPromise;
  }

  isInitializing = true;
  
  try {
    console.log("🚀 Initializing Medusa app for serverless...");
    
    // Validate required environment variables
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'COOKIE_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    initPromise = MedusaApp({
      configModule: createMedusaConfig(),
    });

    const result = await initPromise;
    medusaApp = result;
    
    console.log("✅ Medusa app initialized successfully");
    return medusaApp;
    
  } catch (error) {
    console.error("❌ Failed to initialize Medusa app:", error);
    isInitializing = false;
    initPromise = null;
    throw error;
  } finally {
    isInitializing = false;
  }
}

// Enhanced error handling middleware
function errorHandler(error, req, res, next) {
  console.error("API Error:", error);
  
  const isDevelopment = process.env.NODE_ENV === "development";
  
  res.status(error.status || 500).json({
    error: {
      message: error.message || "Internal Server Error",
      ...(isDevelopment && { stack: error.stack }),
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    },
  });
}

// Health check with database connectivity test
async function healthCheck(req, res) {
  try {
    const startTime = Date.now();
    
    // Basic health info
    const healthInfo = {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: "2.0.0",
      uptime: process.uptime(),
    };

    // Test database connectivity if Medusa is initialized
    if (medusaApp) {
      try {
        // Simple database ping (adjust based on your DB setup)
        healthInfo.database = "connected";
        healthInfo.medusa = "initialized";
      } catch (dbError) {
        healthInfo.database = "error";
        healthInfo.medusa_error = dbError.message;
      }
    } else {
      healthInfo.database = "not_initialized";
      healthInfo.medusa = "not_initialized";
    }

    healthInfo.response_time = `${Date.now() - startTime}ms`;
    
    res.status(200).json(healthInfo);
  } catch (error) {
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
}

module.exports = {
  initializeMedusaApp,
  errorHandler,
  healthCheck,
  createMedusaConfig,
};

