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
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('requestfailed', (request) => failedRequests.push(`${request.url()} ${request.failure()?.errorText || ''}`));

    await page.goto(`${server.origin}/assessments/idea-to-test-review/`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('h1').textContent(), 'Turn one promising idea into a test you can actually run.');
    assert.equal(await page.locator('#progress-label').textContent(), 'Step 1 of 4');
    assert.equal(await page.locator('input[required], textarea[required], select[required]').count() > 10, true);

    await page.fill('#project-name', 'Local Follow-up Test');
    await page.fill('#role', 'Independent consultant');
    await page.check('input[name="trigger"][value="request"]');
    await page.check('input[name="protect"][value="credibility"]');
    await page.selectOption('#direction-state', 'few');
    await page.click('#next-step');
    assert.equal(await page.locator('#progress-label').textContent(), 'Step 2 of 4');

    await page.fill('#idea', 'Help local service businesses respond to missed inquiries with a human-reviewed follow-up process.');
    await page.fill('#set-aside', 'A full CRM implementation and every other business type.');
    await page.fill('#experience', 'I have observed missed inquiry follow-up in several local service settings and have direct access to owners.');
    await page.fill('#problem', 'Qualified inquiries arrive while the owner is doing client work, then receive a late or inconsistent response.');
    await page.selectOption('#evidence', 'asked');
    await page.click('#next-step');
    assert.equal(await page.locator('#progress-label').textContent(), 'Step 3 of 4');

    await page.fill('#audience', 'A local professional-service owner who receives qualified inquiries while doing client work.');
    await page.selectOption('#audience-clarity', 'named');
    await page.selectOption('#reach', 'direct');
    await page.selectOption('#buyer', 'known');
    await page.selectOption('#outcome-scope', 'bounded');
    await page.fill('#smallest-outcome', 'A reviewed follow-up map, three response drafts and one routing rule to test for two weeks.');
    await page.fill('#boundary', 'No autonomous promises, sensitive records, staff replacement or full website rebuild.');
    await page.selectOption('#proof', 'ready');
    await page.fill('#proof-detail', 'A sanitized missed-inquiry map and three annotated draft responses.');
    await page.click('#next-step');
    assert.equal(await page.locator('#progress-label').textContent(), 'Step 4 of 4');

    const future = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
    await page.selectOption('#test-type', 'paid');
    await page.selectOption('#test-size', 'five');
    await page.selectOption('#timeframe', 'twoWeeks');
    await page.fill('#decision-date', future);
    await page.fill('#invitation', 'Would you review this small follow-up pilot and decide whether it is worth testing for two weeks?');
    await page.fill('#success-signal', 'Three of five owners recognize the problem and at least one accepts a scheduled or paid next step.');
    await page.fill('#stop-condition', 'No owner recognizes the problem or the pilot requires access to sensitive records.');
    await page.check('input[name="acknowledgement"]');
    await page.click('#create-result');

    await page.locator('#review-result').waitFor({ state: 'visible' });
    assert.match(await page.locator('.result-verdict h3').textContent(), /Ready to test/);
    assert.match(await page.locator('#result-content').textContent(), /Do not build yet/);
    assert.match(await page.locator('#result-content').textContent(), /AUDIENCE CONVERSATION/);

    const downloadPromise = page.waitForEvent('download');
    await page.click('#download-result');
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), 'local-follow-up-test-idea-to-test-workfile.md');
    assert.ok(await download.path());

    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.inputValue('#project-name'), 'Local Follow-up Test');

    for (const width of [320, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${server.origin}/assessments/idea-to-test-review/`, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      assert.equal(overflow, false, `No horizontal overflow at ${width}px`);
    }

    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto(`${server.origin}/assessments/idea-to-test-review/`, { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim() }));
    assert.equal(focused.tag, 'A');
    assert.equal(focused.text, 'Skip to content');

    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(failedRequests, []);
    console.log('Idea-to-Test browser flow: 25+ assertions passed at four viewport widths.');
    await context.close();
  } finally {
    await browser.close();
    await server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
