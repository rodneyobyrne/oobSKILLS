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
        prompt: document.querySelector('.review-panel__prompt')?.textContent.trim(),
        ctas: document.querySelectorAll('.review-path-card__back a[href]').length,
        visibleFaces: [...document.querySelectorAll('.review-path-card__face')].every(face => face.getBoundingClientRect().height > 0),
      }));
      assert.ok(state.scrollWidth <= state.clientWidth + 2, `Homepage has no horizontal scroll at ${viewport.width}px`);
      assert.equal(state.cards, 6, 'Six pathway cards remain present at every viewport.');
      assert.equal(state.fronts, 6);
      assert.equal(state.backs, 6);
      assert.equal(state.ctas, 6);
      assert.equal(state.visibleFaces, true, 'The scene/copy and CTA portions remain visible at every viewport.');
      assert.equal(state.legacy, 0, 'Legacy selector/carousel is absent.');
      assert.equal(state.heroSrc, '/images/ai-character/poses/robot-confident.webp');
      assert.equal(state.prompt, 'Choose the situation that sounds closest. Each illustrated tile shows the useful first move and the review or tool to use next.');
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${server.origin}/`, { waitUntil: 'networkidle' });
    const desktop = await page.$eval('.review-path-card--workflow', card => {
      const inner = card.querySelector('.review-path-card__inner');
      const front = card.querySelector('.review-path-card__front');
      const back = card.querySelector('.review-path-card__back');
      const art = card.querySelector('.review-path-card__art img');
      return {
        transform: getComputedStyle(inner).transform,
        frontPosition: getComputedStyle(front).position,
        backPosition: getComputedStyle(back).position,
        backTransform: getComputedStyle(back).transform,
        frontHeight: front.getBoundingClientRect().height,
        backHeight: back.getBoundingClientRect().height,
        artHeight: art.getBoundingClientRect().height,
        perimeter: getComputedStyle(inner).backgroundImage,
      };
    });
    assert.equal(desktop.transform, 'none', 'Desktop pathway tiles do not use a flip transform.');
    assert.equal(desktop.frontPosition, 'relative', 'Desktop scene/copy remains in normal flow.');
    assert.equal(desktop.backPosition, 'relative', 'Desktop CTA remains directly below in normal flow.');
    assert.equal(desktop.backTransform, 'none', 'Desktop CTA is never hidden on a reverse face.');
    assert.ok(desktop.frontHeight > 0 && desktop.backHeight > 0 && desktop.artHeight > 0, 'Desktop shows the scene, copy and CTA together.');
    assert.notEqual(desktop.perimeter, 'none', 'Static pathway cards retain their gray drawn perimeter.');

    const beforeHover = await page.$eval('.review-path-card--workflow .review-path-card__inner', el => getComputedStyle(el).transform);
    await page.hover('.review-path-card--workflow');
    await page.waitForTimeout(250);
    const afterHover = await page.$eval('.review-path-card--workflow .review-path-card__inner', el => getComputedStyle(el).transform);
    assert.equal(afterHover, beforeHover, 'Hover does not replace or flip pathway content.');

    const interactiveSelector = '.content-section--blue .oob-content-box--interactive';
    const restingInteractive = await page.$eval(interactiveSelector, el => ({
      grayOpacity: getComputedStyle(el, '::before').opacity,
      blueOpacity: getComputedStyle(el, '::after').opacity,
    }));
    assert.equal(restingInteractive.grayOpacity, '0', 'Interactive cards do not show the gray perimeter at rest.');
    assert.equal(restingInteractive.blueOpacity, '0', 'Interactive cards do not show blue until interaction.');

    await page.hover(interactiveSelector);
    await page.waitForTimeout(650);
    const hoveredInteractive = await page.$eval(interactiveSelector, el => ({
      grayOpacity: getComputedStyle(el, '::before').opacity,
      blueOpacity: getComputedStyle(el, '::after').opacity,
    }));
    assert.equal(hoveredInteractive.grayOpacity, '0', 'Hover never restores the gray perimeter.');
    assert.equal(hoveredInteractive.blueOpacity, '1', 'Hover reveals the blue drawn perimeter.');

    const selectedInteractive = await page.$eval(interactiveSelector, el => {
      el.classList.add('is-selected');
      return {
        grayOpacity: getComputedStyle(el, '::before').opacity,
        blueOpacity: getComputedStyle(el, '::after').opacity,
      };
    });
    assert.equal(selectedInteractive.grayOpacity, '0', 'Selected state remains free of the gray perimeter.');
    assert.equal(selectedInteractive.blueOpacity, '1', 'Selected state keeps the blue perimeter visible.');

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
    assert.equal(mobile.frontPosition, 'relative', 'Mobile keeps scene/copy in normal flow.');
    assert.equal(mobile.backPosition, 'relative', 'Mobile keeps CTA in normal flow.');
    assert.equal(mobile.backTransform, 'none', 'Mobile has no hidden reverse side.');
    assert.ok(mobile.frontHeight > 0 && mobile.backHeight > 0, 'Both tile portions are visible on mobile.');

    assert.deepEqual(consoleErrors, [], `Homepage emitted console errors: ${consoleErrors.join(' | ')}`);
    assert.deepEqual(failedRequests, [], `Homepage had failed requests: ${failedRequests.join(' | ')}`);
    console.log('Homepage hero, static pathway and interactive-card browser tests passed.');
  } finally {
    await browser.close();
    await server.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
