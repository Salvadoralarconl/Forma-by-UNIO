import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { port: 1420, strictPort: true, host: '127.0.0.1' },
  test: { environment: 'jsdom', include: ['tests/**/*.test.{ts,tsx}'], css: false },
  clearScreen: false,
});
