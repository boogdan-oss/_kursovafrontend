/// <reference types="vitest" />
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiTarget =
    process.env.VITE_API_PROXY_TARGET ?? env.VITE_API_PROXY_TARGET ?? 'http://localhost:8000'

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/ws': { target: apiTarget.replace(/^http/, 'ws'), ws: true, changeOrigin: true },
        '/docs': { target: apiTarget, changeOrigin: true },
        '/openapi.json': { target: apiTarget, changeOrigin: true },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      globals: true,
    },
  }
})
