const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { startStaticServer } = require('./static-server.cjs');

(async () => {
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('requestfailed', req => failedRequests.push(`${req.url()} ${req.failure()?.errorText || ''}`));

    for (const viewport of [
      { width: 320, height: 568 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
      { width: 1720, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(`${server.origin}/`, { waitUntil: 'networkidle' });
      const state = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        cards: document.querySelectorAll('.review-path-card').length,
        fronts: document.querySelectorAll('.review-path-card__front').length,
        backs: document.querySelectorAll('.review-path-card__back').length,
        legacy: document.querySelectorAll('[data-review-carousel], .review-option, .review-stage').length,
        heroSrc: document.querySelector('.hero-art__image')?.getAttribute('src'),
        ctas: document.querySelectorAll('.review-path-card__back a[href]').length,
      }));
      assert.ok(state.scrollWidth <= state.clientWidth + 2, `Homepage has no horizontal scroll at ${viewport.width}px`);
      assert.equal(state.cards, 6, 'Six pathway cards remain present at every viewport.');
      assert.equal(state.fronts, 6);
      assert.equal(state.backs, 6);
      assert.equal(state.ctas, 6);
      assert.equal(state.legacy, 0, 'Legacy selector/carousel is absent.');
      assert.equal(state.heroSrc, '/images/ai-relationship/ai-workflow-map.webp');
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${server.origin}/`, { waitUntil: 'networkidle' });
    const desktopBefore = await page.$eval('.review-path-card--workflow .review-path-card__inner', el => getComputedStyle(el).transform);
    await page.hover('.review-path-card--workflow');
    await page.waitForTimeout(600);
    const desktopAfter = await page.$eval('.review-path-card--workflow .review-path-card__inner', el => getComputedStyle(el).transform);
    assert.notEqual(desktopAfter, desktopBefore, 'Desktop hover changes the card presentation to the next-step face.');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${server.origin}/`, { waitUntil: 'networkidle' });
    const mobile = await page.$eval('.review-path-card--workflow', card => {
      const front = card.querySelector('.review-path-card__front');
      const back = card.querySelector('.review-path-card__back');
      return {
        frontPosition: getComputedStyle(front).position,
        backPosition: getComputedStyle(back).position,
        backTransform: getComputedStyle(back).transform,
        backHeight: back.getBoundingClientRect().height,
        frontHeight: front.getBoundingClientRect().height,
      };
    });
    assert.equal(mobile.frontPosition, 'relative', 'Touch layout keeps front content in normal flow.');
    assert.equal(mobile.backPosition, 'relative', 'Touch layout keeps next-step content in normal flow.');
    assert.equal(mobile.backTransform, 'none', 'Touch layout does not hide copy on the reverse side of a 3D card.');
    assert.ok(mobile.frontHeight > 0 && mobile.backHeight > 0, 'Both semantic card states are visible on mobile.');

    assert.deepEqual(consoleErrors, [], `Homepage emitted console errors: ${consoleErrors.join(' | ')}`);
    assert.deepEqual(failedRequests, [], `Homepage had failed requests: ${failedRequests.join(' | ')}`);
    console.log('Homepage six-path card browser tests passed.');
  } finally {
    await browser.close();
    await server.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
