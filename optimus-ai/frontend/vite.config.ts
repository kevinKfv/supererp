import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // Necesario para Docker
    port: 5173,
    allowedHosts: true, // Permite peticiones desde la red Docker o proxy inverso
    proxy: {
      // En Docker usa GATEWAY_URL (http://gateway-service:8000). En local usa http://localhost:8000
      '/api': {
        target: process.env.GATEWAY_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
