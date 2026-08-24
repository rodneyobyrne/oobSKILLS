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
      { width: 1720, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(`${server.origin}/`, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      assert.equal(overflow, false, `Homepage has no horizontal overflow at ${viewport.width}px`);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${server.origin}/`, { waitUntil: 'networkidle' });
    const mobile = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.review-option')].map(el => el.getBoundingClientRect());
      const hero = document.querySelector('.hero-layout').getBoundingClientRect();
      const image = document.querySelector('.hero-art__image');
      return {
        cardCount: cards.length,
        cardXs: cards.map(card => Math.round(card.x)),
        cardWidths: cards.map(card => Math.round(card.width)),
        heroWidth: hero.width,
        viewportWidth: document.documentElement.clientWidth,
        imageSrc: image.getAttribute('src'),
      };
    });
    assert.equal(mobile.cardCount, 5);
    assert.equal(new Set(mobile.cardXs).size, 1, 'Phone layout keeps one review card per row');
    assert.ok(Math.min(...mobile.cardWidths) > 300, 'Phone review cards remain comfortably full width');
    assert.ok(mobile.heroWidth <= mobile.viewportWidth, 'Phone hero remains inside the viewport');
    assert.equal(mobile.imageSrc, '/images/ai-relationship/oob-ai-hero.png');

    await page.setViewportSize({ width: 1720, height: 900 });
    await page.goto(`${server.origin}/`, { waitUntil: 'networkidle' });
    const desktop = await page.evaluate(() => {
      const shell = document.querySelector('.operator-hero .site-shell').getBoundingClientRect();
      const copy = document.querySelector('.hero-copy').getBoundingClientRect();
      const art = document.querySelector('.hero-art').getBoundingClientRect();
      const h1 = document.querySelector('.hero-copy h1').getBoundingClientRect();
      const lead = document.querySelector('.hero-copy .lead').getBoundingClientRect();
      const image = document.querySelector('.hero-art__image');
      return {
        shellWidth: shell.width,
        viewportWidth: document.documentElement.clientWidth,
        copyTop: copy.top,
        artTop: art.top,
        copyWidth: copy.width,
        h1Width: h1.width,
        h1FontSize: parseFloat(getComputedStyle(document.querySelector('.hero-copy h1')).fontSize),
        leadWidth: lead.width,
        imageSrc: image.getAttribute('src'),
        imageNaturalWidth: image.naturalWidth,
      };
    });
    assert.ok(desktop.shellWidth / desktop.viewportWidth > 0.9, 'Desktop site shell uses most of the viewport width');
    assert.ok(Math.abs(desktop.artTop - desktop.copyTop) < 90, 'Desktop hero image aligns with the text block');
    assert.ok(desktop.h1Width / desktop.copyWidth > 0.85, 'Desktop H1 uses the wider text column');
    assert.ok(desktop.h1FontSize < 86, 'Desktop H1 stays smaller than the previous oversized treatment');
    assert.ok(desktop.leadWidth / desktop.copyWidth > 0.9, 'Desktop intro paragraph uses the full text column');
    assert.equal(desktop.imageSrc, '/images/ai-relationship/oob-ai-hero.png');
    assert.ok(desktop.imageNaturalWidth >= 1200, 'Homepage hero uses the full-resolution PNG source');

    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(failedRequests, []);
    await context.close();
    console.log('Homepage responsive layout passed at 320, 390, 768, 1440, and 1720 pixels.');
  } finally {
    await browser.close();
    await server.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
