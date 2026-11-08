import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5173'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: [
    {
      command: 'npm run start:e2e',
      cwd: fileURLToPath(new URL('../backend/', import.meta.url)),
      url: 'http://127.0.0.1:4000/health',
      reuseExistingServer: false,
      timeout: 30_000
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
      url: 'http://127.0.0.1:5173',
      env: { API_URL: 'http://127.0.0.1:4000' },
      reuseExistingServer: false,
      timeout: 30_000
    }
  ]
});
