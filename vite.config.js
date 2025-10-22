import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Carrying-Capacity',
  plugins: [react(), tailwindcss()],
  build: {
    // Enable source maps for staging/preview builds
    sourcemap: process.env.NODE_ENV !== 'production',
    // Enable code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'force-graph': ['react-force-graph-2d'],
        },
      },
    },
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production', // Remove console logs in production only
        drop_debugger: true,
      },
    },
    // Increase chunk size warning threshold
    chunkSizeWarningLimit: 1000,
  },
  // Optimize development
  server: {
    hmr: {
      overlay: process.env.VITE_HMR_OVERLAY !== 'false', // Enable error overlay by default, can be disabled via env
    },
  },
  // Optimize asset handling
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg'],
})
