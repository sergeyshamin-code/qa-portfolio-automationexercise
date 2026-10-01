import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './ui-tests/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    // Extra machine-readable output in CI only, parsed into the GitHub
    // Actions job summary (see scripts/write-job-summary.js) — local runs
    // are unaffected.
    ...(process.env.CI ? ([['json', { outputFile: 'playwright-report/results.json' }]] as const) : []),
  ],
  use: {
    baseURL: process.env.AE_BASE_URL ?? 'https://automationexercise.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
