const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const dom = new JSDOM(html);
const { document } = dom.window;

const cards = [...document.querySelectorAll('.review-path-card')];
assert.equal(cards.length, 6, 'Homepage has six standalone problem-path cards.');
assert.equal(document.querySelectorAll('[data-review-carousel], .review-option, .review-stage').length, 0, 'Legacy selector/carousel markup is retired.');

assert.deepEqual(
  cards.map(card => card.querySelector('.review-path-card__front .eyebrow')?.textContent.trim()),
  ['Customer Contact', 'Workflow + Systems', 'AI + Your Team', 'Website + Message', 'Test an Idea', 'Founder Bottleneck'],
  'The six public categories remain explicit in crawlable HTML.'
);

assert.deepEqual(
  cards.map(card => card.querySelector('h2')?.textContent.trim()),
  [
    'Fix the first customer handoff that gets missed.',
    'Map the repeated work before automating it.',
    'Choose AI around the work, not around the demo.',
    'Test the buying information before redesigning the website.',
    'Test who it is for and why they would care before building the whole idea.',
    'Give the team more context without giving up the standard.'
  ],
  'Each pathway H2 is an answer that matches the situation and image.'
);

for (const card of cards) {
  assert.ok(card.querySelector('.review-path-card__front p:not(.eyebrow):not(.review-path-card__hint)')?.textContent.trim(), 'Front supporting copy is in source HTML.');
  assert.ok(card.querySelector('.review-path-card__back h3')?.textContent.trim(), 'Next-step heading is in source HTML.');
  assert.ok(card.querySelector('.review-path-card__back p:not(.eyebrow)')?.textContent.trim(), 'Next-step supporting copy is in source HTML.');
  assert.ok(card.querySelector('.review-path-card__back a[href]')?.textContent.trim(), 'CTA label and destination are in source HTML.');
}

assert.equal(document.querySelector('script[src="/home-ui-v4.js"]'), null, 'The old selector JavaScript is no longer required by the homepage.');
assert.ok(document.querySelector('link[href="/review-path-cards.css"]'), 'Homepage loads the dedicated pathway-card presentation layer.');

console.log('Homepage six-path SEO/LLM content tests passed.');
