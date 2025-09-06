const { MedusaApp } = require("@medusajs/modules-sdk")

async function bootstrap() {
  try {
    console.log("Starting Medusa server...")
    
    const { app, shutdown } = await MedusaApp({
      medusaConfigPath: "/home/arthur/medusa/medusa-config.js",
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
