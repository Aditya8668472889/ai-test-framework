import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load .env BEFORE defineConfig runs, so process.env.BASE_URL is available below.
dotenv.config();

export default defineConfig({
  // Directory where your tests live
  testDir: './tests',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build if you accidentally left test.only in source
  forbidOnly: !!process.env.CI,

  // Retry failed tests once on CI
  retries: process.env.CI ? 1 : 0,

  // Reporter - shows results in terminal + generates HTML report
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // Base URL from .env (fallback keeps the suite runnable with no .env).
    // Pages call goto('/') and inherit this host.
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',

    // Record trace on first retry - helps debug failures
    trace: 'on-first-retry',

    // Run in headless mode (no browser window)
    headless: true,
  },

  // Only Chromium for now
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
