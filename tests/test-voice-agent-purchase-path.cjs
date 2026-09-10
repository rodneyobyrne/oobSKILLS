const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const plans = [
  ['base', 'https://buy.stripe.com/5kQ6oJaoq2HP9mjazgc7u01', /\$495 setup/i, /\$149\/month/i],
  ['connected', 'https://buy.stripe.com/8x2bJ39kmaahfKHdLsc7u02', /\$795 setup/i, /\$299\/month/i],
];

for (const [slug, checkout, setup, monthly] of plans) {
  const file = path.join(root, 'voice-agent', 'start', slug, 'index.html');
  assert.ok(fs.existsSync(file), `${slug} review page exists`);
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { url: `https://skills.oobcreative.com/voice-agent/start/${slug}/` });
  const { document } = dom.window;
  const body = document.body.textContent.replace(/\s+/g, ' ');
  assert.match(body, setup);
  assert.match(body, monthly);
  assert.match(body, /Rodney or another human on his team/i);
  assert.match(body, /Nothing goes live until/i);
  assert.equal(document.querySelector('#checkout').href, checkout);
  assert.ok(document.querySelector('#ack'), `${slug} requires review acknowledgment before checkout`);
  assert.equal(document.querySelector('a[href="/voice-agent/service-terms/"]') !== null, true);
}

for (const rel of ['voice-agent/service-terms/index.html','voice-agent/thanks/index.html','voice-agent/start/partner/index.html','voice-agent/purchase.css']) {
  assert.ok(fs.existsSync(path.join(root, rel)), `${rel} exists`);
}

const main = new JSDOM(fs.readFileSync(path.join(root, 'voice-agent', 'index.html'), 'utf8')).window.document;
assert.ok(main.querySelector('a[href="/voice-agent/start/base/"]'));
assert.ok(main.querySelector('a[href="/voice-agent/start/connected/"]'));
assert.ok(main.querySelector('a[href="/voice-agent/start/partner/"]'));
console.log('Voice-agent purchase path tests passed.');