import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Vite config for Frontend 1 — standalone dev server.
// Run from the project root: npx vite --config frontend/f1/vite.config.ts
// Or from inside frontend/f1/: npx vite
export default defineConfig({
  // Set the Vite root to this directory so index.html is found here
  root: import.meta.dirname,

  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      // Match the root vite.config.ts alias so all @/... imports resolve correctly
      '@': path.resolve(import.meta.dirname, '.'),
    },
  },

  server: {
    host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '8443'),
    strictPort: false,
    fs: {
      // Allow serving files from the whole project root (needed for node_modules etc.)
      allow: [path.resolve(import.meta.dirname, '../..')],
    },
  },

  preview: {
    host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '8443'),
  },
})
