const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { startStaticServer } = require('./static-server.cjs');

(async () => {
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${server.origin}/`, { waitUntil: 'networkidle' });

    const footer = await page.evaluate(() => {
      const element = document.querySelector('footer');
      const explore = document.querySelector('.footer-links > div:first-child');
      const company = document.querySelector('.footer-links > div:last-child');
      return {
        height: element.getBoundingClientRect().height,
        privacyLinks: element.querySelectorAll('a[href="/privacy-policy/"]').length,
        termsLinks: element.querySelectorAll('a[href="/terms/"]').length,
        footerBarLinks: element.querySelectorAll('.footer-bar a').length,
        exploreDisplay: getComputedStyle(explore).display,
        companyColumns: getComputedStyle(company).gridTemplateColumns.split(' ').filter(Boolean).length,
      };
    });

    assert.equal(footer.privacyLinks, 1, 'Privacy appears once in the mobile footer.');
    assert.equal(footer.termsLinks, 1, 'Terms appears once in the mobile footer.');
    assert.equal(footer.footerBarLinks, 0, 'The copyright bar does not repeat policy links.');
    assert.equal(footer.exploreDisplay, 'none', 'Primary exploration links stay out of the compact mobile footer.');
    assert.equal(footer.companyColumns, 2, 'Company and policy links use a compact two-column mobile grid.');
    assert.ok(footer.height < 560, `Mobile footer stays compact; measured ${footer.height}px.`);

    await page.locator('.mobile-nav > summary').click();
    const menu = await page.evaluate(() => {
      const nav = document.querySelector('.mobile-nav > nav');
      const rect = nav.getBoundingClientRect();
      return {
        position: getComputedStyle(nav).position,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        bodyOverflow: getComputedStyle(document.body).overflow,
      };
    });

    assert.equal(menu.position, 'fixed', 'Open mobile navigation is a viewport layer.');
    assert.ok(Math.abs(menu.left) <= 1, 'Mobile navigation reaches the left viewport edge.');
    assert.ok(Math.abs(menu.right - menu.viewportWidth) <= 1, 'Mobile navigation reaches the right viewport edge.');
    assert.ok(menu.top >= 70 && menu.top <= 74, `Mobile navigation begins below the header; measured ${menu.top}px.`);
    assert.ok(Math.abs(menu.bottom - menu.viewportHeight) <= 2, 'Mobile navigation covers the remaining viewport height.');
    assert.equal(menu.bodyOverflow, 'hidden', 'Opening mobile navigation prevents the page beneath it from scrolling.');

    console.log('Mobile navigation and compact trust footer browser checks passed.');
  } finally {
    await browser.close();
    await server.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
