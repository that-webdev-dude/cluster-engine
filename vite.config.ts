import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    entries: ['index.html'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
