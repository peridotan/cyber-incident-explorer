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
  await expect(page.locator('#stepPosition')).toContainText('開始前');
});


for (const size of sizes.filter(x => x.width < 1920)) {
  for (const theme of themes) {
    test(`blocked AI legend: ${size.width} / 120% / ${theme}`, async ({ page }, testInfo) => {
      await page.setViewportSize(size);
      await openApp(page, 'ai');
      await page.locator('#themeSelect').selectOption(theme);
      await page.locator('#fontSizeSelect').selectOption('lg');
      await page.locator('#appearanceButton').click();
      const toggle = page.locator('#defenseControls [role="switch"]').first();
      await expect(toggle).toHaveAttribute('aria-checked', 'false');
      await toggle.click();
      await expect(page.locator('#defenseControls [role="switch"]').first()).toHaveAttribute('aria-checked', 'true');
      for (let step = 0; step < 6; step++) await page.locator('#nextButton').click();
      const measurements = await page.evaluate(() => {
        const parent = document.querySelector('.diagram-topline').getBoundingClientRect();
        const hint = document.querySelector('#modeHint');
        const bounds = hint.getBoundingClientRect();
        return {
          hintText: hint.textContent.trim(),
          width: document.documentElement.scrollWidth,
          available: document.documentElement.clientWidth,
          clipped: bounds.right > parent.right + 2 || bounds.left < parent.left - 2 ||
            bounds.bottom > parent.bottom + 2 || hint.scrollWidth > hint.clientWidth + 2
        };
      });
      await page.screenshot({path: testInfo.outputPath(`blocked-${size.width}-${theme}.png`), fullPage: true});
      expect(measurements.hintText).toContain('遮断：');
      expect(measurements.clipped).toBe(false);
      expect(measurements.width).toBeLessThanOrEqual(measurements.available + 2);
    });
  }
}


for (const scenario of ['ransomware-direct', 'ransomware-email']) {
  test(`write ACL keeps past access red but marks encryption write rejected: ${scenario}`, async ({ page }, testInfo) => {
    await page.goto(url);
    await page.locator('#scenarioSelect').selectOption(scenario);
    const acl = page.getByRole('switch', { name: /共有ファイル書込制限/ });
    await acl.click();
    await expect(page.getByRole('switch', { name: /共有ファイル書込制限/ })).toHaveAttribute('aria-checked', 'true');
    for (let step = 0; step < 6; step++) await page.locator('#nextButton').click();

    const server = page.locator('#architectureDiagram [data-device="files"]');
    await expect(server).toHaveClass(/afflicted/); // Historical read access remains visible.
    await expect(server.locator('.asset-status')).toContainText('書込拒否');
    await expect(page.locator('#fileImpactMarker')).toBeVisible();
    await expect(page.locator('#fileImpactMarker')).toHaveClass(/safe/);
    await expect(page.locator('#fileImpactMarker text')).toContainText('暗号化阻止');
    await expect(page.locator('#fileImpactMarker')).toHaveAttribute('aria-label', /書込権限不足/);
    await expect(page.locator('#outcomeText')).toContainText('情報流出');
    await page.screenshot({path: testInfo.outputPath(`write-acl-${scenario}.png`), fullPage: true});
  });
}


for (const viewport of [{width: 1280,height: 720},{width: 1366,height: 768}]) {
  test(`all ten scenarios distinguish node status from route status: ${viewport.width}`, async ({page},testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto(url);
    await page.locator('#appearanceButton').click();
    await page.locator('#fontSizeSelect').selectOption('lg');
    await page.locator('#appearanceButton').click();
    const values = await page.locator('#scenarioSelect option').evaluateAll(options => options.map(option => option.value));
    expect(values).toHaveLength(10);
    for (const value of values) {
      await page.locator('#scenarioSelect').selectOption(value);
      await page.locator('#nextButton').click();
      const hint = page.locator('#modeHint');
      await expect(hint).toContainText('機器の赤＝不正な事象・影響');
      await expect(hint).toContainText('緑×＝遮断');
      const nodes = await page.locator('#architectureDiagram [data-device].afflicted').count();
      if (nodes > 0) {
        const label = await page.locator('#architectureDiagram [data-device].afflicted').first().getAttribute('aria-label');
        expect(label).toContain('機器の感染を意味しません');
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(2);
    }
    await page.screenshot({path: testInfo.outputPath(`state-semantics-${viewport.width}.png`), fullPage: true});
  });
}
