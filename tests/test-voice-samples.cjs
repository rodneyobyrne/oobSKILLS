const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'voice-agent/index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'https://skills.oobcreative.com/voice-agent/' });
const { document } = dom.window;

const expected = [
  ['Aaron', '01-basic-promise-aaron.mp3'],
  ['Pittsburgh', '02-not-voicemail-pittsburgh.mp3'],
  ['Scott', '03-keep-your-number-scott.mp3'],
  ['Eryn', '04-built-around-your-business-eryn-warm.mp3'],
  ['Eryn', '05-connected-work-eryn-natural.mp3'],
  ['Matilda', '06-human-responsibility-matilda.mp3'],
  ['Mateo Aragon', '07-customer-comfort-mateo-aragon.mp3'],
  ['Antonio', '08-useful-not-translated-antonio.mp3'],
  ['Rafael', '09-approved-information-rafael.mp3'],
  ['Regina', '10-when-you-cant-pick-up-regina.mp3'],
  ['Perla', '11-human-boundary-perla.mp3'],
];

const cards = [...document.querySelectorAll('.voice-card')];
assert.equal(cards.length, 11, 'The main voice page has exactly 11 voice samples');
assert.equal(document.querySelectorAll('#english-voices-title + p').length, 1, 'English group is labeled');
assert.equal(document.querySelectorAll('#spanish-voices-title + p').length, 1, 'Spanish group is labeled');

cards.forEach((card, index) => {
  const [name, filename] = expected[index];
  const audio = card.querySelector('audio');
  const button = card.querySelector('button.voice-play');
  assert.match(card.querySelector('.voice-card__name').textContent, new RegExp(`^${name}`), `${name} is assigned in order`);
  assert.equal(new URL(audio.src).pathname, `/voice-agent/assets/voices/${filename}`, `${name} uses the expected MP3`);
  assert.equal(button.getAttribute('aria-controls'), audio.id, `${name} button controls its audio element`);
  assert.ok(button.getAttribute('aria-label'), `${name} play control has an accessible name`);
  assert.ok(fs.existsSync(path.join(root, 'voice-agent/assets/voices', filename)), `${filename} exists`);
});

for (const slug of ['construction', 'home-services', 'property-management', 'legal', 'healthcare', 'financial-services']) {
  const industryHtml = fs.readFileSync(path.join(root, 'voice-agent', slug, 'index.html'), 'utf8');
  const industryDom = new JSDOM(industryHtml, { url: `https://skills.oobcreative.com/voice-agent/${slug}/` });
  const link = industryDom.window.document.querySelector('.voice-samples-compact');
  assert.equal(link?.href, 'https://skills.oobcreative.com/voice-agent/#voice-samples', `${slug} links to the full samples`);
}

console.log('Voice sample mapping and industry links passed.');
