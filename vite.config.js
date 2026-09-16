import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/satudata": {
        target: "https://satudata-api.garutkab.go.id",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/satudata/, ""),
      },
      "/dataid": {
        target: "https://data.go.id",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dataid/, ""),
      },
      "/fonnte-api": {
        target: "https://api.fonnte.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fonnte-api/, ""),
      },
    },
  },
  preview: {
    proxy: {
      "/satudata": {
        target: "https://satudata-api.garutkab.go.id",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/satudata/, ""),
      },
      "/dataid": {
        target: "https://data.go.id",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dataid/, ""),
      },
      "/fonnte-api": {
        target: "https://api.fonnte.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fonnte-api/, ""),
      },
    },
  },
  plugins: [
    react(),
  ]
});
