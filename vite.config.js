import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: true
  },
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    hmr: {
      clientPort: 443,
    },
    allowedHosts: [
      "5174-ip89hvi7s2p1568hcypen-8f0432e7.manusvm.computer"
    ]
  }
})
