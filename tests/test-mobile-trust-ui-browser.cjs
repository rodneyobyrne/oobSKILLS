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
      const rows = [...nav.querySelectorAll(':scope > a:not(.nav-cta), :scope > .nav-group > summary')].map((row) => {
        const style = getComputedStyle(row);
        return {
          background: style.backgroundColor,
          color: style.color,
          borderWidth: style.borderTopWidth,
          borderStyle: style.borderTopStyle,
          minHeight: parseFloat(style.minHeight),
        };
      });
      const cta = nav.querySelector(':scope > .nav-cta');
      const ctaStyle = getComputedStyle(cta);
      return {
        position: getComputedStyle(nav).position,
        background: getComputedStyle(nav).backgroundColor,
        color: getComputedStyle(nav).color,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        bodyOverflow: getComputedStyle(document.body).overflow,
        rows,
        ctaBackground: ctaStyle.backgroundColor,
        ctaColor: ctaStyle.color,
      };
    });

    assert.equal(menu.position, 'fixed', 'Open mobile navigation is a viewport layer.');
    assert.ok(Math.abs(menu.left) <= 1, 'Mobile navigation reaches the left viewport edge.');
    assert.ok(Math.abs(menu.right - menu.viewportWidth) <= 1, 'Mobile navigation reaches the right viewport edge.');
    assert.ok(menu.top >= 70 && menu.top <= 74, `Mobile navigation begins below the header; measured ${menu.top}px.`);
    assert.ok(Math.abs(menu.bottom - menu.viewportHeight) <= 2, 'Mobile navigation covers the remaining viewport height.');
    assert.equal(menu.bodyOverflow, 'hidden', 'Opening mobile navigation prevents the page beneath it from scrolling.');
    assert.equal(menu.background, 'rgb(255, 255, 255)', 'Mobile navigation uses a welcoming white canvas.');
    assert.equal(menu.color, 'rgb(17, 17, 17)', 'Mobile navigation uses dark text on the light canvas.');
    assert.ok(menu.rows.length >= 6, 'Mobile navigation exposes the expected top-level choices.');
    assert.ok(menu.rows.every((row) => row.background === 'rgb(255, 255, 255)'), 'Top-level menu choices rest on white.');
    assert.ok(menu.rows.every((row) => row.color === 'rgb(17, 17, 17)'), 'Top-level menu choices use dark readable text.');
    assert.ok(menu.rows.every((row) => row.borderWidth === '1px' && row.borderStyle === 'solid'), 'Top-level menu choices use restrained outlined cells.');
    assert.ok(menu.rows.every((row) => row.minHeight >= 54), 'Outlined menu choices retain comfortable touch targets.');
    assert.equal(menu.ctaBackground, 'rgb(36, 74, 165)', 'Conversation CTA remains the single filled blue action.');
    assert.equal(menu.ctaColor, 'rgb(255, 255, 255)', 'Conversation CTA retains readable white text.');

    console.log('Mobile navigation and compact trust footer browser checks passed.');
  } finally {
    await browser.close();
    await server.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
