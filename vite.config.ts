import { defineConfig } from 'vitest/config';

export default defineConfig({
  optimizeDeps: {
    entries: ['index.html'],
  },
  test: {
    exclude: ['**/.backup/**', '**/node_modules/**', '**/dist/**'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
