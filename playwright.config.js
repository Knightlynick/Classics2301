module.exports = {
  testDir: "./scripts",
  testMatch: /playwright-smoke\.spec\.js$/,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:8765",
    browserName: "chromium",
    headless: true,
    viewport: { width: 1440, height: 1100 },
  },
  webServer: {
    command: "py -m http.server 8765 --directory docs",
    port: 8765,
    reuseExistingServer: true,
    timeout: 30_000,
  },
};
