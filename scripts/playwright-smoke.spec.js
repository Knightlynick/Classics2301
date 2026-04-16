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
  await expect(page.locator("#timelineEventList .timeline-event-card").first()).toBeVisible();
  await expect(page.locator("#timelineDetail h3").first()).toBeVisible();

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
  await expect(page.locator("#readingDetail .reading-source-card")).toHaveCount(2);
  await expect(page.locator("#readingDetail .reading-section-map .chip-button")).toHaveCount(4);
  await page.locator("#readingDetail .reading-section-map .chip-button").nth(1).click();
  await expect(page.locator("#readingDetail .reading-section-card h4")).toBeVisible();
  await page.locator("#readingDetail .reading-passage-list .index-card").first().click();
  await expect(page.locator("#readingDetail .reading-passage-detail")).toBeVisible();

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
  const firstPrompt = await page.locator(".question-title").textContent();
  const firstChoices = await page.locator(".answer-btn").allTextContents();
  await page.locator(".answer-btn").first().click();
  await expect(page.locator(".feedback-box")).toBeVisible();
  await expect(page.locator('.feedback-box .ghost-btn').first()).toBeVisible();
  await page.click('[data-action="end-quiz"]');
  await page.click("#startQuizBtn");
  await expect(page.locator(".question-title")).toBeVisible();
  const secondPrompt = await page.locator(".question-title").textContent();
  const secondChoices = await page.locator(".answer-btn").allTextContents();
  expect(
    firstPrompt !== secondPrompt || JSON.stringify(firstChoices) !== JSON.stringify(secondChoices)
  ).toBeTruthy();

  await page.click('.nav-btn[data-target="guideView"]');
  await expect(page.locator(".guide-reader")).toBeVisible();
  await page.fill("#guideSearchInput", "Cicero");
  await expect(page.locator("#guideSearchResults .index-card").first()).toBeVisible();

  expect(issues).toEqual([]);
});

test("study app remains usable on a phone-sized viewport", async ({ page }) => {
  const issues = [];
  page.on("pageerror", (error) => issues.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") {
      issues.push(`console: ${message.text()}`);
    }
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator("#timelineEventList .timeline-event-card").first()).toBeVisible();
  await page.click('.nav-btn[data-target="quizView"]');
  await page.click("#startQuizBtn");
  await expect(page.locator(".question-title")).toBeVisible();
  await page.click('.nav-btn[data-target="guideView"]');
  await expect(page.locator(".guide-reader")).toBeVisible();

  expect(issues).toEqual([]);
});
