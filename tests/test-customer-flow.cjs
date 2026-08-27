const assert = require('node:assert/strict');
const engine = require('../_site/assessments/customer-flow-review/decision-engine.js');

const base = {
  relationshipModel: 'field',
  sensitiveData: 'no',
  existingSystem: 'operational',
  recordQuality: 'strong',
  primaryChannel: 'phone',
  firstCapture: 'primary',
  retyping: 'none',
  followup: 'reliable',
  conversationHistory: 'primary',
  sourceOwnership: 'clear',
  sheetsRole: 'reporting',
  integration: 'native',
  accountingAsCrm: 'no',
  accessReadiness: 'ready',
  willingness: 'yes'
};

function evaluate(overrides) {
  return engine.evaluate({ ...base, ...overrides });
}

assert.equal(evaluate({}).verdict, 'Keep the system. Fix the connections.');
assert.equal(evaluate({ existingSystem: 'sheets' }).verdict, 'Move job-based operations toward one operational source of truth.');
assert.equal(evaluate({ relationshipModel: 'professional', existingSystem: 'sheets' }).verdict, 'Use a relationship CRM as the primary customer record.');
assert.equal(evaluate({ relationshipModel: 'appointment', existingSystem: 'none' }).verdict, 'Keep the vertical platform at the center.');
assert.equal(evaluate({ relationshipModel: 'transactional', existingSystem: 'none' }).verdict, 'Keep the customer transaction system at the center.');
assert.equal(evaluate({ relationshipModel: 'mixed', existingSystem: 'scattered' }).verdict, 'Audit the customer flow before choosing another platform.');
assert.equal(evaluate({ sensitiveData: 'yes', existingSystem: 'sheets' }).verdict, 'Keep the vertical platform at the center.');

assert.equal(evaluate({ accessReadiness: 'hard' }).readiness, 'access-first');
assert.equal(evaluate({ recordQuality: 'weak' }).readiness, 'clean-first');
assert.equal(evaluate({ sourceOwnership: 'unclear' }).readiness, 'ownership-first');
assert.equal(evaluate({}).readiness, 'ready');

const sheetResult = evaluate({
  existingSystem: 'sheets',
  recordQuality: 'weak',
  firstCapture: 'inbox',
  retyping: 'frequent',
  followup: 'missed',
  conversationHistory: 'inbox',
  sourceOwnership: 'unclear',
  sheetsRole: 'central',
  integration: 'manual',
  accountingAsCrm: 'yes'
});
assert.equal(sheetResult.priorities.length, 5);
assert.ok(sheetResult.priorities.some((item) => /Clean duplicates/.test(item)));
assert.ok(sheetResult.warnings.some((item) => /Google Sheets/.test(item)));
assert.ok(sheetResult.warnings.some((item) => /Accounting software/.test(item)));
assert.equal(sheetResult.flow.length, 6);
assert.ok(sheetResult.platformExample.includes('Jobber'));

const verticalExisting = evaluate({
  relationshipModel: 'appointment',
  existingSystem: 'vertical',
  recordQuality: 'mostly'
});
assert.equal(verticalExisting.verdict, 'Keep the system. Fix the connections.');
assert.equal(verticalExisting.primarySystem, 'Existing vertical platform');

console.log('Customer Flow decision engine: 18 assertions passed.');
