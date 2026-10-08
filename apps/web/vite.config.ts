import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  server: {
    port: 5173,
    // Same-origin /api in development, mirroring the Vercel rewrite in production,
    // so the refresh-token cookie is first-party.
    proxy: {
      '/api': { target: process.env.VITE_DEV_API_PROXY ?? 'http://localhost:4000', changeOrigin: true },
    },
  },
});
