const assert = require('node:assert/strict');
const engine = require('../_site/assessments/customer-flow-review/decision-engine.js');

const neverTasks = {
  copy: 'never', reenter: 'never', check: 'never', remind: 'never', tell: 'never',
  voicemail: 'never', messages: 'never', contacted: 'never', lookup: 'never', reschedule: 'never'
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
  slowPeriod: 'varies'
};

function evaluate(overrides) {
  return engine.evaluate({ ...base, ...overrides });
}

const working = evaluate({});
assert.equal(working.stage, 1);
assert.equal(working.stageName, 'Working Fine');
assert.equal(working.statuses.communication, 'Steady');
assert.match(working.summary, /would not recommend replacing technology/);

const patchwork = evaluate({
  contactChannels: ['phone', 'email', 'website'],
  responseConfidence: 'mostly',
  missedCall: 'callback',
  infoPlaces: ['crm', 'email', 'calendar'],
  historyEase: 'easy',
  familiarPhrase: 'lookup',
  taskFrequency: Object.fromEntries(Object.keys(neverTasks).map((key) => [key, 'occasionally'])),
  adminTime: 'one3',
  growthChanges: ['customers', 'inquiries'],
  paceMatch: 'mostly',
  toolFeeling: 'separate'
});
assert.equal(patchwork.stage, 2);
assert.equal(patchwork.stageName, 'Patchwork Starting');
assert.match(patchwork.toolContext, /friction is more likely in the gaps/);

const stretched = evaluate({
  contactChannels: ['phone', 'email', 'website', 'text', 'google'],
  responseConfidence: 'depends',
  missedCall: 'depends',
  infoPlaces: ['crm', 'email', 'texts', 'sheets'],
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

const creatingWork = evaluate({
  contactChannels: ['phone', 'email', 'website', 'text', 'google', 'social', 'booking'],
  responseConfidence: 'occasional',
  missedCall: 'several',
  infoPlaces: ['crm', 'email', 'texts', 'sheets', 'memory'],
  historyEase: 'depends',
  familiarPhrase: 'ask',
  taskFrequency: Object.fromEntries(Object.keys(neverTasks).map((key) => [key, 'daily'])),
  adminTime: 'one2days',
  growthChanges: ['customers', 'employees', 'locations', 'inquiries', 'software'],
  paceMatch: 'no',
  toolFeeling: 'outgrown',
  yearConcern: 'experience',
  changeTiming: 'exploring'
});
assert.equal(creatingWork.stage, 4);
assert.equal(creatingWork.stageName, 'Systems Are Creating Work');
assert.match(creatingWork.summary, /Employees are functioning as the connections between systems/);

const growthRisk = evaluate({
  contactChannels: ['phone', 'email', 'website', 'text', 'google', 'social', 'booking'],
  responseConfidence: 'occasional',
  missedCall: 'several',
  infoPlaces: ['crm', 'email', 'texts', 'sheets', 'memory'],
  historyEase: 'depends',
  familiarPhrase: 'handled',
  taskFrequency: Object.fromEntries(Object.keys(neverTasks).map((key) => [key, 'daily'])),
  adminTime: 'one2days',
  growthChanges: ['customers', 'employees', 'locations', 'inquiries', 'software'],
  paceMatch: 'workarounds',
  toolFeeling: 'outgrown',
  yearConcern: 'growth',
  changeTiming: 'now',
  improvementPriorities: ['missed', 'admin', 'existing']
});
assert.equal(growthRisk.stage, 5);
assert.equal(growthRisk.stageName, 'Growth Risk');
assert.equal(growthRisk.statuses.changePressure, 'High');
assert.ok(growthRisk.focusAreas.length >= 3);
assert.ok(growthRisk.focusAreas.some((item) => /systems you already pay for/.test(item)));

for (const result of [working, patchwork, stretched, creatingWork, growthRisk]) {
  assert.ok(result.scores.communication >= 0 && result.scores.communication <= 100);
  assert.ok(result.scores.information >= 0 && result.scores.information <= 100);
  assert.ok(result.scores.workflow >= 0 && result.scores.workflow <= 100);
  assert.ok(result.scores.capacity >= 0 && result.scores.capacity <= 100);
  assert.ok(result.scores.changePressure >= 0 && result.scores.changePressure <= 100);
}

console.log('Customer Flow Health decision engine: 25+ assertions passed.');
