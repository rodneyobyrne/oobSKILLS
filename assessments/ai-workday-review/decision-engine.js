(function (root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  else root.OobWorkdayEngine = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function points(map, value) {
    return map[value] || 0;
  }

  function evaluate(input) {
    const score =
      points({ daily: 3, weekly: 2, monthly: 1, rare: 0 }, input.frequency) +
      points({ short: 0, medium: 1, long: 2, extended: 3 }, input.duration) +
      points({ low: 3, medium: 1, high: -3 }, input.judgment) +
      points({ low: 3, medium: 0, high: -5 }, input.consequence) +
      points({ public: 2, internal: 1, personal: -3, regulated: -6 }, input.sensitivity) +
      points({ ready: 3, mixed: 0, poor: -3 }, input.sources) +
      points({ named: 3, possible: 0, none: -5 }, input.reviewer) +
      points({ yes: 2, limited: 0, no: -4 }, input.reversible) +
      points({ strong: 2, sample: 1, weak: -2 }, input.capacity);

    const blockers = [];
    if (input.consequence === 'high') blockers.push('A wrong result could create a high-consequence decision or outcome.');
    if (input.sensitivity === 'regulated') blockers.push('The work would require regulated or highly sensitive records.');
    if (input.reviewer === 'none') blockers.push('No person can reliably review the result before use.');
    if (input.reversible === 'no') blockers.push('The proposed change would be difficult to stop or reverse.');
    if (input.sources === 'poor') blockers.push('The source information is not yet reliable enough to guide the output.');
    if (input.capacity === 'weak') blockers.push('Review capacity is too limited for a responsible test.');

    let verdict;
    let explanation;
    if (input.consequence === 'high' || input.sensitivity === 'regulated') {
      verdict = 'Keep the decision human';
      explanation = 'Do not automate the consequential decision or place regulated records into a general AI workflow. If relief is still needed, isolate a low-consequence support step such as preparing a blank structure, locating approved public information or organizing de-identified material for qualified review.';
    } else if (blockers.length || score < 7) {
      verdict = 'Prepare first';
      explanation = 'The task has plausible support value, but the workflow needs stronger sources, review ownership, reversibility or boundaries before a live test.';
    } else if (input.judgment === 'high') {
      verdict = 'Pilot a smaller support task';
      explanation = 'Human judgment is central to the final result. Test AI only around preparation, organization or first-draft support while keeping interpretation, promises and approval with the named owner.';
    } else {
      verdict = 'Pilot now - narrowly';
      explanation = 'The task is repeated, bounded enough to compare and has enough review capacity for a reversible 14-day test. Keep the first version deliberately small.';
    }

    return { score, blockers, verdict, explanation };
  }

  return { evaluate };
});
