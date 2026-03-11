import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    headless: false, // Open browser for user to see
    launchOptions: { slowMo: 500 }, // Slow down so it's easy to follow
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
  },

  // Start the frontend dev server automatically if it isn't running
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
