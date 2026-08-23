const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { startStaticServer } = require('./static-server.cjs');

(async () => {
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ acceptDownloads: true });
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
      await page.goto(`${server.origin}/audience-review/`, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      assert.equal(overflow, false, `No horizontal overflow at ${viewport.width}px`);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('.choice input').count(), 44);
      assert.equal(await page.locator('img[alt="oobCREATIVE"]').evaluate(image => image.complete && image.naturalWidth > 0), true);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${server.origin}/audience-review/`, { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').textContent(), 'Skip to Audience Review');

    await page.click('[data-next="2"]');
    assert.equal(await page.locator('#validation-summary').isVisible(), true);
    assert.equal(await page.locator('#offer').getAttribute('aria-invalid'), 'true');

    await page.fill('#offer', 'Independent business consultant');
    await page.check('[name="offer_type"][value="service"]');
    await page.click('[data-next="2"]');
    assert.equal(await page.locator('[data-step="2"]').isVisible(), true);

    const audienceAnswers = {
      audience_values: 'quality',
      audience_trigger: 'current-way-failing',
      audience_emotions: 'cautious',
      audience_needs: 'human-guidance',
      audience_hesitation: 'trust',
      audience_outcome: 'confidence',
    };
    for (const [name, value] of Object.entries(audienceAnswers)) {
      await page.check(`[name="${name}"][value="${value}"]`);
    }
    await page.click('[data-next="3"]');
    await page.check('[name="business_values"][value="quality"]');
    await page.check('[name="business_message"][value="direct"]');
    await page.click('button[type="submit"]');

    await page.locator('#results-view').waitFor({ state: 'visible' });
    assert.match(await page.locator('#results-title').textContent(), /Independent business consultant/);
    assert.equal(await page.locator('[data-copy-draft]').count(), 3);
    assert.doesNotMatch(await page.locator('#results-report').textContent(), /Quality become|Make it visible by show|helps the customer help customers/i);

    const downloadPromise = page.waitForEvent('download');
    await page.click('#download-review');
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), 'independent-business-consultant-audience-review.md');
    assert.ok(await download.path());

    await page.click('#edit-review');
    assert.equal(await page.locator('[data-step="3"]').isVisible(), true);
    assert.equal(await page.isChecked('[name="business_values"][value="quality"]'), true);

    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.inputValue('#offer'), 'Independent business consultant');
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(failedRequests, []);
    console.log('Audience Review browser flow passed at 320, 390, 768, and 1440 pixels.');
    await context.close();
  } finally {
    await browser.close();
    await server.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
