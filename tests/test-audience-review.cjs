const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const siteRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(siteRoot, 'audience-review/index.html'), 'utf8');
const script = fs.readFileSync(path.join(siteRoot, 'audience-review/app.js'), 'utf8');

function createPage() {
  const dom = new JSDOM(html, {
    url: 'https://skills.oobcreative.com/audience-review/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.scrollTo = () => {};
  window.URL.createObjectURL = () => 'blob:test';
  window.URL.revokeObjectURL = () => {};
  window.navigator.clipboard = { writeText: async () => {} };
  window.eval(script);
  return window;
}

function select(window, name, value) {
  const input = window.document.querySelector(`[name="${name}"][value="${value}"]`);
  assert.ok(input, `Expected ${name}=${value}`);
  input.checked = true;
  input.dispatchEvent(new window.Event('change', { bubbles: true }));
}

function click(window, selector) {
  const target = window.document.querySelector(selector);
  assert.ok(target, `Expected ${selector}`);
  target.click();
}

{
  const window = createPage();
  const document = window.document;

  assert.equal(document.querySelectorAll('.choice input').length, 44);
  assert.equal(document.querySelectorAll('[name="offer_type"][type="radio"]').length, 4);
  assert.equal(document.querySelectorAll('fieldset').length, 9);
  assert.match(document.body.textContent, /not sent to oobCREATIVE/i);

  click(window, '[data-next="2"]');
  assert.equal(document.getElementById('validation-summary').hidden, false);
  assert.equal(document.getElementById('offer').getAttribute('aria-invalid'), 'true');
  assert.equal(document.querySelector('[data-step="2"]').hidden, true);

  document.getElementById('offer').value = 'Independent business consultant';
  document.getElementById('offer').dispatchEvent(new window.Event('input', { bubbles: true }));
  select(window, 'offer_type', 'service');
  click(window, '[data-next="2"]');
  assert.equal(document.querySelector('[data-step="1"]').hidden, true);
  assert.equal(document.querySelector('[data-step="2"]').hidden, false);

  select(window, 'audience_values', 'quality');
  select(window, 'audience_trigger', 'current-way-failing');
  select(window, 'audience_emotions', 'cautious');
  select(window, 'audience_needs', 'human-guidance');
  select(window, 'audience_hesitation', 'trust');
  select(window, 'audience_outcome', 'confidence');
  click(window, '[data-next="3"]');
  assert.equal(document.querySelector('[data-step="3"]').hidden, false);

  select(window, 'business_values', 'quality');
  select(window, 'business_message', 'direct');
  document.getElementById('audience-form').dispatchEvent(
    new window.Event('submit', { bubbles: true, cancelable: true }),
  );

  assert.equal(document.getElementById('tool-shell').hidden, true);
  assert.equal(document.getElementById('results-view').hidden, false);
  assert.match(document.getElementById('results-title').textContent, /Independent business consultant/);
  assert.match(document.getElementById('results-report').textContent, /Quality that holds up|standard your work must meet/i);
  assert.doesNotMatch(document.getElementById('results-report').textContent, /Quality become|Make it visible by show|helps the customer help customers/i);
  assert.equal(document.querySelectorAll('[data-copy-draft]').length, 3);
  assert.ok(document.getElementById('copy-review'));
  assert.ok(document.getElementById('download-review'));
  assert.ok(document.getElementById('print-review'));
  assert.ok(window.localStorage.getItem('oobcreative-audience-review-v1'));

  document.getElementById('edit-review').click();
  assert.equal(document.querySelector('[data-step="3"]').hidden, false);
  document.getElementById('clear-draft').click();
  assert.equal(window.localStorage.getItem('oobcreative-audience-review-v1'), null);
  assert.equal(document.querySelector('[data-step="1"]').hidden, false);

  const review = window.AudienceReview.buildReview({
    offer: 'Independent business consultant',
    website: '',
    offer_type: 'service',
    audience_values: 'not-sure',
    audience_trigger: 'not-sure',
    audience_emotions: 'not-sure',
    audience_needs: 'not-sure',
    audience_hesitation: 'not-sure',
    audience_outcome: 'not-sure',
    business_values: ['not-sure'],
    business_message: 'not-sure',
  });
  assert.match(window.AudienceReview.reviewMarkdown(review), /^# Audience Review:/);
  assert.deepEqual(Object.keys(review.payload.audienceEvidence), [
    'values', 'triggerContext', 'emotionalState', 'decisionNeeds', 'resistanceSignals', 'desiredMovement'
  ]);
  assert.deepEqual(Object.keys(review.payload.businessEvidence), ['providerValues', 'intendedMessage']);
}

console.log('Audience Review DOM tests passed.');
