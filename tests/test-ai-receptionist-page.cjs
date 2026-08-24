const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(__dirname, '..');
const pagePath = path.join(root, 'services/ai-receptionist-small-business/index.html');
const html = fs.readFileSync(pagePath, 'utf8');

(async () => {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error.message));
  virtualConsole.on('error', (message) => errors.push(String(message)));

  const dom = new JSDOM(html, {
    url: 'https://skills.oobcreative.com/services/ai-receptionist-small-business/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
  });

  const { document, Event } = dom.window;
  const $ = (selector) => document.querySelector(selector);
  const tick = () => new Promise((resolve) => dom.window.setTimeout(resolve, 0));

  assert.equal(document.querySelectorAll('h1').length, 1, 'Page has one H1');
  assert.match($('h1').textContent, /Cover missed calls/i);
  assert.match(document.title, /AI Receptionist for Small Business/);
  assert.match($('meta[name="description"]').content, /AI receptionist software/i);
  assert.equal($('link[rel="canonical"]').href, 'https://skills.oobcreative.com/services/ai-receptionist-small-business/');
  assert.ok($('a[href="/services/local-ai-systems/#fit-request"]'), 'Page links to the local fit request');
  assert.equal(document.querySelectorAll('.content-table tbody tr').length, 3, 'Comparison table has three options');
  assert.match(document.body.textContent, /software, an answering service or a custom pilot/i);
  assert.doesNotMatch(document.body.textContent, /Out of box, in practice|pretending a person did|revolution|transform your business/i);

  const controls = [...document.querySelectorAll('#missed-call-calculator input')];
  assert.equal(controls.length, 4);
  controls.forEach((control) => {
    assert.ok(control.id, `${control.name} has an ID`);
    assert.ok(document.querySelector(`label[for="${control.id}"]`), `${control.name} has a label`);
  });

  $('#missed-call-calculator').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await tick();
  assert.equal($('#calculator-result').hidden, false, 'Calculator shows a result');
  assert.equal(document.activeElement, $('#calculator-result'), 'Calculator result receives focus');
  assert.equal($('#weekly-estimate').textContent, '$375/week');
  assert.match($('#monthly-estimate').textContent, /\$1,624\/month/);
  assert.match($('#breakeven-estimate').textContent, /13 otherwise-missed booked calls/);
  assert.match($('#calculator-status').textContent, /Nothing was saved or sent/);

  $('#calls-per-week').value = '10';
  $('#missed-percent').value = '10';
  $('#customer-value').value = '0';
  $('#booking-percent').value = '0';
  $('#missed-call-calculator').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await tick();
  assert.equal($('#weekly-estimate').textContent, '$0/week');
  assert.match($('#breakeven-estimate').textContent, /Add a customer value and likely booking rate/);

  $('#missed-call-calculator').reset();
  await tick();
  assert.equal($('#calculator-result').hidden, true, 'Reset hides result');
  assert.match($('#calculator-status').textContent, /Example values restored/);
  assert.deepEqual(errors, [], `No browser errors expected: ${errors.join('; ')}`);

  console.log('AI receptionist comparison page tests passed.');
})();
