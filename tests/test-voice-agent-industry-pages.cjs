const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const industries = [
  ['construction', /construction/i],
  ['home-services', /home[- ]service/i],
  ['property-management', /property management/i],
  ['legal', /law firm|legal/i],
  ['healthcare', /healthcare/i],
  ['financial-services', /financial[- ]service/i],
];

for (const [slug, language] of industries) {
  const pagePath = path.join(root, 'voice-agent', slug, 'index.html');
  assert.ok(fs.existsSync(pagePath), `${slug} page exists`);

  const html = fs.readFileSync(pagePath, 'utf8');
  const dom = new JSDOM(html, { url: `https://skills.oobcreative.com/voice-agent/${slug}/` });
  const { document } = dom.window;
  const body = document.body.textContent.replace(/\s+/g, ' ');

  assert.equal(document.querySelectorAll('h1').length, 1, `${slug} has one H1`);
  assert.match(document.title, language, `${slug} has industry-specific title`);
  assert.match(document.querySelector('meta[name="description"]').content, language, `${slug} has industry-specific description`);
  assert.equal(document.querySelector('link[rel="canonical"]').href, `https://skills.oobcreative.com/voice-agent/${slug}/`);
  assert.match(body, language, `${slug} has industry-specific visible language`);
  assert.equal(document.querySelectorAll('.situation-card').length, 4, `${slug} has four call situations`);
  assert.equal(document.querySelectorAll('.faq details').length, 3, `${slug} has three FAQs`);
  assert.equal(document.querySelectorAll('.plan').length, 3, `${slug} has three plans`);
  assert.ok(document.querySelector('a[href="/voice-agent/start/base/"]'), `${slug} routes Base into purchase review`);
  assert.ok(document.querySelector('a[href="/voice-agent/start/connected/"]'), `${slug} routes Connected into purchase review`);
  assert.ok(document.querySelector('a[href="/voice-agent/start/partner/"]'), `${slug} routes Partner into scope review`);
  assert.ok(document.querySelectorAll(`a[href="tel:9704048398"]`).length >= 3, `${slug} includes live call actions`);
  assert.equal(document.querySelectorAll('.visual-slot img').length, 0, `${slug} image slots do not imply completed artwork`);
  assert.doesNotMatch(body, /revolution|transform your business|replace your staff/i, `${slug} avoids unsupported AI claims`);
  assert.match(body, /Rodney or another human on his team/i, slug + ' keeps the human-team expectation visible');
}

console.log('Voice-agent industry page tests passed.');
