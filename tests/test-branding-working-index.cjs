const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'branding/index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'https://skills.oobcreative.com/branding/' });
const { document } = dom.window;

const robots = document.querySelector('meta[name="robots"]')?.content.toLowerCase() || '';
assert.match(robots, /\bnoindex\b/, 'Branding reference is noindex');
assert.match(robots, /\bnofollow\b/, 'Branding reference is nofollow');

const inPageLinks = [...document.querySelectorAll('.brand-page-nav a')];
assert.equal(inPageLinks.length, 8, 'Branding reference has complete in-page navigation');
for (const link of inPageLinks) {
  const target = link.getAttribute('href');
  assert.ok(target.startsWith('#'), `${target} is an in-page link`);
  assert.ok(document.querySelector(target), `${target} resolves to a section`);
}

assert.deepEqual(
  [...document.querySelectorAll('.brand-work-link')].map((link) => link.getAttribute('href')),
  [
    '/voice-agent/construction/',
    '/voice-agent/home-services/',
    '/voice-agent/property-management/',
    '/voice-agent/legal/',
    '/voice-agent/healthcare/',
    '/voice-agent/financial-services/',
  ],
  'Branding reference links to all six voice-agent industry pages'
);

assert.equal(document.querySelectorAll('.desktop-nav a[href="/branding/"], .mobile-nav a[href="/branding/"]').length, 0, 'Branding is absent from page navigation');

const buildScript = fs.readFileSync(path.join(root, 'scripts/build-site.mjs'), 'utf8');
assert.doesNotMatch(buildScript, /href=["']\/branding\//, 'Branding is absent from generated global navigation');

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
assert.doesNotMatch(sitemap, /skills\.oobcreative\.com\/branding\//, 'Noindex branding reference is absent from sitemap');

console.log('Branding working-index tests passed.');

