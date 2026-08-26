const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(__dirname, '..');
const tools = [
  ['tools/workflow-systems-review/index.html', '/services/workflow-systems-integration/'],
  ['tools/website-message-clarity-review/index.html', '/services/website-messaging-audience-clarity/'],
  ['tools/founder-bottleneck-review/index.html', '/services/founder-knowledge-systems/'],
  ['tools/digital-project-recovery-review/index.html', '/services/digital-project-recovery/'],
  ['tools/ai-tool-match/index.html', '/services/responsible-ai-implementation/'],
  ['tools/customer-contact-workflow-review/index.html', '/services/customer-contact-automation/'],
];

(async () => {
  for (const [relativePath, servicePath] of tools) {
    const html = fs.readFileSync(path.join(root, relativePath), 'utf8');
    const errors = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', (error) => errors.push(error.message));
    virtualConsole.on('error', (message) => errors.push(String(message)));
    const dom = new JSDOM(html, {
      url: `https://skills.oobcreative.com/${relativePath.replace('index.html', '')}`,
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      virtualConsole,
    });
    const { document, Event } = dom.window;
    const form = document.querySelector('#tool');
    const result = document.querySelector('#result');
    assert.equal(document.querySelectorAll('h1').length, 1, `${relativePath} has one H1`);
    assert.ok(form, `${relativePath} has an interactive form`);
    assert.ok(result, `${relativePath} has a result region`);
    assert.equal(result.hidden, true, `${relativePath} result begins hidden`);
    for (const field of form.querySelectorAll('input[required], textarea[required]')) {
      field.value = field.type === 'number' ? '10' : 'Test input';
    }
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise((resolve) => dom.window.setTimeout(resolve, 0));
    assert.equal(result.hidden, false, `${relativePath} produces a result`);
    assert.equal(document.activeElement, result, `${relativePath} focuses the result`);
    assert.ok(document.querySelector(`a[href="${servicePath}"]`), `${relativePath} links to ${servicePath}`);
    assert.deepEqual(errors, [], `${relativePath} should not emit browser errors: ${errors.join('; ')}`);
    dom.window.close();
  }
  console.log('New review tool DOM tests passed.');
})();
