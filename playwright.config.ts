import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1,
  use: { baseURL: 'http://127.0.0.1:1420', browserName: 'chromium', channel: 'chrome', viewport: { width: 1440, height: 960 }, trace: 'retain-on-failure' },
  webServer: { command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 1420', url: 'http://127.0.0.1:1420', reuseExistingServer: true, timeout: 30_000 },
});
