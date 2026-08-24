import { defineConfig, devices } from "@playwright/test";

const localChromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [
    [
      "html",
      {
        outputFolder:
          "/media/saad/Data/stack-and-scale-test-artifacts/playwright-report",
        open: "never",
      },
    ],
  ],
  outputDir:
    "/media/saad/Data/stack-and-scale-test-artifacts/playwright-results",
  use: {
    baseURL: "http://127.0.0.1:3000",
    launchOptions: localChromiumExecutable
      ? { executablePath: localChromiumExecutable }
      : {},
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node_modules/.bin/next start -H 127.0.0.1",
    cwd: import.meta.dirname,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: "http://127.0.0.1:3000",
  },
});
