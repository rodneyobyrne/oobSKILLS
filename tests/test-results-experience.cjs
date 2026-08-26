const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const css = read('tools/review-tools.css');
assert.match(css, /oob-result-rise/, 'shared review tools should include the result reveal');
assert.match(css, /prefers-reduced-motion:reduce/, 'result reveal should respect reduced motion');
assert.match(css, /result-proof-callout/, 'shared result styles should support proof/demo callouts');

const testPlan = read('tools/ai-pilot-starter/index.html');
assert.match(testPlan, /14-Day AI Test Plan/, 'free AI starter should use plain-language test-plan naming');
assert.doesNotMatch(testPlan, />First AI Pilot Brief</, 'free AI starter should not expose the old brief name');
assert.match(testPlan, /Test AI on one real task before investing in a bigger system\./, 'free test plan should explain the job in plain language');

const freeTools = read('free-tools/index.html');
assert.match(freeTools, /<h3>14-Day AI Test Plan<\/h3>/, 'free tools directory should use the new test-plan name');
assert.match(freeTools, /Build the 14-day test plan/, 'free tools directory should use a plain-language action');

const contactReview = read('tools/customer-contact-workflow-review/index.html');
assert.match(contactReview, /href="tel:9704048398"/, 'customer-contact result should offer the live AI receptionist proof call');
assert.match(contactReview, /Call our AI Receptionist and hear what is possible\./, 'customer-contact proof CTA should explain the experience');
assert.match(contactReview, /href="\/tools\/workflow-systems-review\/"/, 'customer-contact result should offer a self-service workflow next step');
assert.match(contactReview, /href="\/tools\/ai-fit-check\/"/, 'customer-contact result should offer AI fit as a self-service next step');

console.log('Results experience regression checks passed.');
