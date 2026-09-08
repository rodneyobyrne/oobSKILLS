const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { startStaticServer } = require('./static-server.cjs');

const industries = [
  'construction',
  'home-services',
  'property-management',
  'legal',
  'healthcare',
  'financial-services',
];

(async () => {
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });

  try {
    for (const viewport of [
      { width: 320, height: 568 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const consoleErrors = [];
      const failedRequests = [];

      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('requestfailed', (request) => {
        failedRequests.push(`${request.url()} ${request.failure()?.errorText || ''}`);
      });

      for (const industry of industries) {
        await page.goto(`${server.origin}/voice-agent/${industry}/`, { waitUntil: 'networkidle' });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
        assert.equal(overflow, false, `${industry} has no horizontal overflow at ${viewport.width}px`);
        assert.equal(await page.locator('h1').count(), 1, `${industry} has one H1`);
        assert.equal(await page.locator('.situation-card').count(), 4, `${industry} has four call situations`);
        assert.equal(await page.locator('.plan').count(), 3, `${industry} has three pricing plans`);
        assert.ok(await page.locator('a[href="tel:9704048398"]').count() >= 3, `${industry} keeps call actions visible`);

        const lastDetails = page.locator('.faq details').last();
        await lastDetails.locator('summary').focus();
        await page.keyboard.press('Enter');
        assert.equal(await lastDetails.getAttribute('open'), '', `${industry} FAQ opens from keyboard`);
      }

      assert.deepEqual(consoleErrors, [], `No console errors expected at ${viewport.width}px`);
      assert.deepEqual(failedRequests, [], `No failed requests expected at ${viewport.width}px`);
      await context.close();
    }

    console.log('Voice-agent industry pages passed at 320, 390, 768, and 1440 pixels.');
  } finally {
    await browser.close();
    await server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

