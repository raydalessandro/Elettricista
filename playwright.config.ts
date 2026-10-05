import { defineConfig } from "@playwright/test";

/* Prove col dito su un telefono 390×844, contro la build di produzione.
   In locale, se i browser di Playwright non sono scaricati: PW_CHROMIUM=/percorso/chromium. */
const executablePath = process.env.PW_CHROMIUM || undefined;
const PORT = Number(process.env.PORT || 3100);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    browserName: "chromium",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    launchOptions: executablePath ? { executablePath } : {},
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
