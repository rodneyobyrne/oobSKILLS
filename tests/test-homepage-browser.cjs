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
      const overflowState = await page.evaluate(() => {
        const clientWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const approvedDecorativeOvershoot = 2;
        const describe = (element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            id: element.id || '',
            classes: [...element.classList].slice(0, 6).join('.'),
            left: Math.round(rect.left * 10) / 10,
            right: Math.round(rect.right * 10) / 10,
            width: Math.round(rect.width * 10) / 10,
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
            overflowX: getComputedStyle(element).overflowX,
          };
        };
        const all = [...document.body.querySelectorAll('*')];
        const offenders = all
          .map(describe)
          .filter((item) => item.right > clientWidth + 1 || item.left < -1)
          .sort((a, b) => Math.max(b.right - clientWidth, -b.left) - Math.max(a.right - clientWidth, -a.left))
          .slice(0, 12);
        const scrollContainers = [document.body, document.querySelector('main'), ...all]
          .filter(Boolean)
          .map(describe)
          .filter((item) => item.scrollWidth > item.clientWidth + 1 && item.left < clientWidth && item.right > 0)
          .sort((a, b) => (b.scrollWidth - b.clientWidth) - (a.scrollWidth - a.clientWidth))
          .slice(0, 20);
        const landmarkWidths = ['body','main','.operator-hero','.hero-layout','.review-panel','.review-carousel','.review-options','.content-section--blue','.services-section','.participation-section','.final-cta']
          .map((selector) => {
            const element = selector === 'body' ? document.body : document.querySelector(selector);
            return element ? { selector, ...describe(element) } : null;
          })
          .filter(Boolean);
        const rawOverflow = Math.max(0, scrollWidth - clientWidth);
        const bodyOverflowX = getComputedStyle(document.body).overflowX;
        const mainOverflowX = getComputedStyle(document.querySelector('main')).overflowX;
        return {
          overflow: rawOverflow > approvedDecorativeOvershoot,
          rawOverflow,
          approvedDecorativeOvershoot,
          bodyOverflowX,
          mainOverflowX,
          clientWidth,
          scrollWidth,
          offenders,
          scrollContainers,
          landmarkWidths,
        };
      });
      if (overflowState.overflow) console.error(`Overflow diagnostic ${viewport.width}px: ${JSON.stringify(overflowState)}`);
      assert.equal(overflowState.overflow, false, `Homepage has no horizontal overflow beyond the approved 2px drawn-line crossing at ${viewport.width}px`);
      if (overflowState.rawOverflow > 0) {
        assert.ok(
          overflowState.bodyOverflowX === 'hidden' || overflowState.mainOverflowX === 'clip',
          `Approved decorative overflow is clipped from user scrolling at ${viewport.width}px`
        );
      }
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${server.origin}/`, { waitUntil: 'networkidle' });
    const mobile = await page.evaluate(() => {
      const track = document.querySelector('.review-options');
      const cards = [...document.querySelectorAll('.review-option')];
      const firstCard = cards[0]?.getBoundingClientRect();
      const hero = document.querySelector('.hero-layout').getBoundingClientRect();
      const heroImage = document.querySelector('.hero-art__image');
      const heroImageRect = heroImage?.getBoundingClientRect();
      const cardArt = [...document.querySelectorAll('.review-option__art')];
      const lockupArt = [...document.querySelectorAll('.section-lockup__art img')];
      const firstCardStyle = getComputedStyle(cards[0], '::before');
      const firstCardHoverStyle = getComputedStyle(cards[0], '::after');
      return {
        cardCount: cards.length,
        firstCardWidth: firstCard?.width || 0,
        trackClientWidth: track?.clientWidth || 0,
        trackScrollWidth: track?.scrollWidth || 0,
        heroWidth: hero.width,
        viewportWidth: document.documentElement.clientWidth,
        heroImageSrc: heroImage?.getAttribute('src'),
        heroImageNaturalWidth: heroImage?.naturalWidth,
        heroImageNaturalHeight: heroImage?.naturalHeight,
        heroImageHeight: heroImageRect?.height || 0,
        heading: document.querySelector('#review-question').textContent.trim(),
        legacyOutlineCount: document.querySelectorAll('.review-option__outline').length,
        cardArtCount: cardArt.length,
        cardArtSrcs: cardArt.map(el => el.getAttribute('src')),
        cardRoles: cardArt.map(el => el.dataset.visualRole),
        lockupCount: lockupArt.length,
        lockupSrcs: lockupArt.map(el => el.getAttribute('src')),
        lockupRoles: lockupArt.map(el => el.dataset.visualRole),
        productionClassCount: document.querySelectorAll('.review-option.oob-content-box--interactive').length,
        restingOutlineImage: firstCardStyle.backgroundImage,
        hoverOutlineImage: firstCardHoverStyle.backgroundImage,
        participationCta: Boolean(document.querySelector('.participation-actions .oob-cta')),
        localCallback: Boolean(document.querySelector('.local-pilot-note') && document.querySelector('a.oob-cta--callback[href="/services/local-ai-systems/"]')),
      };
    });

    assert.equal(mobile.cardCount, 6, 'Problem gallery has six starting points');
    assert.ok(mobile.trackScrollWidth > mobile.trackClientWidth, 'Phone problem gallery is horizontally scrollable');
    assert.ok(mobile.firstCardWidth >= 240 && mobile.firstCardWidth < mobile.viewportWidth, 'Phone carousel shows one primary card with the next card discoverable');
    assert.ok(mobile.heroWidth <= mobile.viewportWidth, 'Phone hero remains inside the viewport');
    assert.equal(mobile.heroImageSrc, '/images/ai-relationship/ai-workflow-map.webp', 'Homepage hero keeps the approved detailed relationship scene');
    assert.equal(mobile.heroImageNaturalWidth, 1122);
    assert.equal(mobile.heroImageNaturalHeight, 1402);
    assert.ok(mobile.heroImageHeight <= 300, 'Phone hero art is intentionally compact');
    assert.equal(mobile.heading, 'The right first move depends on where the work is breaking.');
    assert.equal(mobile.legacyOutlineCount, 0, 'Legacy injected card outlines are retired');
    assert.equal(mobile.productionClassCount, 6, 'Every problem card uses the shared production box component');
    assert.ok(mobile.restingOutlineImage.includes('line-top.svg'), 'Resting card perimeter uses approved production line assets');
    assert.ok(mobile.hoverOutlineImage.includes('line-top-blue.svg'), 'Interactive card perimeter uses matching blue line assets');
    assert.equal(mobile.cardArtCount, 6, 'Every problem card keeps a supporting visual');
    assert.deepEqual(mobile.cardArtSrcs.slice(0, 5), [
      '/images/experiences/missed-calls.webp',
      '/images/experiences/repeated-admin.webp',
      '/images/experiences/team-ai-boundaries.webp',
      '/images/experiences/website-message-clarity.webp',
      '/images/experiences/idea-to-test.webp'
    ]);
    assert.equal(mobile.cardArtSrcs[5], '/images/ai-character/poses/robot-arms-crossed.webp');
    assert.ok(mobile.cardRoles.slice(0, 5).every(role => role === 'experience'), 'First five gallery visuals remain experience illustrations');
    assert.equal(mobile.cardRoles[5], 'headline-pose', 'Founder-capacity card uses a canonical robot pose');
    assert.ok(mobile.lockupCount >= 6, 'Homepage major H2 lockups retain supporting art');
    assert.ok(mobile.lockupSrcs.every(src => src.startsWith('/images/ai-character/poses/robot-') && src.endsWith('.webp')), 'Every H2 lockup uses a semantic solo robot WebP');
    assert.ok(mobile.lockupRoles.every(role => role === 'headline-pose'), 'H2 graphics are explicitly classified as headline poses');
    assert.equal(mobile.participationCta, true, 'Ways to work together ends with a clear CTA');
    assert.equal(mobile.localCallback, true, 'Local pilot uses the strong callback CTA treatment');

    await page.hover('.review-option[data-review="opportunity"]');
    await page.waitForTimeout(40);
    const hoverAnimation = await page.$eval('.review-option[data-review="opportunity"]', el => getComputedStyle(el, '::after').animationName);
    assert.equal(hoverAnimation, 'oob-box-outline-draw', 'Card hover redraws the production outline in blue');

    await page.click('.review-option[data-review="founder"]');
    const founderResponse = await page.evaluate(() => ({
      title: document.querySelector('[data-response-title]').textContent.trim(),
      href: document.querySelector('[data-response-link]').getAttribute('href'),
    }));
    assert.equal(founderResponse.title, 'Separate founder judgment from reusable team context.');
    assert.equal(founderResponse.href, '/tools/founder-bottleneck-review/');

    await page.setViewportSize({ width: 1720, height: 900 });
    await page.goto(`${server.origin}/`, { waitUntil: 'networkidle' });
    const desktop = await page.evaluate(() => {
      const shell = document.querySelector('.operator-hero .site-shell').getBoundingClientRect();
      const copy = document.querySelector('.hero-copy').getBoundingClientRect();
      const art = document.querySelector('.hero-art').getBoundingClientRect();
      const h1 = document.querySelector('.hero-copy h1').getBoundingClientRect();
      const lead = document.querySelector('.hero-copy .lead').getBoundingClientRect();
      const image = document.querySelector('.hero-art__image');
      const track = document.querySelector('.review-options');
      const card = document.querySelector('.review-option').getBoundingClientRect();
      const answers = document.querySelector('.answer-list').getBoundingClientRect();
      const freeCard = document.querySelector('.content-section--blue .content-card');
      const serviceCard = document.querySelector('.capability-grid article');
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
        imageHeight: image.getBoundingClientRect().height,
        freeToolNoteCount: document.querySelectorAll('.free-tool-note').length,
        oldSideNoteCount: document.querySelector('#use-now-heading').closest('section').querySelectorAll('.section-side-note').length,
        trackWidth: track.getBoundingClientRect().width,
        cardWidth: card.width,
        answersWidth: answers.width,
        freeCardUsesBox: freeCard.classList.contains('oob-content-box--interactive'),
        serviceCardUsesBox: serviceCard.classList.contains('oob-content-box--interactive'),
      };
    });
    assert.ok(desktop.shellWidth / desktop.viewportWidth > 0.65, 'Desktop site shell remains intentionally bounded');
    assert.ok(Math.abs(desktop.artTop - desktop.copyTop) < 100, 'Desktop hero scene aligns with the text block');
    assert.ok(desktop.h1Width / desktop.copyWidth > 0.7, 'Desktop H1 uses the text column');
    assert.ok(desktop.h1FontSize < 100, 'Desktop H1 stays controlled rather than oversized');
    assert.ok(desktop.leadWidth / desktop.copyWidth > 0.8, 'Desktop intro paragraph uses the text column');
    assert.equal(desktop.imageSrc, '/images/ai-relationship/ai-workflow-map.webp');
    assert.ok(desktop.imageHeight <= 525, 'Desktop hero art is bounded instead of dominating the page');
    assert.equal(desktop.freeToolNoteCount, 1, 'Free-tool promise stays beneath the tool cards');
    assert.equal(desktop.oldSideNoteCount, 0, 'Free-tool promise does not compete with the section heading');
    assert.ok(desktop.cardWidth / desktop.trackWidth > 0.28 && desktop.cardWidth / desktop.trackWidth < 0.4, 'Desktop problem gallery shows about three cards at once');
    assert.ok(desktop.answersWidth <= 950, 'Direct Answers keeps the successful narrow reading pattern on desktop');
    assert.equal(desktop.freeCardUsesBox, true, 'Free-tool cards use the production outer-box component');
    assert.equal(desktop.serviceCardUsesBox, true, 'Implementation cards use the production outer-box component');

    const heroPages = {
      '/start-here/': '/images/ai-relationship/choose-the-right-path.webp',
      '/free-tools/': '/images/ai-relationship/practical-ai-toolkit.webp',
      '/assessments/': '/images/ai-relationship/human-reviewed-ai-workflow-steps.webp',
      '/practical-ai/': '/images/ai-relationship/ai-workflow-map.webp',
      '/tools/ai-fit-check/': '/images/ai-relationship/choose-the-right-path.webp',
      '/tools/human-review-checklist/': '/images/ai-relationship/human-reviewed-ai-workflow-steps.webp',
      '/tools/ai-pilot-starter/': '/images/ai-relationship/responsible-ai-working-plan.webp',
      '/assessments/ai-workday-review/': '/images/ai-relationship/ai-workflow-map.webp',
      '/assessments/idea-to-test-review/': '/images/ai-relationship/human-reviewed-ai-workflow-steps.webp',
      '/services/': '/images/ai-relationship/choose-the-right-path.webp',
      '/services/responsible-ai-implementation/': '/images/ai-relationship/responsible-ai-working-plan.webp',
      '/services/local-ai-systems/': '/images/ai-relationship/local-small-business-ai-workflow.webp',
      '/services/ai-receptionist-small-business/': '/images/ai-relationship/ai-receptionist-human-handoff.webp',
    };
    for (const [route, expectedSrc] of Object.entries(heroPages)) {
      await page.goto(`${server.origin}${route}`, { waitUntil: 'networkidle' });
      const heroState = await page.evaluate(() => ({
        sceneSrc: document.querySelector('.content-hero__scene')?.getAttribute('src'),
        genericPoseArt: document.querySelectorAll('.content-hero__art').length,
        hasLegacyLayoutClass: document.querySelector('.content-hero__inner')?.classList.contains('has-ai-art'),
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      }));
      assert.equal(heroState.sceneSrc, expectedSrc, `${route} uses the mapped detailed WebP scene`);
      assert.equal(heroState.genericPoseArt, 0, `${route} does not use generic solo robot hero art`);
      assert.equal(heroState.hasLegacyLayoutClass, false, `${route} has no legacy three-column hero class`);
      assert.equal(heroState.overflow, false, `${route} has no horizontal overflow`);
    }

    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(failedRequests, []);
    await context.close();
    console.log('Homepage production UI passed: compact hero, swipe gallery, shared line math, bounded desktop reading widths.');
  } finally {
    await browser.close();
    await server.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
