// Health check endpoint for monitoring
export const GET = async (req, res) => {
  try {
    // Basic health check
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "2.10.1",
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: "MB"
      }
    }

    // Check database connection if available
    if (req.scope?.resolve) {
      try {
        const dbConnection = req.scope.resolve("__pg_connection__")
        if (dbConnection) {
          // Simple query to check database
          await dbConnection.raw("SELECT 1")
          health.database = "connected"
        }
      } catch (dbError) {
        health.database = "error"
        health.status = "degraded"
      }
    }

    res.status(health.status === "healthy" ? 200 : 503).json(health)
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
