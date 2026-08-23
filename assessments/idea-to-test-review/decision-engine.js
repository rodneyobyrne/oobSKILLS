(function (root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  else root.OobIdeaTestEngine = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function points(map, value) {
    return map[value] || 0;
  }

  function evaluate(input) {
    const score =
      points({ named: 3, broad: 1, unclear: -3 }, input.audienceClarity) +
      points({ direct: 3, indirect: 1, none: -4 }, input.reach) +
      points({ observed: 4, asked: 3, inferred: 1, assumption: -3 }, input.evidence) +
      points({ known: 2, adjacent: 0, unknown: -2 }, input.buyer) +
      points({ bounded: 3, medium: 1, broad: -3 }, input.outcomeScope) +
      points({ ready: 2, partial: 0, none: -2 }, input.proof) +
      points({ twoWeeks: 2, month: 1, open: -2 }, input.timeframe) +
      points({ three: 2, five: 2, ten: 1, over: -2 }, input.testSize);

    const blockers = [];
    if (input.audienceClarity === 'unclear') blockers.push('The first audience is not specific enough to recognize or contact.');
    if (input.audienceClarity === 'broad') blockers.push('The first audience lacks a clear situation that triggers the need.');
    if (input.reach === 'none') blockers.push('There is no realistic path to a small group of people for this test.');
    if (input.evidence === 'assumption') blockers.push('The problem is still based mostly on assumption.');
    if (input.buyer === 'unknown') blockers.push('The person who can approve, buy or act is not yet understood.');
    if (input.outcomeScope === 'broad') blockers.push('The promised outcome is too broad for a small, credible test.');
    if (input.proof === 'none') blockers.push('There is not yet a sample, example or relevant evidence to support the invitation.');
    if (input.timeframe === 'open') blockers.push('The test does not yet have a decision date.');
    if (input.testSize === 'over') blockers.push('The first test involves too many people to remain easy to observe and reverse.');

    let verdict;
    let explanation;
    let nextAction;

    const problemUnknown = input.audienceClarity === 'unclear' || input.reach === 'none' || input.evidence === 'assumption' || input.buyer === 'unknown' || (input.evidence === 'inferred' && (input.testType === 'page' || input.testType === 'paid'));
    const testTooLarge = input.audienceClarity === 'broad' || input.outcomeScope === 'broad' || input.timeframe === 'open' || input.testSize === 'over';
    const proofGap = input.proof === 'none' && (input.testType === 'page' || input.testType === 'paid');

    if (problemUnknown) {
      verdict = 'Test the problem first';
      explanation = 'Do not ask the market to validate a polished solution yet. First learn whether a reachable person recognizes this problem, cares enough to change it and has the authority to act.';
      nextAction = 'Hold three to five short conversations using the audience conversation brief. Listen for repeated language, current workarounds and a meaningful consequence—not compliments about the idea.';
    } else if (testTooLarge) {
      verdict = 'Narrow the test';
      explanation = 'The direction is plausible, but the current test asks for too much scope, time or participation. A smaller test will produce cleaner evidence with less risk to your credibility.';
      nextAction = 'Reduce the promise to one observable outcome, limit the first group to five people or fewer and set a decision date within 30 days.';
    } else if (proofGap) {
      verdict = 'Build one credibility piece first';
      explanation = 'The audience and problem are testable, but a paid or public invitation needs one concrete reason to trust the promise. Build only the smallest proof needed to support the test.';
      nextAction = 'Create one annotated example, sample output, short method note or relevant before-and-after. Do not build a full brand, course or automated system.';
    } else {
      verdict = 'Ready to test';
      explanation = 'The idea is specific enough to put in front of a reachable audience without treating the choice as permanent. Run the test, record what happens and decide from behavior rather than private refinement.';
      nextAction = 'Send the invitation to the first three to five people, or schedule the first conversation, within the test window you chose.';
    }

    const riskiestAssumption = input.evidence === 'assumption'
      ? 'The audience experiences the problem strongly enough to act.'
      : input.buyer === 'unknown'
        ? 'The person experiencing the problem can approve or buy the proposed help.'
        : input.reach === 'none'
          ? 'The intended audience can be reached through a realistic channel.'
          : input.outcomeScope === 'broad'
            ? 'A broad promise can be understood and judged in one small test.'
            : input.proof === 'none'
              ? 'Relevant experience alone will provide enough credibility for the invitation.'
              : 'A small number of real people will take the requested next step when the offer is stated clearly.';

    return {
      score,
      blockers,
      verdict,
      explanation,
      nextAction,
      riskiestAssumption
    };
  }

  return { evaluate };
});
