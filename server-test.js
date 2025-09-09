// Minimal test server for Railway deployment verification
const express = require('express')
const app = express()
const PORT = process.env.PORT || 9000

app.get('/', (req, res) => {
  res.json({
    message: 'Medusa Railway Test Server ✅',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  })
})

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'medusa-test',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running on port ${PORT}`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
})
