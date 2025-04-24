import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cookieApiPlugin } from './src/vite-plugin-cookie-api';

// https://vitejs.dev/config/
export default defineConfig({
  // Build optimizations
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion'],
          utils: ['axios']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  plugins: [
    react()
    // Disable the cookie API plugin since we're using the standalone API server
    // cookieApiPlugin()
  ],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
