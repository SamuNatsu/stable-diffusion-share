/// Vite config
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Export config
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src/'
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
