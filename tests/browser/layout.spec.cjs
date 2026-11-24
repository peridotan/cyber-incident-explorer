const { test, expect } = require('@playwright/test');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const url = pathToFileURL(resolve(__dirname, '../../index.html')).href;
const sizes = [
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
];
const themes = ['dark', 'slate', 'violet', 'forest', 'light'];
const fonts = ['md', 'lg'];

async function openApp(page, scenario) {
  await page.goto(url);
  await expect(page.locator('#scenarioSelect')).toBeVisible();
  await page.locator('#scenarioSelect').selectOption(scenario);
  await expect(page.locator('#architectureDiagram')).toBeVisible();
  await page.locator('#appearanceButton').click();
}

for (const size of sizes) {
  for (const font of fonts) {
    for (const theme of themes) {
      test(`diagram labels: ${size.width}x${size.height} / ${font} / ${theme}`, async ({ page }, testInfo) => {
        await page.setViewportSize(size);
        await openApp(page, 'ai');
        await page.locator('#themeSelect').selectOption(theme);
        await page.locator('#fontSizeSelect').selectOption(font);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expect(page.locator('.diagram-topline')).toBeVisible();

        const measurements = await page.evaluate(() => {
          const visible = el => {
            const style = getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && el.getClientRects().length > 0;
          };
          const topline = document.querySelector('.diagram-topline');
          const labels = [document.querySelector('.mode-hint'), ...document.querySelectorAll('.diagram-topline .legend span')].filter(el => el && visible(el));
          const container = topline.getBoundingClientRect();
          const issues = [];
          for (const label of labels) {
            const rect = label.getBoundingClientRect();
            if (rect.left < container.left - 2 || rect.right > container.right + 2 || rect.top < container.top - 2 || rect.bottom > container.bottom + 2) {
              issues.push(`out-of-topline: ${label.textContent.trim().slice(0,80)}`);
            }
            if (label.scrollWidth > label.clientWidth + 2) {
              issues.push(`clipped-text: ${label.textContent.trim().slice(0,80)}`);
            }
          }
          return {
            issues,
            pageWidth: document.documentElement.scrollWidth,
            viewportWidth: document.documentElement.clientWidth,
            labels: labels.map(el => el.textContent.trim()),
          };
        });

        await page.screenshot({ path: testInfo.outputPath(`diagram-${size.width}-${font}-${theme}.png`), fullPage: true });
        expect(measurements.labels.length).toBeGreaterThan(0);
        expect(measurements.pageWidth).toBeLessThanOrEqual(measurements.viewportWidth + 2);
        expect(measurements.issues).toEqual([]);
      });
    }
  }
}

test('all ten scenarios load without browser errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(url);
  const options = await page.locator('#scenarioSelect option').evaluateAll(items => items.map(el => el.value));
  expect(options).toHaveLength(10);
  for (const option of options) {
    await page.locator('#scenarioSelect').selectOption(option);
    await expect(page.locator('#architectureDiagram')).toBeVisible();
    await expect(page.locator('#nextButton')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('phishing final step and restart', async ({ page }, testInfo) => {
  await page.goto(url);
  await page.locator('#scenarioSelect').selectOption('phishing');
  for (let i = 0; i < 6; i++) {
    await page.locator('#nextButton').click();
  }
  await expect(page.locator('#stepPosition')).toContainText('06');
  await page.screenshot({ path: testInfo.outputPath('phishing-step-06.png'), fullPage: true });
  await page.locator('#transportAdvanced').evaluate(el => { el.open = true; });
  await page.locator('#restartButton').click();
  await expect(page.locator('#stepPosition')).toContainText('01');
});
