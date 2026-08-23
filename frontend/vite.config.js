import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const videosDir = path.resolve(__dirname, 'videos')

function serveLocalVideos() {
  return {
    name: 'serve-local-videos',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0]
        if (!url.startsWith('/videos/')) return next()
        const name = decodeURIComponent(url.slice('/videos/'.length))
        if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) {
          res.statusCode = 400
          return res.end()
        }
        const full = path.join(videosDir, name)
        if (!fs.existsSync(full)) return next()
        const stat = fs.statSync(full)
        res.setHeader('Content-Type', 'video/mp4')
        res.setHeader('Accept-Ranges', 'bytes')
        const range = req.headers.range
        if (range) {
          const parts = range.replace(/bytes=/, '').split('-')
          const start = parseInt(parts[0], 10)
          const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1
          res.statusCode = 206
          res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`)
          res.setHeader('Content-Length', end - start + 1)
          fs.createReadStream(full, { start, end }).pipe(res)
          return
        }
        res.setHeader('Content-Length', stat.size)
        fs.createReadStream(full).pipe(res)
      })
    },
    closeBundle() {
      if (!fs.existsSync(videosDir)) return
      const outDir = path.resolve(__dirname, 'dist', 'videos')
      fs.mkdirSync(outDir, { recursive: true })
      for (const file of fs.readdirSync(videosDir)) {
        fs.copyFileSync(path.join(videosDir, file), path.join(outDir, file))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveLocalVideos()],
  server: {
    proxy: {
      '/backend-media': {
        target: process.env.VITE_API_URL || 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend-media/, ''),
      },
    },
  },
})
