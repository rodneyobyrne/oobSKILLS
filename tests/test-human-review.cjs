const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const siteRoot = path.resolve(__dirname, '..', '_site');
const html = fs.readFileSync(path.join(siteRoot, 'tools/human-review-checklist/index.html'), 'utf8');
const script = fs.readFileSync(path.join(siteRoot, 'tools/human-review-checklist/review.js'), 'utf8');

function createPage() {
  const dom = new JSDOM(html, {
    url: 'https://skills.oobcreative.com/tools/human-review-checklist/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.matchMedia = () => ({ matches: true });
  window.URL.createObjectURL = () => 'blob:test';
  window.URL.revokeObjectURL = () => {};
  window.navigator.clipboard = { writeText: async () => {} };
  window.eval(script);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  return window;
}

function answerAll(window, overrides = {}) {
  for (const question of window.HumanReview.questions) {
    const value = overrides[question.name] || 'yes';
    const input = window.document.querySelector(`input[name="${question.name}"][value="${value}"]`);
    input.checked = true;
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
  }
}

function submit(window) {
  window.document.querySelector('[data-review-form]').dispatchEvent(
    new window.Event('submit', { bubbles: true, cancelable: true }),
  );
}

{
  const window = createPage();
  submit(window);
  assert.equal(window.document.querySelector('[data-error-summary]').hidden, false);
  assert.equal(window.document.querySelectorAll('.is-missing').length, 10);

  answerAll(window);
  assert.match(window.document.querySelector('[data-progress-count]').textContent, /10 of 10/);
  assert.ok(window.localStorage.getItem('oob-human-review-draft-v1'));
  submit(window);
  assert.equal(window.document.querySelector('[data-result-wrap]').hidden, false);
  assert.equal(window.document.querySelector('[data-result]').dataset.verdict, 'ready');
  assert.equal(window.document.querySelector('[data-next-primary]').getAttribute('href'), '/tools/ai-fit-check/');

  const changed = window.document.querySelector('input[name="dignity"][value="attention"]');
  changed.checked = true;
  changed.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(window.document.querySelector('[data-result-wrap]').hidden, true);
  submit(window);
  assert.equal(window.document.querySelector('[data-result]').dataset.verdict, 'revise');

  window.document.querySelector('[data-clear-draft]').click();
  assert.equal(window.localStorage.getItem('oob-human-review-draft-v1'), null);
  assert.equal(window.document.querySelector('[data-result-wrap]').hidden, true);
  assert.match(window.document.querySelector('[data-progress-count]').textContent, /0 of 10/);
}

{
  const window = createPage();
  answerAll(window, { dignity: 'attention' });
  submit(window);
  assert.equal(window.document.querySelector('[data-result]').dataset.verdict, 'revise');
  assert.equal(window.document.querySelector('[data-next-primary]').getAttribute('href'), '/services/responsible-ai-implementation/');
}

{
  const window = createPage();
  answerAll(window, { sources: 'unsure' });
  submit(window);
  assert.equal(window.document.querySelector('[data-result]').dataset.verdict, 'pause');
  assert.match(window.document.querySelector('[data-result-title]').textContent, /Do not ask someone to rely/);
}

console.log('Human Review DOM tests passed.');
