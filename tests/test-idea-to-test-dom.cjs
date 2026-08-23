const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const { startStaticServer } = require('./static-server.cjs');

(async () => {
  const server = await startStaticServer();
  const errors = [];
  let downloadedText = '';
  let downloadedName = '';
  let copiedText = '';
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error.message));
  virtualConsole.on('error', (message) => errors.push(message));

  try {
    const dom = await JSDOM.fromURL(`${server.origin}/assessments/idea-to-test-review/`, {
      resources: 'usable',
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      virtualConsole,
      beforeParse(window) {
        window.HTMLElement.prototype.scrollIntoView = function () {};
        window.confirm = () => true;
        window.Blob = class Blob {
          constructor(parts) { downloadedText = parts.join(''); }
        };
        window.URL.createObjectURL = () => 'blob:test';
        window.URL.revokeObjectURL = () => {};
        window.navigator.clipboard = { writeText: async (text) => { copiedText = text; } };
        const originalClick = window.HTMLAnchorElement.prototype.click;
        window.HTMLAnchorElement.prototype.click = function () {
          if (this.download) downloadedName = this.download;
          else originalClick.call(this);
        };
      },
    });

    await new Promise((resolve) => dom.window.addEventListener('load', () => setTimeout(resolve, 25)));
    const { document, Event } = dom.window;
    const $ = (selector) => document.querySelector(selector);

    function input(selector, value) {
      const field = $(selector);
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function select(selector, value) {
      input(selector, value);
      $(selector).dispatchEvent(new Event('change', { bubbles: true }));
    }

    function check(selector) {
      const field = $(selector);
      field.checked = true;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    }

    assert.equal(document.title, 'Free Idea-to-Test Review | oobCREATIVE');
    assert.equal(document.querySelectorAll('h1').length, 1);
    assert.equal($('#progress-label').textContent, 'Step 1 of 4');
    assert.equal($('.skip-link').getAttribute('href'), '#main-content');

    const ids = Array.from(document.querySelectorAll('[id]')).map((element) => element.id);
    assert.equal(new Set(ids).size, ids.length, 'IDs are unique');
    for (const control of document.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]), textarea, select')) {
      assert.ok(control.id, `Control ${control.name} has an ID`);
      assert.ok(document.querySelector(`label[for="${control.id}"]`), `Control ${control.name} has a label`);
    }
    for (const fieldset of document.querySelectorAll('fieldset')) {
      assert.ok(fieldset.querySelector(':scope > legend'), 'Every fieldset has a direct legend');
    }

    input('#project-name', 'Local Follow-up Test');
    input('#role', 'Independent consultant');
    check('input[name="trigger"][value="request"]');
    check('input[name="protect"][value="credibility"]');
    select('#direction-state', 'few');
    $('#next-step').click();
    assert.equal($('#progress-label').textContent, 'Step 2 of 4');

    input('#idea', 'Help local service businesses respond to missed inquiries with a human-reviewed follow-up process.');
    input('#set-aside', 'A full CRM implementation and every other business type.');
    input('#experience', 'I have observed missed inquiry follow-up in several local service settings and have direct access to owners.');
    input('#problem', 'Qualified inquiries arrive while the owner is doing client work, then receive a late or inconsistent response.');
    select('#evidence', 'asked');
    $('#next-step').click();
    assert.equal($('#progress-label').textContent, 'Step 3 of 4');

    input('#audience', 'A local professional-service owner who receives qualified inquiries while doing client work.');
    select('#audience-clarity', 'named');
    select('#reach', 'direct');
    select('#buyer', 'known');
    select('#outcome-scope', 'bounded');
    input('#smallest-outcome', 'A reviewed follow-up map, three response drafts and one routing rule to test for two weeks.');
    input('#boundary', 'No autonomous promises, sensitive records, staff replacement or full website rebuild.');
    select('#proof', 'ready');
    input('#proof-detail', 'A sanitized missed-inquiry map and three annotated draft responses.');
    $('#next-step').click();
    assert.equal($('#progress-label').textContent, 'Step 4 of 4');

    const future = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
    const tooFar = new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10);
    select('#test-type', 'paid');
    select('#test-size', 'five');
    select('#timeframe', 'twoWeeks');
    input('#decision-date', tooFar);
    input('#invitation', 'Would you review this small follow-up pilot and decide whether it is worth testing for two weeks?');
    input('#success-signal', 'Three of five owners recognize the problem and at least one accepts a scheduled or paid next step.');
    input('#stop-condition', 'No owner recognizes the problem or the pilot requires access to sensitive records.');
    check('input[name="acknowledgement"]');
    $('#create-result').click();

    assert.equal($('#review-result').hidden, true);
    assert.match($('#form-status').textContent, /within the next 14 days/);
    input('#decision-date', future);
    $('#create-result').click();

    assert.equal($('#review-result').hidden, false);
    assert.match($('.result-verdict h3').textContent, /Ready to test/);
    assert.match($('#result-content').textContent, /Do not build yet/);
    assert.match($('#result-content').textContent, /AUDIENCE CONVERSATION/);
    assert.match($('#result-content').textContent, /No autonomous promises/);
    assert.equal($('.result-next-step a').getAttribute('href'), '/services/');
    assert.equal(errors.length, 0, errors.join('\n'));

    select('#evidence', 'assumption');
    $('#create-result').click();
    assert.match($('.result-verdict h3').textContent, /Test the problem first/);
    assert.equal($('.result-next-step a').getAttribute('href'), '/audience-review/');
    select('#evidence', 'asked');
    select('#audience-clarity', 'broad');
    $('#create-result').click();
    assert.match($('.result-verdict h3').textContent, /Narrow the test/);
    select('#audience-clarity', 'named');
    select('#proof', 'none');
    $('#create-result').click();
    assert.match($('.result-verdict h3').textContent, /Build one credibility piece first/);
    select('#proof', 'ready');
    $('#create-result').click();
    assert.match($('.result-verdict h3').textContent, /Ready to test/);

    $('#download-result').click();
    assert.equal(downloadedName, 'local-follow-up-test-idea-to-test-workfile.md');
    assert.match(downloadedText, /^# Local Follow-up Test Idea-to-Test WORKFILE/);
    assert.match(downloadedText, /## Do not build yet/);
    assert.match(downloadedText, /## Reusable briefs/);

    await $('#copy-result').click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.match(copiedText, /## Readiness decision/);
    assert.equal($('#copy-status').textContent, 'Result copied.');

    const saved = JSON.parse(dom.window.localStorage.getItem('oob-idea-to-test-review-v1'));
    assert.equal(saved.projectName, 'Local Follow-up Test');
    assert.equal(saved.acknowledgement, 'on');

    console.log('Idea-to-Test DOM flow: 44+ assertions passed.');
    dom.window.close();
  } finally {
    await server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
