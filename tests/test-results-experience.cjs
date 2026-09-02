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
assert.match(testPlan, /14-Day AI Test Plan/, 'AI pilot resource may retain the plain-language 14-day plan description');
assert.doesNotMatch(testPlan, />First AI Pilot Brief</, 'AI pilot resource should not expose the old brief name');
assert.match(testPlan, /Test AI on one real task before investing in a bigger system\./, 'AI pilot resource should explain the job in plain language');

const freeTools = read('free-tools/index.html');
assert.match(freeTools, /<h3>Review Your Workday for AI<\/h3>/, 'resources directory should expose the first AI path step');
assert.match(freeTools, /<h3>Start an AI Pilot<\/h3>/, 'resources directory should use the canonical pilot name');
assert.match(freeTools, /<h3>Map Your AI Workflow<\/h3>/, 'resources directory should expose the implementation step');
assert.match(freeTools, /href="\/workfiles\/ai-workday-map\/"/, 'resources directory should link to the real workflow mapping tool');

const workflowMap = read('workfiles/ai-workday-map/index.html');
assert.match(workflowMap, /<title>Map Your AI Workflow \| oobCREATIVE<\/title>/, 'workflow map should be a real standalone tool');
assert.doesNotMatch(workflowMap, /http-equiv="refresh"/, 'workflow map should not redirect back to AI Workday Review');
assert.match(workflowMap, /Build my workflow map/, 'workflow map should provide an operationalization form');
assert.match(workflowMap, /AI-supported step/, 'workflow map should define the bounded AI-supported step');
assert.match(workflowMap, /Human Review Checklist/, 'workflow map should keep human review connected to implementation');

const contactReview = read('tools/customer-contact-workflow-review/index.html');
assert.match(contactReview, /href="tel:9704048398"/, 'customer-contact result should offer the live AI receptionist proof call');
assert.match(contactReview, /Call our AI Receptionist and hear what is possible\./, 'customer-contact proof CTA should explain the experience');
assert.match(contactReview, /href="\/tools\/workflow-systems-review\/"/, 'customer-contact result should offer a self-service workflow next step');
assert.match(contactReview, /href="\/tools\/ai-fit-check\/"/, 'customer-contact result should offer AI fit as a self-service next step');

console.log('Results experience regression checks passed.');
