import { defineConfig, devices } from '@playwright/test';

/**
 * Carrega variáveis de ambiente do .env (nativo do Node >= 20.12).
 * Em CI o arquivo pode não existir: as variáveis vêm do ambiente.
 */
try {
  process.loadEnvFile('.env');
} catch {
  // .env ausente — segue com as variáveis já definidas no ambiente
}

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';
/** Só sobe o qa-lab-app quando o alvo é local; com BASE_URL remota, testa o ambiente informado. */
const isLocalTarget = /localhost|127\.0\.0\.1/.test(baseURL);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Reset do app uma única vez, antes da suíte (ver tests/global-setup.ts) */
  globalSetup: require.resolve('./tests/global-setup'),
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Sobe o qa-lab-app antes dos testes (reaproveita se já estiver rodando localmente) */
  webServer: isLocalTarget
    ? {
        command: 'npm start --prefix qa-lab-app',
        url: new URL('/api/health', baseURL).toString(),
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      }
    : undefined,
});
