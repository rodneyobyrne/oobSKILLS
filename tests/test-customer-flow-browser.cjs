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
    assert.equal(await page.locator('h1').textContent(), 'Is your business outgrowing its systems?');
    assert.equal(await page.locator('#progress-label').textContent(), 'Step 1 of 5');
    assert.match(await page.locator('main').textContent(), /No software pitch/);

    await page.fill('#business-name', 'High Country Service');
    for (const channel of ['phone', 'email', 'website', 'text', 'google']) {
      await page.check(`input[name="contactChannels"][value="${channel}"]`);
    }
    await page.selectOption('#response-confidence', 'depends');
    await page.selectOption('#missed-call', 'depends');
    await page.click('#next-step');
    assert.equal(await page.locator('#progress-label').textContent(), 'Step 2 of 5');

    for (const place of ['crm', 'email', 'texts', 'sheets']) {
      await page.check(`input[name="infoPlaces"][value="${place}"]`);
    }
    await page.selectOption('#history-ease', 'couple');
    await page.check('input[name="familiarPhrase"][value="talked"]');
    await page.click('#next-step');
    assert.equal(await page.locator('#progress-label').textContent(), 'Step 3 of 5');

    for (const id of ['task-copy', 'task-reenter', 'task-check', 'task-remind', 'task-tell', 'task-voicemail', 'task-messages', 'task-contacted', 'task-lookup', 'task-reschedule']) {
      await page.selectOption(`#${id}`, 'weekly');
    }
    await page.selectOption('#admin-time', 'four8');
    await page.click('#next-step');
    assert.equal(await page.locator('#progress-label').textContent(), 'Step 4 of 5');

    for (const tool of ['phone', 'accounting', 'docs', 'website', 'spreadsheets']) {
      await page.check(`input[name="toolCategories"][value="${tool}"]`);
    }
    await page.fill('#product-names', 'Google Workspace, QuickBooks, Google Sheets');
    await page.selectOption('#tool-feeling', 'added');
    for (const change of ['customers', 'employees', 'inquiries']) {
      await page.check(`input[name="growthChanges"][value="${change}"]`);
    }
    await page.selectOption('#pace-match', 'little');
    await page.click('#next-step');
    assert.equal(await page.locator('#progress-label').textContent(), 'Step 5 of 5');

    for (const priority of ['missed', 'admin', 'existing']) {
      await page.check(`input[name="improvementPriorities"][value="${priority}"]`);
    }
    assert.match(await page.locator('#priority-help').textContent(), /3 of 3 selected/);
    await page.click('input[name="improvementPriorities"][value="systems"]');
    assert.equal(await page.locator('input[name="improvementPriorities"][value="systems"]').isChecked(), false);

    await page.selectOption('#year-concern', 'time');
    await page.selectOption('#change-timing', 'one3');
    await page.selectOption('#slow-period', 'winter');
    await page.check('#review-boundary');
    await page.click('#create-result');

    await page.locator('#review-result').waitFor({ state: 'visible' });
    assert.match(await page.locator('.result-verdict h3').textContent(), /Successful but Stretched/);
    assert.match(await page.locator('#result-content').textContent(), /Did someone already talk to them/);
    assert.match(await page.locator('#result-content').textContent(), /4–8 hours/);
    assert.match(await page.locator('#result-content').textContent(), /We don't have a favorite system/);
    assert.match(await page.locator('#result-content').textContent(), /You shouldn't have to become an AI expert/);
    assert.match(await page.locator('#result-content').textContent(), /Review My Customer Flow/);
    assert.equal(await page.locator('.health-card').count(), 5);

    const downloadPromise = page.waitForEvent('download');
    await page.click('#download-result');
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), 'high-country-service-customer-flow-health.md');
    assert.ok(await download.path());

    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.inputValue('#business-name'), 'High Country Service');
    assert.equal(await page.locator('input[name="contactChannels"]:checked').count(), 5);

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
    console.log('Customer Flow self-recognition browser journey: 25+ assertions passed at four viewport widths.');
    await context.close();
  } finally {
    await browser.close();
    await server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
