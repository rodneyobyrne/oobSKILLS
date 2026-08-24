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
      const firstCardImage = getComputedStyle(document.querySelector('.review-option'), '::before').backgroundImage;
      return {
        cardCount: cards.length,
        cardXs: cards.map(card => Math.round(card.x)),
        cardWidths: cards.map(card => Math.round(card.width)),
        heroWidth: hero.width,
        viewportWidth: document.documentElement.clientWidth,
        imageSrc: image.getAttribute('src'),
        heading: document.querySelector('#review-question').textContent.trim(),
        outlineCount: document.querySelectorAll('.review-option__outline').length,
        firstCardImage,
      };
    });
    assert.equal(mobile.cardCount, 5);
    assert.equal(new Set(mobile.cardXs).size, 1, 'Phone layout keeps one review card per row');
    assert.ok(Math.min(...mobile.cardWidths) > 300, 'Phone review cards remain comfortably full width');
    assert.ok(mobile.heroWidth <= mobile.viewportWidth, 'Phone hero remains inside the viewport');
    assert.equal(mobile.imageSrc, '/images/ai-character/homepage-hero.png');
    assert.equal(mobile.heading, 'Which problem feels most familiar right now?');
    assert.equal(mobile.outlineCount, 5, 'Every choice card gets a complete SVG outline');
    assert.match(mobile.firstCardImage, /ai-character\/poses\.png/, 'Choice card art uses the locked character sprite');

    await page.click('.review-option[data-review="opportunity"]');
    await page.waitForTimeout(80);
    const firstAnimation = await page.$eval('.review-option[data-review="opportunity"] .review-option__outline path', el => getComputedStyle(el).animationName);
    assert.equal(firstAnimation, 'oob-card-draw');
    await page.click('.review-option[data-review="friction"]');
    await page.waitForTimeout(80);
    const secondAnimation = await page.$eval('.review-option[data-review="friction"] .review-option__outline path', el => getComputedStyle(el).animationName);
    assert.equal(secondAnimation, 'oob-card-draw', 'Selecting a different card starts the draw animation again');

    await page.setViewportSize({ width: 1720, height: 900 });
    await page.goto(`${server.origin}/`, { waitUntil: 'networkidle' });
    const desktop = await page.evaluate(() => {
      const shell = document.querySelector('.operator-hero .site-shell').getBoundingClientRect();
      const copy = document.querySelector('.hero-copy').getBoundingClientRect();
      const art = document.querySelector('.hero-art').getBoundingClientRect();
      const h1 = document.querySelector('.hero-copy h1').getBoundingClientRect();
      const lead = document.querySelector('.hero-copy .lead').getBoundingClientRect();
      const image = document.querySelector('.hero-art__image');
      const signalHeading = document.querySelector('.answer-item--signal h3');
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
        freeToolNoteCount: document.querySelectorAll('.free-tool-note').length,
        oldSideNoteCount: document.querySelector('#use-now-heading').closest('section').querySelectorAll('.section-side-note').length,
        signalDecoration: getComputedStyle(signalHeading).textDecorationLine,
      };
    });
    assert.ok(desktop.shellWidth / desktop.viewportWidth > 0.9, 'Desktop site shell uses most of the viewport width');
    assert.ok(Math.abs(desktop.artTop - desktop.copyTop) < 90, 'Desktop hero image aligns with the text block');
    assert.ok(desktop.h1Width / desktop.copyWidth > 0.75, 'Desktop H1 uses the wider text column');
    assert.ok(desktop.h1FontSize < 82, 'Desktop H1 stays controlled rather than oversized');
    assert.ok(desktop.leadWidth / desktop.copyWidth > 0.85, 'Desktop intro paragraph uses the text column');
    assert.equal(desktop.imageSrc, '/images/ai-character/homepage-hero.png');
    assert.ok(desktop.imageNaturalWidth >= 1200, 'Homepage hero uses a high-resolution PNG source');
    assert.equal(desktop.freeToolNoteCount, 1, 'Free-tool promise is moved beneath the tool cards');
    assert.equal(desktop.oldSideNoteCount, 0, 'Free-tool promise no longer competes with the section heading');
    assert.equal(desktop.signalDecoration, 'none', 'AI privacy question no longer has an underline');

    await page.goto(`${server.origin}/practical-ai/`, { waitUntil: 'networkidle' });
    const practicalAiHero = await page.evaluate(() => ({
      hasArt: Boolean(document.querySelector('.content-hero__art')),
      hasLayoutClass: document.querySelector('.content-hero__inner')?.classList.contains('has-ai-art'),
      background: getComputedStyle(document.querySelector('.content-hero__art')).backgroundImage,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }));
    assert.equal(practicalAiHero.hasArt, true, 'Practical AI hero includes the oob AI character');
    assert.equal(practicalAiHero.hasLayoutClass, true);
    assert.match(practicalAiHero.background, /ai-character\/poses\.png/);
    assert.equal(practicalAiHero.overflow, false);

    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(failedRequests, []);
    await context.close();
    console.log('Homepage and AI hero polish passed at 320, 390, 768, 1440, and 1720 pixels.');
  } finally {
    await browser.close();
    await server.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
