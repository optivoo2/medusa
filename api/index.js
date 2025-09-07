// Full Medusa E-commerce API for Vercel Serverless
const { initializeMedusaApp, errorHandler, healthCheck } = require("./medusa");

// Cache the initialized app across invocations
let appCache = null;
let isInitializing = false;

async function getMedusaApp() {
  if (appCache) {
    return appCache;
  }

  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return appCache;
  }

  try {
    isInitializing = true;
    console.log("🔄 Initializing Medusa for serverless request...");
    
    const medusaResult = await initializeMedusaApp();
    
    if (medusaResult && medusaResult.app) {
      appCache = medusaResult.app;
      
      // Add custom health endpoint
      appCache.get('/health', healthCheck);
      
      // Add API info endpoint
      appCache.get('/', (req, res) => {
        res.json({
          message: "Medusa E-commerce API",
          status: "operational",
          version: "2.0.0",
          environment: process.env.NODE_ENV,
          endpoints: {
            health: "/health",
            admin: "/admin",
            store: "/store",
            auth: "/auth"
          },
          features: {
            database: !!process.env.DATABASE_URL,
            redis: !!process.env.REDIS_URL,
            s3: !!process.env.AWS_ACCESS_KEY_ID,
            stripe: !!process.env.STRIPE_API_KEY,
            sendgrid: !!process.env.SENDGRID_API_KEY
          }
        });
      });

      // Add error handling middleware
      appCache.use(errorHandler);
      
      console.log("✅ Medusa app ready for requests");
      return appCache;
    } else {
      throw new Error("Failed to get Express app from Medusa initialization");
    }
  } catch (error) {
    console.error("❌ Failed to initialize Medusa app:", error);
    
    // Return a fallback Express app for graceful degradation
    const express = require("express");
    const cors = require("cors");
    
    const fallbackApp = express();
    fallbackApp.use(cors());
    fallbackApp.use(express.json());
    
    fallbackApp.get("/", (req, res) => {
      res.status(503).json({
        error: "Medusa initialization failed",
        message: "Service temporarily unavailable",
        fallback: true,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    });
    
    fallbackApp.get("/health", (req, res) => {
      res.status(503).json({
        status: "error",
        message: "Medusa failed to initialize",
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === "development" ? error.message : "Service unavailable"
      });
    });
    
    fallbackApp.use("*", (req, res) => {
      res.status(503).json({
        error: "Service unavailable",
        message: "Medusa is not properly initialized",
        timestamp: new Date().toISOString()
      });
    });
    
    appCache = fallbackApp;
    return appCache;
  } finally {
    isInitializing = false;
  }
}

// Main serverless function handler
module.exports = async (req, res) => {
  try {
    // Set serverless-friendly headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Powered-By', 'Medusa + Vercel');
    
    // Get the Medusa app instance
    const app = await getMedusaApp();
    
    // Handle the request
    return app(req, res);
    
  } catch (error) {
    console.error("❌ Serverless function error:", error);
    
    res.status(500).json({
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
      timestamp: new Date().toISOString(),
      serverless: true
    });
  }
};