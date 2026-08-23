const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(__dirname, '..');
const pagePath = path.join(root, 'services/local-ai-systems/index.html');
const html = fs.readFileSync(pagePath, 'utf8');

(async () => {
  const errors = [];
  let copiedText = '';
  let downloadedName = '';
  let downloadedText = '';
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error.message));
  virtualConsole.on('error', (message) => errors.push(String(message)));

  const dom = new JSDOM(html, {
    url: 'https://skills.oobcreative.com/services/local-ai-systems/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.Blob = class Blob {
        constructor(parts) { downloadedText = parts.join(''); }
      };
      window.URL.createObjectURL = () => 'blob:test';
      window.URL.revokeObjectURL = () => {};
      Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async (text) => { copiedText = text; } },
      });
      const originalClick = window.HTMLAnchorElement.prototype.click;
      window.HTMLAnchorElement.prototype.click = function click() {
        if (this.download) downloadedName = this.download;
        else originalClick.call(this);
      };
    },
  });

  const { document, Event } = dom.window;
  const $ = (selector) => document.querySelector(selector);
  const tick = () => new Promise((resolve) => dom.window.setTimeout(resolve, 0));
  const fill = (selector, value) => {
    const field = $(selector);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const submit = () => $('#local-fit-form').dispatchEvent(
    new Event('submit', { bubbles: true, cancelable: true })
  );

  assert.equal(document.querySelectorAll('h1').length, 1, 'Page has one H1');
  assert.match($('h1').textContent, /Stay reachable/i);
  assert.equal($('#local-fit-form').getAttribute('novalidate'), '');
  assert.match($('#fit-request').textContent, /Nothing you enter here is sent, saved or logged/i);
  assert.equal($('a.visible-email').textContent.trim(), 'hello@oobcreative.com');

  const controls = [...document.querySelectorAll('#local-fit-form input, #local-fit-form textarea, #local-fit-form select')];
  assert.equal(controls.length, 5);
  controls.forEach((control) => {
    assert.ok(control.id, `${control.name} has an ID`);
    assert.ok(document.querySelector(`label[for="${control.id}"]`), `${control.name} has a label`);
  });

  submit();
  assert.equal($('#fit-request-error').hidden, false, 'Incomplete request shows an error');
  assert.equal($('#fit-business').getAttribute('aria-invalid'), 'true');
  assert.equal(document.activeElement, $('#fit-business'), 'First invalid field receives focus');
  assert.equal($('#fit-request-result').hidden, true);

  fill('#fit-business', 'High Country Repair');
  fill('#fit-town', 'Carbondale and Basalt');
  fill('#fit-problem', 'Calls arrive while the crew is on a job, so estimate requests wait until evening.');
  fill('#fit-human', 'Pricing exceptions, urgent safety questions and final approval must reach the owner.');
  fill('#fit-reply', 'A focused local coffee');
  submit();

  const result = $('#fit-request-result');
  const brief = $('#fit-request-brief').textContent;
  assert.equal(result.hidden, false, 'Complete request produces a result');
  assert.equal(document.activeElement, result, 'Prepared result receives focus');
  assert.match(brief, /High Country Repair/);
  assert.match(brief, /Carbondale and Basalt/);
  assert.match(brief, /What must remain human:/);
  assert.match(brief, /does not reserve or purchase a pilot/);
  assert.match($('#fit-request-status').textContent, /Nothing has been sent/i);

  const emailHref = $('#fit-email-link').getAttribute('href');
  assert.ok(emailHref.startsWith('mailto:hello@oobcreative.com?'));
  assert.match(decodeURIComponent(emailHref), /High Country Repair/);
  assert.match(decodeURIComponent(emailHref), /Nothing has been sent|initial fit review/i);

  $('#fit-copy').click();
  await tick();
  assert.equal(copiedText, brief, 'Copy action uses the prepared brief');
  assert.match($('#fit-request-status').textContent, /copied/i);
  assert.match($('#fit-request-status').textContent, /Nothing has been sent/i);

  $('#fit-download').click();
  assert.equal(downloadedName, 'oobcreative-local-ai-fit-request.txt');
  assert.equal(downloadedText, brief);
  assert.match($('#fit-request-status').textContent, /downloaded/i);

  $('#fit-edit').click();
  assert.equal(result.hidden, true, 'Edit action hides the stale brief');
  assert.equal(document.activeElement, $('#fit-business'));

  submit();
  assert.equal(result.hidden, false);
  fill('#fit-problem', 'A revised missed-call problem.');
  assert.equal(result.hidden, true, 'Editing an answer hides the stale brief');

  $('#local-fit-form').reset();
  await tick();
  assert.equal($('#fit-business').value, '');
  assert.equal(result.hidden, true);
  assert.equal($('#fit-request-error').hidden, true);
  assert.match($('#fit-form-status').textContent, /Nothing was saved or sent/i);
  assert.equal(document.activeElement, $('#fit-business'));

  const stripeLinks = [...document.querySelectorAll('a[href^="https://buy.stripe.com/"]')];
  assert.equal(stripeLinks.length, 1, 'Page exposes one Stripe payment path');
  assert.equal(stripeLinks[0].href, 'https://buy.stripe.com/14A6oJaoq2HP7eb22Kc7u00');
  assert.match(stripeLinks[0].getAttribute('aria-label'), /after written fit and start-date confirmation/i);
  assert.match(stripeLinks[0].closest('.product-summary').textContent, /Do not use checkout before written fit and start-date confirmation/i);

  assert.doesNotMatch(html, /localStorage|sessionStorage|XMLHttpRequest|\bfetch\s*\(|console\.log/);
  assert.doesNotMatch(html, /calendar theater|founder capacity|internal strategy/i);
  assert.deepEqual(errors, [], `No browser errors expected: ${errors.join('; ')}`);

  console.log('Local AI fit request DOM tests passed.');
})();
