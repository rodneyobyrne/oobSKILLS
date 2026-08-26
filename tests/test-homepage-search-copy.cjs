const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const polish = fs.readFileSync(path.join(root, 'site-polish-v3.js'), 'utf8');
const dom = new JSDOM(html);
const { document } = dom.window;

assert.equal(
  document.querySelector('#review-question')?.textContent.trim(),
  'Which AI, workflow, customer-contact or website problem is costing you most?',
  'Homepage problem H2 retains searchable business categories.'
);

assert.deepEqual(
  [...document.querySelectorAll('.review-option span:last-of-type')].map((node) => node.textContent.trim()),
  [
    'We miss calls, scheduling, intake or follow-up.',
    'Repeated work and disconnected systems keep stealing time.',
    'My team uses AI, but we need clearer rules or better tool choices.',
    'Our website or message does not explain why people should choose us.',
    'I have an idea to test before a full build.'
  ],
  'Homepage choices retain direct problem language rather than generic labels.'
);

assert.equal(polish.includes('Which problem feels most familiar right now?'), false, 'Runtime polish script must not overwrite the H2.');
assert.equal(polish.includes("opportunity: 'Find what’s useful.'"), false, 'Runtime polish script must not overwrite problem labels.');

console.log('Homepage searchable-copy guard tests passed.');
