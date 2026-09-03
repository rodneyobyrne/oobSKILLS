const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'tools/ai-fit-check/index.html'), 'utf8');

function createPage() {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error.message));
  virtualConsole.on('error', (message) => errors.push(String(message)));
  const dom = new JSDOM(html, {
    url: 'https://skills.oobcreative.com/tools/ai-fit-check/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
  });
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  dom.window.navigator.clipboard = { writeText: async () => {} };
  return { window: dom.window, errors };
}

function answer(window, values) {
  window.document.querySelector('[name="task"]').value = values.task || 'respond to routine missed calls';
  window.document.querySelector('[name="jobType"]').value = values.jobType || 'customer-contact';
  if (values.contextUrl) window.document.querySelector('[name="contextUrl"]').value = values.contextUrl;
  for (const [name, value] of Object.entries(values)) {
    if (['task', 'jobType', 'contextUrl'].includes(name)) continue;
    const input = window.document.querySelector(`input[name="${name}"][value="${value}"]`);
    assert.ok(input, `missing ${name}=${value}`);
    input.checked = true;
  }
}

function submit(window) {
  window.document.querySelector('[data-fit-form]').dispatchEvent(
    new window.Event('submit', { bubbles: true, cancelable: true }),
  );
}

function result(window) {
  return {
    kicker: window.document.querySelector('[data-fit-kicker]').textContent,
    score: window.document.querySelector('[data-fit-score]').textContent,
    title: window.document.querySelector('[data-fit-title]').textContent,
    next: window.document.querySelector('[data-fit-next-link]').getAttribute('href'),
    context: window.document.querySelector('[data-fit-context-title]').textContent,
    role: window.document.querySelector('[data-fit-role]').textContent,
  };
}

{
  const { window, errors } = createPage();
  answer(window, {
    jobType: 'customer-contact',
    repeated: 'yes',
    defined: 'yes',
    sources: 'yes',
    sensitive: 'no',
    consequence: 'no',
    reviewer: 'yes',
    owner: 'yes',
    reversible: 'yes',
  });
  submit(window);
  assert.equal(result(window).score, 'Ready to test');
  assert.equal(result(window).next, '/tools/ai-pilot-starter/');
  assert.deepEqual(errors, []);
  window.close();
}

{
  const { window, errors } = createPage();
  answer(window, {
    task: 'boat building',
    jobType: 'hands-on',
    contextUrl: 'https://example.com/services/boat-building/',
    repeated: 'yes',
    defined: 'yes',
    sources: 'yes',
    sensitive: 'yes',
    consequence: 'yes',
    reviewer: 'yes',
    owner: 'yes',
    reversible: 'yes',
  });
  submit(window);
  const allYes = result(window);
  assert.equal(allYes.score, 'Support only');
  assert.match(allYes.title, /risk changes/);
  assert.match(allYes.context, /Hands-on production/);
  assert.match(allYes.role, /shop support/);
  assert.equal(allYes.next, '/tools/human-review-checklist/');
  assert.deepEqual(errors, []);
  window.close();
}

{
  const { window, errors } = createPage();
  answer(window, {
    jobType: 'decision-support',
    repeated: 'no',
    defined: 'no',
    sources: 'no',
    sensitive: 'no',
    consequence: 'no',
    reviewer: 'no',
    owner: 'no',
    reversible: 'no',
  });
  submit(window);
  const allNo = result(window);
  assert.equal(allNo.score, 'Define first');
  assert.match(allNo.title, /enough shape/);
  assert.equal(allNo.next, '/tools/workflow-systems-review/');
  assert.deepEqual(errors, []);
  window.close();
}

console.log('AI Fit Check DOM tests passed.');
