const assert = require('node:assert/strict');
const engine = require('../_site/assessments/idea-to-test-review/decision-engine.js');

const base = {
  audienceClarity: 'named',
  reach: 'direct',
  evidence: 'asked',
  buyer: 'known',
  outcomeScope: 'bounded',
  proof: 'ready',
  timeframe: 'twoWeeks',
  testSize: 'five',
  testType: 'paid',
};

function verdict(overrides) {
  return engine.evaluate({ ...base, ...overrides }).verdict;
}

assert.equal(verdict({}), 'Ready to test');
assert.equal(verdict({ evidence: 'assumption' }), 'Test the problem first');
assert.equal(verdict({ audienceClarity: 'unclear' }), 'Test the problem first');
assert.equal(verdict({ audienceClarity: 'broad' }), 'Narrow the test');
assert.equal(verdict({ reach: 'none' }), 'Test the problem first');
assert.equal(verdict({ buyer: 'unknown' }), 'Test the problem first');
assert.equal(verdict({ outcomeScope: 'broad' }), 'Narrow the test');
assert.equal(verdict({ timeframe: 'open' }), 'Narrow the test');
assert.equal(verdict({ testSize: 'over' }), 'Narrow the test');
assert.equal(verdict({ proof: 'none', testType: 'paid' }), 'Build one credibility piece first');
assert.equal(verdict({ proof: 'none', testType: 'page' }), 'Build one credibility piece first');
assert.equal(verdict({ proof: 'none', testType: 'conversation' }), 'Ready to test');
assert.equal(verdict({ evidence: 'inferred', testType: 'paid' }), 'Test the problem first');

const result = engine.evaluate({ ...base, evidence: 'assumption', proof: 'none' });
assert.ok(result.blockers.length >= 2);
assert.ok(result.riskiestAssumption.length > 20);
assert.ok(result.nextAction.length > 20);
assert.equal(typeof result.score, 'number');

console.log('Idea-to-Test decision engine: 16 assertions passed.');
