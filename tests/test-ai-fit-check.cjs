const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const engine = require(path.join(root, 'tools/ai-fit-check/fit-check-engine.js'));
const html = fs.readFileSync(path.join(root, 'tools/ai-fit-check/index.html'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'tools/ai-fit-check/fit-check.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'tools/ai-fit-check/fit-check.css'), 'utf8');

function assertActionable(brief, expectedScore, expectedNext) {
  assert.equal(brief.score, expectedScore);
  assert.equal(brief.next.href, expectedNext);
  for (const value of [brief.title, brief.summary, brief.role, brief.humanResponsibility, brief.watch, brief.next.title, brief.next.copy, brief.next.label]) {
    assert.ok(value && value.trim().length > 12, `expected useful copy for ${expectedScore}`);
  }
  assert.equal(brief.factors.length, 4, 'brief should explain four decision factors');
  for (const factor of brief.factors) {
    assert.ok(['strong', 'mixed', 'weak'].includes(factor.state));
    assert.ok(factor.label && factor.detail && factor.meaning);
  }
  assert.equal(brief.plan.length, 3, 'every brief should end with three bounded actions');
  brief.plan.forEach((step, index) => {
    assert.equal(step.number, index + 1);
    assert.ok(step.action.length > 8, 'action needs a clear verb-led label');
    assert.ok(step.instruction.length > 20, 'action needs enough instruction to do it');
    assert.ok(step.doneWhen.length > 20, 'action needs a completion condition');
  });
}

const ready = engine.evaluate({
  tasks: ['customer-response', 'admin-summary'],
  jobType: 'customer-contact',
  answers: {
    repeated: 'yes', defined: 'yes', sources: 'yes', sensitive: 'no', consequence: 'no',
    reviewer: 'yes', owner: 'yes', reversible: 'yes'
  }
});
assertActionable(ready, 'Ready to test', '/tools/ai-pilot-starter/');
assert.match(ready.role, /customer|route|request|review/i);
assert.equal(ready.blockers.length, 0);

const sensitiveIntake = engine.evaluate({
  tasks: ['customer-response', 'admin-summary'],
  jobType: 'customer-contact',
  answers: {
    repeated: 'yes', defined: 'yes', sources: 'yes', sensitive: 'yes', consequence: 'yes',
    reviewer: 'yes', owner: 'yes', reversible: 'yes'
  }
});
assertActionable(sensitiveIntake, 'Support only', '/tools/human-review-checklist/');
assert.ok(sensitiveIntake.blockers.some((item) => /data boundary/i.test(item.title)));
assert.ok(sensitiveIntake.blockers.some((item) => /consequential|decision/i.test(item.title)));
assert.match(sensitiveIntake.plan[0].doneWhen, /permitted\/prohibited/i);

const vagueResearch = engine.evaluate({
  tasks: ['chatgpt', 'research-planning'],
  jobType: 'decision-support',
  answers: {
    repeated: 'no', defined: 'no', sources: 'no', sensitive: 'no', consequence: 'no',
    reviewer: 'yes', owner: 'yes', reversible: 'yes'
  }
});
assertActionable(vagueResearch, 'Define first', '/tools/workflow-systems-review/');
assert.match(vagueResearch.plan[1].action, /source|finish/i);

const unownedRouting = engine.evaluate({
  tasks: ['workflow-automation', 'customer-response'],
  jobType: 'systems',
  answers: {
    repeated: 'yes', defined: 'yes', sources: 'yes', sensitive: 'no', consequence: 'no',
    reviewer: 'no', owner: 'unclear', reversible: 'no'
  }
});
assertActionable(unownedRouting, 'Prepare first', '/tools/human-review-checklist/');
assert.ok(unownedRouting.blockers.some((item) => /reviewer/i.test(item.title)));
assert.ok(unownedRouting.blockers.some((item) => /easier to stop/i.test(item.title)));

const mixedMessaging = engine.evaluate({
  tasks: ['chatgpt', 'content-drafting', 'research-planning'],
  jobType: 'messaging',
  answers: {
    repeated: 'sometimes', defined: 'partly', sources: 'yes', sensitive: 'no', consequence: 'possibly',
    reviewer: 'yes', owner: 'yes', reversible: 'partly'
  }
});
assertActionable(mixedMessaging, 'Shape the use', '/assessments/ai-workday-review/');
assert.match(mixedMessaging.plan[0].action, /split|smaller/i);

const samplePublicPage = `
Title: Mountain Service Co. | Repair and Scheduling
URL Source: https://example.com/service/
# Repair service and scheduling
We provide repair and maintenance services for local customers.
Book an appointment or request a service visit using our online form.
Contact our team for scheduling, estimates and follow-up.
`;
const research = engine.analyzePublicPage(samplePublicPage, 'https://example.com/service/', {
  tasks: ['customer-response'], jobType: 'customer-contact'
});
assert.ok(research);
assert.match(research.title, /Mountain Service Co/);
assert.ok(research.evidence.some((item) => /customer action/i.test(item.title)));
assert.match(research.actionHint, /booking|request|contact/i);
assert.match(research.boundary, /cannot confirm/i);

const readyWithResearch = engine.evaluate({
  tasks: ['customer-response'],
  jobType: 'customer-contact',
  research,
  answers: {
    repeated: 'yes', defined: 'yes', sources: 'yes', sensitive: 'no', consequence: 'no',
    reviewer: 'yes', owner: 'yes', reversible: 'yes'
  }
});
assert.equal(readyWithResearch.score, ready.score, 'public page evidence must not override fit scoring');
assert.match(readyWithResearch.plan[0].instruction, /booking|request|contact/i, 'public evidence should sharpen the action plan');

assert.equal(engine.normalizePublicUrl('example.com/page#section'), 'https://example.com/page');
for (const unsafe of ['http://localhost/test', 'http://127.0.0.1/', 'http://10.0.0.4/', 'http://192.168.1.2/', 'http://172.16.0.1/', 'http://169.254.1.1/', 'http://user:pass@example.com/']) {
  assert.equal(engine.normalizePublicUrl(unsafe), null, `must reject non-public URL: ${unsafe}`);
}

assert.match(html, /How are you considering using AI in this work\?/);
assert.match(html, /Choose all that apply\. Real work often involves more than one kind of AI support\./);
assert.equal((html.match(/name="task"/g) || []).length, 6, 'existing multi-select choices must stay intact');
assert.match(html, /Public page related to this work/);
assert.match(html, /Jina Reader/);
assert.match(html, /Your assessment answers stay in this browser/);
assert.match(html, /8 quick questions/);
assert.match(html, /about 3 minutes/);
assert.match(html, /You’ll leave with a clear AI fit result/);
assert.match(html, /name="workLabel"/);
assert.match(html, /Task shape · Questions 1–3 of 8/);
assert.match(html, /Risk · Questions 4–5 of 8/);
assert.match(html, /Human control · Questions 6–8 of 8/);
assert.match(html, /class="fit-start-summary"/);
assert.match(html, /class="fit-question-group"/);
assert.match(html, /Could a wrong result seriously affect someone’s health, safety, rights, job, money or trust\?/);
assert.match(html, /Can you test this safely on a small scale and stop if needed\?/);
assert.match(html, /Want a more specific result\? Add a public page related to this task\./);
assert.ok(html.indexOf('name="contextUrl"') > html.indexOf('name="reversible"'), 'public URL enhancement should appear after the eight core questions');
assert.match(html, /Get my AI fit result/);
for (const hook of ['data-fit-human', 'data-fit-factors', 'data-fit-research', 'data-fit-blockers', 'data-fit-plan']) {
  assert.match(html, new RegExp(hook));
}
assert.match(controller, /https:\/\/r\.jina\.ai\//);
assert.match(controller, /Only this public URL will be sent for page review/);
assert.match(controller, /brief\.workLabel=a\.workLabel/);
assert.match(controller, /Work checked:/);
assert.match(controller, /AI Task Fit Brief copied/);
assert.match(css, /\.fit-start-summary/);
assert.match(css, /\.fit-question-group/);
assert.match(css, /\.fit-factor-row/);
assert.match(css, /\.fit-done-when/);
assert.match(css, /\.fit-result-followup \{ display: block !important;/, 'print CSS must include the action plan');

console.log('AI Fit Check actionable-brief scenario tests passed.');
