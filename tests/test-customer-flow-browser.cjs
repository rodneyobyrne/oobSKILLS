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

    await page.goto(`${server.origin}/assessments/customer-flow-review/`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('h1').textContent(), 'Find where your customer information should actually live.');
    assert.equal(await page.locator('#progress-label').textContent(), 'Step 1 of 4');
    assert.equal(await page.locator('input[required], textarea[required], select[required]').count() > 15, true);

    await page.fill('#business-name', 'High Country Service');
    await page.fill('#role', 'Owner');
    await page.selectOption('#relationship-model', 'field');
    await page.check('input[name="sensitiveData"][value="no"]');
    await page.selectOption('#existing-system', 'sheets');
    await page.selectOption('#record-quality', 'weak');
    await page.click('#next-step');
    assert.equal(await page.locator('#progress-label').textContent(), 'Step 2 of 4');

    await page.selectOption('#primary-channel', 'phone');
    await page.selectOption('#first-capture', 'inbox');
    await page.fill('#customer-step', 'The office manager returns the call, copies the customer into a spreadsheet, prepares an estimate, schedules a crew and later re-enters invoice details.');
    await page.selectOption('#retyping', 'frequent');
    await page.selectOption('#followup', 'missed');
    await page.selectOption('#conversation-history', 'inbox');
    await page.click('#next-step');
    assert.equal(await page.locator('#progress-label').textContent(), 'Step 3 of 4');

    await page.selectOption('#source-ownership', 'unclear');
    await page.selectOption('#sheets-role', 'central');
    await page.selectOption('#integration', 'manual');
    await page.selectOption('#accounting-as-crm', 'yes');
    await page.selectOption('#access-readiness', 'ready');
    await page.click('#next-step');
    assert.equal(await page.locator('#progress-label').textContent(), 'Step 4 of 4');

    await page.selectOption('#pain-point', 'admin');
    await page.selectOption('#change-timing', 'offseason');
    await page.check('input[name="willingness"][value="yes"]');
    await page.fill('#success-meaning', 'Anyone can see the customer, estimate, job status and next action without checking a spreadsheet, phone and accounting system.');
    await page.check('#review-boundary');
    await page.click('#create-result');

    await page.locator('#review-result').waitFor({ state: 'visible' });
    assert.match(await page.locator('.result-verdict h3').textContent(), /Move job-based operations/);
    assert.match(await page.locator('#result-content').textContent(), /Jobber is one candidate/);
    assert.match(await page.locator('#result-content').textContent(), /Google Sheets/);
    assert.match(await page.locator('#result-content').textContent(), /Do not solve the wrong problem first/);

    const downloadPromise = page.waitForEvent('download');
    await page.click('#download-result');
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), 'high-country-service-customer-flow-workfile.md');
    assert.ok(await download.path());

    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.inputValue('#business-name'), 'High Country Service');
    assert.equal(await page.inputValue('#relationship-model'), 'field');

    for (const width of [320, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${server.origin}/assessments/customer-flow-review/`, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      assert.equal(overflow, false, `No horizontal overflow at ${width}px`);
    }

    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto(`${server.origin}/assessments/customer-flow-review/`, { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim() }));
    assert.equal(focused.tag, 'A');
    assert.equal(focused.text, 'Skip to content');

    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(failedRequests, []);
    console.log('Customer Flow browser journey: 20+ assertions passed at four viewport widths.');
    await context.close();
  } finally {
    await browser.close();
    await server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
