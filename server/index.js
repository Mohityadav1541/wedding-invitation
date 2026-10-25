import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import authRoutes from './routes/authRoutes.js'
import photographerRoutes from './routes/photographerRoutes.js'
import weddingAdminRoutes from './routes/weddingAdminRoutes.js'
import publicRoutes from './routes/publicRoutes.js'
import { getDb, initDb, ensureDbFresh } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = Number(process.env.PORT) || 5001
const HOST = '0.0.0.0'

// Enable trust proxy for Render / Railway / Cloudflare / reverse proxy
app.set('trust proxy', 1)

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}))
app.use(cookieParser())
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))

// Initialize database on startup (Neon PostgreSQL if DATABASE_URL is set, otherwise local JSON store)
await initDb()

// Middleware to ensure fresh database state on every API call (critical for Vercel serverless multi-instance sync)
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/health') {
    try {
      await ensureDbFresh()
    } catch (err) {
      console.error('[DB Sync Middleware Error]:', err.message)
    }
  }
  next()
})

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
    database: process.env.DATABASE_URL ? 'neon-postgresql' : 'local-json',
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

if (!process.env.VERCEL) {
  const server = app.listen(PORT, HOST, () => {
    console.log(`[API Server] Running on http://${HOST}:${PORT}`)
    console.log(`[API Server] Photographer Default PIN: ${process.env.PHOTOGRAPHER_PIN || '15407610'}`)
  })
}

export default app
