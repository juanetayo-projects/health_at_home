import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// El despliegue es en GitHub Pages bajo https://<usuario>.github.io/health_at_home/
// En producción la base debe ser '/health_at_home/'; en desarrollo, '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/health_at_home/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
}))
