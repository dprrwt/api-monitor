import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const isDemo = !!process.env.DEMO;

export default defineConfig({
  plugins: [react()],
  base: isDemo ? '/api-monitor/' : '/',
  resolve: isDemo ? {
    alias: {
      './api': path.resolve(__dirname, 'src/api-demo.js'),
    },
  } : {},
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
