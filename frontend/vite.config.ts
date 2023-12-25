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
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  }
});
