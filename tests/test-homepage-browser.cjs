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
      const heroImage = document.querySelector('.hero-art__image');
      const cardArt = [...document.querySelectorAll('.review-option__art')];
      const lockupArt = [...document.querySelectorAll('.section-lockup__art img')];
      return {
        cardCount: cards.length,
        cardXs: cards.map(card => Math.round(card.x)),
        cardWidths: cards.map(card => Math.round(card.width)),
        heroWidth: hero.width,
        viewportWidth: document.documentElement.clientWidth,
        heroImageSrc: heroImage?.getAttribute('src'),
        heroImageNaturalWidth: heroImage?.naturalWidth,
        heroImageNaturalHeight: heroImage?.naturalHeight,
        heading: document.querySelector('#review-question').textContent.trim(),
        outlineCount: document.querySelectorAll('.review-option__outline').length,
        cardArtCount: cardArt.length,
        cardArtSrcs: cardArt.map(el => el.getAttribute('src')),
        cardRoles: cardArt.map(el => el.dataset.visualRole),
        lockupCount: lockupArt.length,
        lockupSrcs: lockupArt.map(el => el.getAttribute('src')),
        lockupRoles: lockupArt.map(el => el.dataset.visualRole),
        oldPseudoDisplay: getComputedStyle(document.querySelector('.review-option'), '::before').display,
      };
    });

    assert.equal(mobile.cardCount, 5);
    assert.equal(new Set(mobile.cardXs).size, 1, 'Phone layout keeps one review card per row');
    assert.ok(Math.min(...mobile.cardWidths) > 300, 'Phone review cards remain comfortably full width');
    assert.ok(mobile.heroWidth <= mobile.viewportWidth, 'Phone hero remains inside the viewport');
    assert.equal(mobile.heroImageSrc, '/images/ai-relationship/oob-ai-hero.png', 'Homepage hero stays a direct detailed-scene PNG');
    assert.equal(mobile.heroImageNaturalWidth, 1200);
    assert.equal(mobile.heroImageNaturalHeight, 800);
    assert.equal(mobile.heading, 'Which problem feels most familiar right now?');
    assert.equal(mobile.outlineCount, 5, 'Every choice card gets a complete outline');
    assert.equal(mobile.cardArtCount, 5, 'Every choice card gets an experience image');
    assert.deepEqual(mobile.cardArtSrcs, [
      '/images/ai-relationship-v2/opportunity.png',
      '/images/ai-relationship-v2/friction.png',
      '/images/ai-relationship-v2/team.png',
      '/images/ai-relationship-v2/build.png',
      '/images/ai-relationship-v2/control.png'
    ]);
    assert.ok(mobile.cardRoles.every(role => role === 'experience'), 'Choice-card images are explicitly classified as experiences');
    assert.ok(mobile.lockupCount >= 6, 'Homepage major H2 lockups retain supporting art');
    assert.ok(mobile.lockupSrcs.every(src => [
      '/images/ai-character/poses/pointing.png',
      '/images/ai-character/poses/thinking.png',
      '/images/ai-character/poses/waving.png'
    ].includes(src)), 'Every H2 lockup uses a simple solo robot pose PNG');
    assert.ok(mobile.lockupRoles.every(role => role === 'headline-pose'), 'H2 graphics are explicitly classified as headline poses');
    assert.equal(mobile.oldPseudoDisplay, 'none', 'Legacy sprite backgrounds remain disabled');

    await page.click('.review-option[data-review="opportunity"]');
    await page.waitForTimeout(80);
    const firstAnimation = await page.$eval('.review-option[data-review="opportunity"] .review-option__outline path', el => getComputedStyle(el).animationName);
    assert.equal(firstAnimation, 'oob-card-draw');

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
        freeToolNoteCount: document.querySelectorAll('.free-tool-note').length,
        oldSideNoteCount: document.querySelector('#use-now-heading').closest('section').querySelectorAll('.section-side-note').length,
      };
    });
    assert.ok(desktop.shellWidth / desktop.viewportWidth > 0.9, 'Desktop site shell uses most of the viewport width');
    assert.ok(Math.abs(desktop.artTop - desktop.copyTop) < 90, 'Desktop hero scene aligns with the text block');
    assert.ok(desktop.h1Width / desktop.copyWidth > 0.75, 'Desktop H1 uses the wider text column');
    assert.ok(desktop.h1FontSize < 82, 'Desktop H1 stays controlled rather than oversized');
    assert.ok(desktop.leadWidth / desktop.copyWidth > 0.85, 'Desktop intro paragraph uses the text column');
    assert.equal(desktop.imageSrc, '/images/ai-relationship/oob-ai-hero.png');
    assert.equal(desktop.freeToolNoteCount, 1, 'Free-tool promise is moved beneath the tool cards');
    assert.equal(desktop.oldSideNoteCount, 0, 'Free-tool promise no longer competes with the section heading');

    await page.goto(`${server.origin}/practical-ai/`, { waitUntil: 'networkidle' });
    const practicalAiHero = await page.evaluate(() => ({
      genericPoseArt: document.querySelectorAll('.content-hero__art').length,
      hasLegacyLayoutClass: document.querySelector('.content-hero__inner')?.classList.contains('has-ai-art'),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }));
    assert.equal(practicalAiHero.genericPoseArt, 0, 'Generic solo robot poses are not used as page-hero art');
    assert.equal(practicalAiHero.hasLegacyLayoutClass, false, 'Legacy three-column hero layout is removed');
    assert.equal(practicalAiHero.overflow, false);

    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(failedRequests, []);
    await context.close();
    console.log('Visual hierarchy passed: scene PNG hero, experience choice cards, solo robot H2 lockups, no sprite hero art.');
  } finally {
    await browser.close();
    await server.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
