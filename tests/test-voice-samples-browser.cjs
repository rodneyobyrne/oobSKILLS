const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { startStaticServer } = require('./static-server.cjs');

(async () => {
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });

  try {
    for (const viewport of [
      { width: 320, height: 568 },
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
        const isExpectedMediaCancel = request.url().endsWith('.mp3') && request.failure()?.errorText === 'net::ERR_ABORTED';
        if (!isExpectedMediaCancel) failedRequests.push(request.url());
      });

      await page.goto(`${server.origin}/voice-agent/`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.voice-card').count(), 11, `All samples render at ${viewport.width}px`);
      assert.equal(await page.locator('.voice-play').count(), 11, `All play controls render at ${viewport.width}px`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1), false, `No horizontal overflow at ${viewport.width}px`);

      if (viewport.width === 320) {
        const sources = await page.locator('.voice-card audio').evaluateAll((players) => players.map((player) => player.src));
        for (const source of sources) {
          const response = await page.request.get(source);
          assert.equal(response.ok(), true, `${source} returns successfully`);
          assert.match(response.headers()['content-type'], /^audio\/mpeg\b/, `${source} is served as MP3 audio`);
        }
      }

      await page.locator('.voice-play').first().focus();
      assert.equal(await page.locator('.voice-play').first().evaluate((button) => button.matches(':focus')), true, 'Play control receives keyboard focus');

      const firstButton = page.locator('.voice-play').nth(0);
      const secondButton = page.locator('.voice-play').nth(1);
      await firstButton.click();
      await page.waitForFunction(() => document.querySelector('.voice-play').getAttribute('aria-pressed') === 'true');
      assert.equal(await firstButton.getAttribute('aria-pressed'), 'true', 'First sample exposes its playing state');
      assert.equal(await page.locator('#voice-01').evaluate((audio) => !audio.paused), true, 'First sample is audibly playing');

      await secondButton.click();
      await page.waitForFunction(() => document.querySelectorAll('.voice-play')[1].getAttribute('aria-pressed') === 'true');
      assert.equal(await page.locator('#voice-01').evaluate((audio) => audio.paused && audio.currentTime === 0), true, 'Starting a new sample stops and resets the previous sample');
      assert.equal(await secondButton.getAttribute('aria-pressed'), 'true', 'Second sample exposes its playing state');
      await secondButton.click();
      assert.equal(await page.locator('#voice-02').evaluate((audio) => audio.paused), true, 'The active sample can be paused');

      assert.deepEqual(consoleErrors, []);
      assert.deepEqual(failedRequests, []);
      await context.close();
    }

    console.log('Voice samples passed at 320, 768, and 1440 pixels.');
  } finally {
    await browser.close();
    await server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
