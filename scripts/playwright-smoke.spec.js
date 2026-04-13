const { test, expect } = require("@playwright/test");

test("study app renders each surface and core interactions", async ({ page }) => {
  const issues = [];
  page.on("pageerror", (error) => issues.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") {
      issues.push(`console: ${message.text()}`);
    }
  });

  await page.goto("/");
  await expect(page.locator("#heroStats .stat-chip")).toHaveCount(4);

  const views = [
    ["startView", "Start Here"],
    ["weeksView", "Weeks"],
    ["readingsView", "Readings"],
    ["glossaryView", "Glossary"],
    ["quizView", "Quiz"],
    ["guideView", "Full Guide"]
  ];

  for (const [viewId, label] of views) {
    await page.click(`.nav-btn[data-target="${viewId}"]`);
    await expect(page.locator(`#${viewId}`)).toBeVisible();
    await expect(page.locator(`.nav-btn.is-active[data-target="${viewId}"]`)).toContainText(label);
  }

  await page.click('.nav-btn[data-target="weeksView"]');
  await expect(page.locator("#weekModules .module-card").first()).toBeVisible();
  await expect(page.locator("#weekModules .module-card")).toHaveCount(12);

  await page.click('.nav-btn[data-target="readingsView"]');
  await expect(page.locator("#readingIndex .index-card")).toHaveCount(5);
  await page.locator("#readingIndex .index-card").nth(1).click();
  await expect(page.locator("#readingDetail h3").first()).toBeVisible();

  await page.click('.nav-btn[data-target="glossaryView"]');
  await page.fill("#glossarySearchInput", "hubris");
  await expect(page.locator(".glossary-row")).toHaveCount(1);
  await page.locator(".glossary-row").click();
  await expect(page.locator("#glossaryInspector h3")).toContainText("hubris", {
    ignoreCase: true,
  });

  await page.click('.nav-btn[data-target="quizView"]');
  await page.click("#startQuizBtn");
  await expect(page.locator(".question-title")).toBeVisible();
  await page.locator(".answer-btn").first().click();
  await expect(page.locator(".feedback-box")).toBeVisible();

  await page.click('.nav-btn[data-target="guideView"]');
  await expect(page.locator("#guideContent .guide-section").first()).toBeVisible();
  await page.fill("#guideSearchInput", "Cicero");
  await expect(page.locator("#guideSearchResults .index-card").first()).toBeVisible();

  expect(issues).toEqual([]);
});
