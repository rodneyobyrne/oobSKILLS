const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const pages = [
  ['plumbers', 'plumbing', '/voice-agent/home-services/'],
  ['construction', 'construction', '/voice-agent/construction/'],
  ['home-services', 'home-services', '/voice-agent/home-services/'],
  ['property-management', 'property-management', '/voice-agent/property-management/'],
  ['legal', 'legal', '/voice-agent/legal/'],
  ['healthcare', 'healthcare', '/voice-agent/healthcare/'],
  ['financial-services', 'financial-services', '/voice-agent/financial-services/'],
];

for (const [slug, context, conversion] of pages) {
  const file = path.join(root, 'tools', slug, 'index.html');
  assert.ok(fs.existsSync(file), `${slug} acquisition page exists`);
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { url: `https://skills.oobcreative.com/tools/${slug}/` });
  const { document } = dom.window;
  assert.equal(document.querySelectorAll('h1').length, 1, `${slug} has one H1`);
  assert.equal(document.querySelector('link[rel="canonical"]').href, `https://skills.oobcreative.com/tools/${slug}/`);
  assert.ok(document.querySelector('meta[name="description"]').content.length > 100, `${slug} has substantive metadata`);
  assert.equal(document.querySelectorAll('.industry-tool-card').length, 5, `${slug} has five curated tools`);
  assert.equal(document.querySelectorAll(`a[href*="industry=${context}"]`).length, 5, `${slug} launches five context-aware tools`);
  assert.ok(document.querySelector(`img[src="/images/industry-heroes/${context}.webp"]`), `${slug} has its industry hero image`);
  const heroPath = path.join(root, 'images', 'industry-heroes', `${context}.webp`);
  assert.ok(fs.existsSync(heroPath), `${slug} hero asset exists`);
  assert.ok(fs.statSync(heroPath).size > 25000, `${slug} hero asset is substantive`);
  assert.ok(document.body.textContent.length > 2400, `${slug} has substantive visible content`);
  const source = fs.readFileSync(file, 'utf8');
  assert.match(source, /CollectionPage/);
  assert.ok(source.includes(conversion.replace('/voice-agent/', '')) || source.includes('Voice Agent'), `${slug} preserves conversion context`);
  assert.doesNotMatch(document.body.textContent, /transform your business|replace your staff|revolution/i);
}

const contextScript = fs.readFileSync(path.join(root, 'industry-tool-context.js'), 'utf8');
for (const [, context, conversion] of pages) {
  assert.ok(contextScript.includes(`'${context}'`) || contextScript.includes(`${context}:`), `${context} is configured`);
  assert.ok(contextScript.includes(conversion), `${context} conversion route is configured`);
}
assert.match(contextScript, /Do not automate this yet/);
assert.match(contextScript, /ai-pilot-starter/);
assert.match(contextScript, /industry-result-next/);

console.log('Industry acquisition page tests passed.');
