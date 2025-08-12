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
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    hmr: {
      clientPort: 443,
    },
    allowedHosts: [
      "5174-il6ya2lavb9ipwq0lxqqi-64c33bd5.manusvm.computer"
    ]
  }
})
