import { createReadStream, existsSync, promises as fs } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const docsRoot = path.join(repoRoot, "docs");
const assetRoot = path.join(repoRoot, ".github", "pr-assets");
const port = 4173;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

function serveFile(req, res) {
  const requestPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  const filePath = path.normalize(path.join(docsRoot, relativePath));

  if (!filePath.startsWith(docsRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const finalPath = existsSync(filePath) ? filePath : path.join(docsRoot, "index.html");
  const ext = path.extname(finalPath).toLowerCase();
  res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
  createReadStream(finalPath).pipe(res);
}

async function captureAssets() {
  await fs.mkdir(assetRoot, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1480, height: 1120 },
    colorScheme: "light"
  });
  const page = await context.newPage();
  const baseUrl = `http://127.0.0.1:${port}`;

  const settle = async () => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(400);
  };

  await page.goto(baseUrl);
  await page.locator("#heroStats .stat-chip").first().waitFor();
  await settle();
  await page.screenshot({
    path: path.join(assetRoot, "start-here.png"),
    fullPage: true
  });

  await page.click('.nav-btn[data-target="readingsView"]');
  await page.locator("#readingIndex .index-card").nth(2).click();
  await page.locator("#readingDetail .reading-section-map .chip-button").nth(1).click();
  await page.locator("#readingDetail .reading-passage-list .index-card").first().click();
  await settle();
  await page.screenshot({
    path: path.join(assetRoot, "readings.png"),
    fullPage: true
  });

  await page.click('.nav-btn[data-target="quizView"]');
  await page.click("#startQuizBtn");
  await page.locator(".answer-btn").first().click();
  await page.locator(".feedback-box").waitFor();
  await settle();
  await page.screenshot({
    path: path.join(assetRoot, "quiz-review.png"),
    fullPage: true
  });

  await page.click('.nav-btn[data-target="guideView"]');
  await page.fill("#guideSearchInput", "Cicero");
  await page.locator("#guideSearchResults .index-card").first().waitFor();
  await settle();
  await page.screenshot({
    path: path.join(assetRoot, "full-guide.png"),
    fullPage: false
  });

  await context.close();
  await browser.close();
}

const server = http.createServer(serveFile);

server.listen(port, "127.0.0.1", async () => {
  try {
    await captureAssets();
    console.log(`Captured PR assets in ${assetRoot}`);
    server.close(() => process.exit(0));
  } catch (error) {
    console.error(error);
    server.close(() => process.exit(1));
  }
});
