const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { startStaticServer } = require('./static-server.cjs');

(async () => {
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('requestfailed', request => failedRequests.push(`${request.url()} ${request.failure()?.errorText || ''}`));

    for (const viewport of [
      { width: 320, height: 568 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(`${server.origin}/services/ai-receptionist-small-business/`, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      assert.equal(overflow, false, `No horizontal overflow at ${viewport.width}px`);
      assert.equal(await page.locator('h1').textContent(), 'Cover missed calls without hiding the handoff.');
      assert.equal(await page.locator('.content-table tbody tr').count(), 3);
      assert.ok(await page.locator('a[href="/services/local-ai-systems/#fit-request"]').count() >= 1);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${server.origin}/services/ai-receptionist-small-business/`, { waitUntil: 'networkidle' });
    await page.click('button[type="submit"]');
    await page.locator('#calculator-result').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#weekly-estimate').textContent(), '$375/week');
    assert.match(await page.locator('#monthly-estimate').textContent(), /\$1,624\/month/);
    assert.match(await page.locator('#breakeven-estimate').textContent(), /13 otherwise-missed booked calls/);
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(failedRequests, []);
    await context.close();
    console.log('AI receptionist browser flow passed at 320, 390, 768, and 1440 pixels.');
  } finally {
    await browser.close();
    await server.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
