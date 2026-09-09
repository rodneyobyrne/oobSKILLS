const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const contextScript = fs.readFileSync(path.join(root, 'industry-tool-context.js'), 'utf8');

function radio(name, value, checked = false) {
  return `<input type="radio" name="${name}" value="${value}" ${checked ? 'checked' : ''}>`;
}

async function scenario({ pathname, industry, form, result = '<section id="result"></section>', expectedHref, expectedTitle }) {
  const html = `<!doctype html><html><body><main><section class="content-hero"></section><form id="tool">${form}<button type="submit">Submit</button></form>${result}</main></body></html>`;
  const dom = new JSDOM(html, { url: `https://skills.oobcreative.com${pathname}?industry=${industry}&source=industry-tools`, runScripts: 'dangerously', pretendToBeVisual: true });
  dom.window.eval(contextScript);
  const formElement = dom.window.document.querySelector('form');
  formElement.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise((resolve) => dom.window.setTimeout(resolve, 5));
  const block = dom.window.document.querySelector('.industry-result-next');
  assert.ok(block, `${pathname} produces an industry-aware next step`);
  assert.equal(block.querySelector('a.button').getAttribute('href'), expectedHref);
  if (expectedTitle) assert.equal(block.querySelector('h3').textContent, expectedTitle);
  assert.ok(dom.window.document.querySelector('.industry-context-bar'), `${pathname} shows context`);
  dom.window.close();
}

(async () => {
  await scenario({
    pathname: '/tools/customer-contact-workflow-review/', industry: 'plumbing',
    form: '<select name="gap"><option value="answer" selected>Answer</option></select>',
    expectedHref: '/voice-agent/home-services/', expectedTitle: 'Call coverage may be the first useful change.',
  });
  await scenario({
    pathname: '/tools/customer-contact-workflow-review/', industry: 'property-management',
    form: '<select name="gap"><option value="route" selected>Route</option></select>',
    expectedHref: '/voice-agent/property-management/',
  });
  await scenario({
    pathname: '/tools/customer-contact-workflow-review/', industry: 'construction',
    form: '<select name="gap"><option value="followup" selected>Follow up</option></select>',
    expectedHref: '/tools/workflow-systems-review/?industry=construction&source=industry-result', expectedTitle: 'Fix the follow-up workflow before adding a new front door.',
  });
  await scenario({
    pathname: '/tools/workflow-systems-review/', industry: 'construction', form: '',
    expectedHref: '/services/workflow-systems-integration/',
  });
  const safeFit = [radio('sensitive', 'no', true), radio('consequence', 'no', true), radio('reviewer', 'yes', true), radio('owner', 'yes', true)].join('');
  await scenario({
    pathname: '/tools/ai-fit-check/', industry: 'healthcare', form: safeFit,
    expectedHref: '/tools/ai-pilot-starter/?industry=healthcare&source=industry-result', expectedTitle: 'Test the smallest safe version before choosing a platform.',
  });
  const unsafeFit = [radio('sensitive', 'yes', true), radio('consequence', 'yes', true), radio('reviewer', 'no', true), radio('owner', 'unclear', true)].join('');
  await scenario({
    pathname: '/tools/ai-fit-check/', industry: 'healthcare', form: unsafeFit,
    expectedHref: '/tools/human-review-checklist/?industry=healthcare&source=industry-result', expectedTitle: 'Do not automate this yet.',
  });
  await scenario({
    pathname: '/tools/human-review-checklist/', industry: 'legal', form: '',
    result: '<section data-result-wrap><div data-result data-verdict="pause"></div></section>',
    expectedHref: '/tools/ai-fit-check/?industry=legal&source=industry-result', expectedTitle: 'Keep this work paused.',
  });
  await scenario({
    pathname: '/tools/human-review-checklist/', industry: 'financial-services', form: '',
    result: '<section data-result-wrap><div data-result data-verdict="pause"></div></section>',
    expectedHref: '/tools/ai-fit-check/?industry=financial-services&source=industry-result', expectedTitle: 'Keep this work paused.',
  });
  console.log('Industry context and result-routing tests passed.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
