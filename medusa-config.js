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
    disable: true, // Disable admin dashboard for now
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
    // Enhanced Redis configuration for production
    redisUrl: REDIS_URL,
    // File storage configuration - Local only
    fileService: {
      provider: "local",
      local: {
        upload_dir: "uploads",
      },
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
  const recommendedVars = ['REDIS_URL']
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