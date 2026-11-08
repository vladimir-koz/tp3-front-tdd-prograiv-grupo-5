import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const apiUrl = process.env.API_URL ?? 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/health': apiUrl,
      '/productos': apiUrl,
      '/pedidos': apiUrl,
      '/reportes': apiUrl,
      '/__test__': apiUrl
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5 todavía usa @import y funciones de color viejas de Sass.
        quietDeps: true,
        silenceDeprecations: ['import']
      }
    }
  },
  test: {
    exclude: [...configDefaults.exclude, 'e2e/**'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
});
