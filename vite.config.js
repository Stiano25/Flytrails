import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Express API (see npm run dev:server). Relative /api/* requests need this in dev and preview. */
const apiProxy = {
  '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true },
};

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'client'),
  envDir: __dirname,
  build: {
    outDir: path.resolve(__dirname, 'client/dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animations: ['framer-motion'],
        },
      },
    },
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 5173,
    /** Required for ngrok (and similar) to forward to the dev server */
    host: true,
    /** Allow ngrok free tier hostnames (subdomain changes when tunnel restarts) */
    allowedHosts: ['.ngrok-free.dev', 'localhost', '.localhost', '127.0.0.1'],
    proxy: apiProxy,
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: ['.ngrok-free.dev', 'localhost', '.localhost', '127.0.0.1'],
    proxy: apiProxy,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
});
