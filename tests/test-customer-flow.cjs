const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const engine = require('../_site/assessments/customer-flow-review/decision-engine.js');

const neverTasks = {
  copy: 'never', reenter: 'never', check: 'never', remind: 'never', tell: 'never', handled: 'never'
};

const base = {
  contactChannels: ['phone', 'email'],
  responseConfidence: 'very',
  missedCall: 'voicemail',
  infoPlaces: ['crm'],
  historyEase: 'immediate',
  familiarPhrase: 'system',
  taskFrequency: neverTasks,
  adminTime: 'under1',
  toolCategories: ['crm', 'phone'],
  toolFeeling: 'together',
  growthChanges: ['none'],
  paceMatch: 'yes',
  improvementPriorities: ['existing'],
  yearConcern: 'nothing',
  changeTiming: 'exploring',
  slowPeriod: ''
};

function evaluate(overrides) {
  return engine.evaluate({ ...base, ...overrides });
}

const holding = evaluate({});
assert.equal(holding.stage, 1);
assert.equal(holding.stageName, 'Holding Up Well');
assert.equal(holding.statuses.communication, 'Steady');
assert.match(holding.summary, /protect what is working/i);
assert.ok(holding.workingSignals.length >= 3);

const manyChannels = evaluate({
  contactChannels: ['phone', 'email', 'website', 'text', 'google', 'social', 'booking'],
  infoPlaces: ['crm', 'email', 'texts', 'sheets', 'calendar']
});
assert.equal(manyChannels.scores.communication, holding.scores.communication, 'More contact channels alone must not increase friction');
assert.equal(manyChannels.scores.information, holding.scores.information, 'More information locations alone must not increase friction');
assert.equal(manyChannels.stage, 1);

const uncertainty = evaluate({ missedCall: 'unsure', adminTime: 'unknown', toolFeeling: 'unsure', yearConcern: 'unknown' });
assert.equal(uncertainty.stage, 1, 'Uncertainty alone must not be treated as friction');
assert.equal(uncertainty.visibility.level, 'Limited visibility');
assert.equal(uncertainty.visibility.signals.length, 4);

const patchwork = evaluate({
  responseConfidence: 'mostly',
  missedCall: 'callback',
  historyEase: 'easy',
  familiarPhrase: 'lookup',
  taskFrequency: Object.fromEntries(Object.keys(neverTasks).map((key) => [key, 'occasionally'])),
  adminTime: 'one3',
  growthChanges: ['customers', 'inquiries'],
  paceMatch: 'mostly',
  toolFeeling: 'separate'
});
assert.equal(patchwork.stage, 2);
assert.equal(patchwork.stageName, 'Some Patchwork Is Showing');
assert.match(patchwork.toolContext, /gaps between them/);

const stretched = evaluate({
  responseConfidence: 'depends',
  missedCall: 'depends',
  historyEase: 'couple',
  familiarPhrase: 'talked',
  taskFrequency: Object.fromEntries(Object.keys(neverTasks).map((key) => [key, 'weekly'])),
  adminTime: 'four8',
  growthChanges: ['customers', 'employees', 'inquiries'],
  paceMatch: 'little',
  toolFeeling: 'added',
  yearConcern: 'time',
  changeTiming: 'one3'
});
assert.equal(stretched.stage, 3);
assert.equal(stretched.stageName, 'Successful but Stretched');
assert.ok(stretched.scores.workflow >= 40);
assert.ok(stretched.recognitionSignals.some((item) => /Did someone already talk/.test(item)));
assert.equal(stretched.action, 'Map the customer flow.');

const bridging = evaluate({
  responseConfidence: 'occasional',
  missedCall: 'several',
  historyEase: 'depends',
  familiarPhrase: 'ask',
  taskFrequency: Object.fromEntries(Object.keys(neverTasks).map((key) => [key, 'daily'])),
  adminTime: 'one2days',
  growthChanges: ['customers', 'employees', 'locations', 'inquiries'],
  paceMatch: 'no',
  toolFeeling: 'outgrown',
  yearConcern: 'time',
  changeTiming: 'exploring'
});
assert.equal(bridging.stage, 4);
assert.equal(bridging.stageName, 'People Are Bridging the Systems');
assert.match(bridging.summary, /Employees are doing enough work between tools/);

const growth = evaluate({
  responseConfidence: 'losing',
  missedCall: 'lose',
  historyEase: 'difficult',
  familiarPhrase: 'handled',
  taskFrequency: Object.fromEntries(Object.keys(neverTasks).map((key) => [key, 'constantly'])),
  adminTime: 'over2days',
  growthChanges: ['customers', 'employees', 'locations', 'inquiries', 'software'],
  paceMatch: 'workarounds',
  toolFeeling: 'outgrown',
  yearConcern: 'growth',
  changeTiming: 'now',
  improvementPriorities: ['missed', 'admin', 'existing']
});
assert.equal(growth.stage, 5);
assert.equal(growth.stageName, 'Growth Is Amplifying the Gaps');
assert.equal(growth.statuses.changePressure, 'High');
assert.ok(growth.focusAreas.length >= 3);
assert.ok(growth.usefulTools.some((item) => item.key === 'inquiry'));
assert.ok(growth.usefulTools.some((item) => item.key === 'workflow'));
assert.ok(growth.beforeBuying.some((item) => /already pay for/.test(item)));

for (const result of [holding, manyChannels, uncertainty, patchwork, stretched, bridging, growth]) {
  for (const key of ['communication', 'information', 'workflow', 'capacity', 'changePressure']) {
    assert.ok(result.scores[key] >= 0 && result.scores[key] <= 100, `${key} score in range`);
  }
  assert.ok(Array.isArray(result.workingSignals));
  assert.ok(Array.isArray(result.recognitionSignals));
  assert.ok(Array.isArray(result.usefulTools));
}

const reviewSource = fs.readFileSync(path.join(__dirname, '../_site/assessments/customer-flow-review/review.js'), 'utf8');
assert.doesNotMatch(reviewSource, /\bfetch\s*\(/, 'Assessment must not automatically transmit answers with fetch');
assert.doesNotMatch(reviewSource, /XMLHttpRequest/, 'Assessment must not automatically transmit answers with XHR');
assert.doesNotMatch(reviewSource, /navigator\.sendBeacon/, 'Assessment must not automatically transmit answers with sendBeacon');
assert.match(reviewSource, /mailto:hello@oobcreative\.com/, 'Human review sharing must be explicit mailto initiated by the visitor');

console.log('Customer Flow Health v2.1 decision engine: neutrality, visibility, sharing and stage assertions passed.');
