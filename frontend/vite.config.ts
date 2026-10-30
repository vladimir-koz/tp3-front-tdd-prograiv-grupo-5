import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/health': 'http://localhost:3000',
      '/productos': 'http://localhost:3000',
      '/pedidos': 'http://localhost:3000',
      '/reportes': 'http://localhost:3000',
      '/__test__': 'http://localhost:3000'
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
});
