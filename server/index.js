import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import authRoutes from './routes/authRoutes.js'
import photographerRoutes from './routes/photographerRoutes.js'
import weddingAdminRoutes from './routes/weddingAdminRoutes.js'
import publicRoutes from './routes/publicRoutes.js'
import { getDb } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = Number(process.env.PORT) || 5001
const HOST = '0.0.0.0'

// Enable trust proxy for Render / Cloudflare / reverse proxy
app.set('trust proxy', 1)

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}))
app.use(cookieParser())
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))

// Initialize database on startup
getDb()

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/photographer', photographerRoutes)
app.use('/api/wedding-admin', weddingAdminRoutes)
app.use('/api/public', publicRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Royal Rajasthani Multi-Wedding Platform',
    timestamp: new Date().toISOString(),
  })
})

// Serve static assets in production if dist/ exists
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))

// SPA catch-all for production deployment (excluding /api)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Royal Rajasthani Multi-Wedding Platform API Server is running.')
    }
  })
})

const server = app.listen(PORT, HOST, () => {
  console.log(`[API Server] Running on http://${HOST}:${PORT}`)
  console.log(`[API Server] Photographer Default PIN: ${process.env.PHOTOGRAPHER_PIN || '88889999'}`)
})

export default app
