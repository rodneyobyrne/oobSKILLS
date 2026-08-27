(function (root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  else root.OobCustomerFlowEngine = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const frequencyPoints = { never: 0, occasionally: 1, weekly: 2, daily: 3, constantly: 4 };
  const adminPoints = { under1: 0, one3: 1, four8: 2, one2days: 3, over2days: 4, unknown: 0 };

  function points(map, value) {
    return Object.prototype.hasOwnProperty.call(map, value) ? map[value] : 0;
  }

  function clamp(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  function array(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  function communicationScore(input) {
    const confidence = points({ very: 0, mostly: 0.75, depends: 2.25, occasional: 3.25, losing: 4 }, input.responseConfidence);
    const missed = points({ voicemail: 0, callback: 0.75, depends: 2.25, several: 3, unsure: 0, lose: 4 }, input.missedCall);
    return clamp(((confidence * 0.55) + (missed * 0.45)) / 4 * 100);
  }

  function informationScore(input) {
    const history = points({ immediate: 0, easy: 0.75, couple: 1.75, depends: 3, difficult: 4, none: 4 }, input.historyEase);
    const phrase = points({ system: 0, lookup: 0.75, talked: 2.25, send: 2.25, ask: 3.5, handled: 4 }, input.familiarPhrase);
    return clamp(((history * 0.6) + (phrase * 0.4)) / 4 * 100);
  }

  function workflowScore(input) {
    const tasks = Object.values(input.taskFrequency || {});
    const averageFrequency = tasks.length
      ? tasks.reduce((sum, value) => sum + points(frequencyPoints, value), 0) / tasks.length
      : 0;
    const admin = points(adminPoints, input.adminTime);
    const adminWeight = input.adminTime === 'unknown' ? 0 : 0.25;
    const taskWeight = 1 - adminWeight;
    return clamp(((averageFrequency * taskWeight) + (admin * adminWeight)) / 4 * 100);
  }

  function capacityScore(input, workflow) {
    const admin = points(adminPoints, input.adminTime);
    const pace = points({ yes: 0, mostly: 0.75, little: 2.25, no: 3.5, workarounds: 4 }, input.paceMatch);
    const adminKnown = input.adminTime !== 'unknown';
    const adminWeight = adminKnown ? 0.4 : 0;
    const paceWeight = adminKnown ? 0.4 : 0.65;
    const workflowWeight = adminKnown ? 0.2 : 0.35;
    return clamp(((admin * adminWeight) + (pace * paceWeight) + ((workflow / 25) * workflowWeight)) / 4 * 100);
  }

  function changePressureScore(input) {
    const concern = points({ nothing: 0, time: 1, experience: 2.25, opportunities: 3.25, hire: 3.25, overwhelmed: 4, growth: 4, unknown: 0 }, input.yearConcern);
    const pace = points({ yes: 0, mostly: 0.5, little: 1.5, no: 2.5, workarounds: 3 }, input.paceMatch);
    const changes = array(input.growthChanges).filter((item) => item !== 'none').length;
    const growth = changes === 0 ? 0 : changes <= 2 ? 0.75 : changes <= 4 ? 1.5 : 2.25;
    return clamp(((concern * 0.6) + (pace * 0.25) + (growth * 0.15)) / 4 * 100);
  }

  function visibilityDetails(input) {
    const signals = [];
    if (input.missedCall === 'unsure') signals.push('It is not yet clear what reliably happens after an unanswered call.');
    if (input.adminTime === 'unknown') signals.push('The amount of staff time spent on small handoffs is not currently visible.');
    if (input.toolFeeling === 'unsure') signals.push('It is not yet clear which parts of the current tool stack are helping or creating extra work.');
    if (input.yearConcern === 'unknown') signals.push('You do not yet have enough visibility to name the main consequence of leaving the current pattern unchanged.');

    return {
      level: signals.length >= 3 ? 'Limited visibility' : signals.length >= 1 ? 'Some blind spots' : 'Clear enough to act',
      signals
    };
  }

  function stageFor(flowFriction, pressure) {
    if ((flowFriction >= 68 && pressure >= 55) || (flowFriction >= 62 && pressure >= 72)) return 5;
    if (flowFriction >= 58) return 4;
    if (flowFriction >= 38) return 3;
    if (flowFriction >= 18) return 2;
    return 1;
  }

  function stageDetails(stage) {
    return {
      1: {
        name: 'Holding Up Well',
        summary: 'Your answers do not show a strong pattern of customer-flow strain. The useful decision is to protect what is working rather than manufacture a technology project.',
        action: 'Protect what is working.',
        decision: 'Nothing here justifies a system replacement project right now. Improve a specific handoff only when the benefit is clear.'
      },
      2: {
        name: 'Some Patchwork Is Showing',
        summary: 'Most of the operating model appears to work, but a few repeated handoffs are beginning to depend on manual effort or individual attention.',
        action: 'Fix one handoff.',
        decision: 'Choose one recurring gap that creates avoidable checking, relaying or follow-up and simplify it before considering a larger systems change.'
      },
      3: {
        name: 'Successful but Stretched',
        summary: 'The business appears to have grown beyond some processes that once worked well. People can still keep things moving, but it takes more checking, remembering or coordination than it should.',
        action: 'Map the customer flow.',
        decision: 'Identify the one or two handoffs costing the most attention or opportunity before deciding whether the answer is process, integration or software.'
      },
      4: {
        name: 'People Are Bridging the Systems',
        summary: 'Employees are doing enough work between tools and steps that the handoffs themselves have become part of the operating burden.',
        action: 'Review how the systems work together.',
        decision: 'Redesign the customer-information flow before adding another tool. Keep useful systems, clarify ownership and remove repeated manual bridges where practical.'
      },
      5: {
        name: 'Growth Is Amplifying the Gaps',
        summary: 'Existing communication or information gaps are becoming harder to absorb as the business grows. The issue is not automatically the software; it is that the current flow is creating more work as volume increases.',
        action: 'Stabilize the flow before adding more volume.',
        decision: 'Address the highest-friction handoffs now, then decide which existing systems can be connected, which workflows should change and which tools have genuinely become limitations.'
      }
    }[stage];
  }

  function dimensionStatus(score, pressure) {
    if (pressure) {
      if (score < 18) return 'Low';
      if (score < 38) return 'Watch';
      if (score < 58) return 'Building';
      if (score < 78) return 'Near-term';
      return 'High';
    }
    if (score < 18) return 'Steady';
    if (score < 38) return 'Some friction';
    if (score < 58) return 'Stretching';
    if (score < 78) return 'High friction';
    return 'Heavy pressure';
  }

  function workingSignals(input, scores) {
    const signals = [];
    if (['very', 'mostly'].includes(input.responseConfidence)) signals.push('Important customer inquiries are usually getting a response.');
    if (['voicemail', 'callback'].includes(input.missedCall)) signals.push('There is a recognizable path for calls that cannot be answered immediately.');
    if (['immediate', 'easy'].includes(input.historyEase)) signals.push('Customer history is generally available without much detective work.');
    if (input.familiarPhrase === 'system') signals.push('Your team appears to have a shared place to look for customer context.');
    if (scores.workflow < 25) signals.push('Your answers show relatively little recurring work spent moving or restating information between steps.');
    if (input.toolFeeling === 'together') signals.push('The tools you use appear to work together reasonably well.');
    if (['yes', 'mostly'].includes(input.paceMatch)) signals.push('Customer-information practices have mostly kept pace with changes in the business.');
    if (!signals.length) signals.push('Even where friction is showing up, some parts of the current operating model may still be worth preserving rather than replacing wholesale.');
    return signals.slice(0, 5);
  }

  function recognitionSignals(input, scores) {
    const signals = [];
    const phraseCopy = {
      lookup: '“Let me look that up.”',
      talked: '“Did someone already talk to them?”',
      send: '“Can you send me their information?”',
      ask: '“Ask ___; they know what’s going on.”',
      handled: '“I thought someone handled that.”'
    };

    if (['depends', 'occasional', 'losing'].includes(input.responseConfidence)) signals.push('Whether an inquiry gets a timely response depends at least partly on who is working or who notices it.');
    if (['depends', 'several', 'lose'].includes(input.missedCall)) signals.push('A missed phone call can create another handoff before anyone clearly owns the follow-up.');
    if (['couple', 'depends', 'difficult', 'none'].includes(input.historyEase)) signals.push('Customer context is not always available in one place when someone needs it.');
    if (phraseCopy[input.familiarPhrase]) signals.push(`A familiar sentence in the business is ${phraseCopy[input.familiarPhrase]} That points to a people-and-information handoff worth examining.`);
    if (scores.workflow >= 35) signals.push('People are doing recurring invisible work to move, restate, check or remember information between steps.');
    if (['four8', 'one2days', 'over2days'].includes(input.adminTime)) {
      const label = { four8: '4–8 hours', one2days: 'about 1–2 workdays', over2days: 'more than 2 workdays' }[input.adminTime];
      signals.push(`You estimate that small administrative handoffs consume ${label} of staff time each week.`);
    }
    if (['little', 'no', 'workarounds'].includes(input.paceMatch)) signals.push('The way customer information is managed has not changed at the same pace as the business.');
    if (['separate', 'partial', 'added', 'outgrown'].includes(input.toolFeeling)) signals.push('The tools themselves may not be the main issue; the way work moves between them deserves attention before another platform is added.');
    if (!signals.length) signals.push('Your answers do not show a strong pattern of customer-flow strain. That is useful evidence not to manufacture a technology project.');
    return signals.slice(0, 6);
  }

  function focusAreas(input, scores, stage) {
    const selected = array(input.improvementPriorities);
    const priorityCopy = {
      interruptions: 'Reduce interruptions by making routine customer context easier to find.',
      missed: 'Tighten inquiry capture so fewer opportunities depend on someone noticing a message.',
      admin: 'Remove repetitive administrative handoffs before adding more volume.',
      followup: 'Make the next customer follow-up visible and owned.',
      scheduling: 'Simplify scheduling and rescheduling handoffs.',
      visibility: 'Create clearer visibility into customer and work status.',
      dependency: 'Reduce the amount of customer knowledge that depends on one employee.',
      staff: 'Improve staff-to-staff customer communication without creating another inbox.',
      calls: 'Improve what happens when calls arrive, are missed or need follow-through.',
      systems: 'Reduce the number of places people must check to understand what is happening.',
      existing: 'Make the systems you already pay for work together better before replacing them.',
      technology: 'Separate technology worth paying attention to from technology that can safely be ignored for now.'
    };

    const result = selected.map((item) => priorityCopy[item]).filter(Boolean);
    const dimensions = [
      [scores.communication, 'Start with inquiry capture and response ownership.'],
      [scores.information, 'Start with making customer history easier to find where work happens.'],
      [scores.workflow, 'Start with the repeated copy, check, relay or reminder handoffs consuming staff attention.'],
      [scores.capacity, 'Start with the administrative work that growth is multiplying.']
    ].sort((a, b) => b[0] - a[0]);

    dimensions.forEach(([score, copy]) => {
      if (score >= 35 && !result.includes(copy)) result.push(copy);
    });

    if (stage === 1 && !result.length) result.push('Keep the current operating model and watch for one recurring handoff before changing anything.');
    return result.slice(0, 4);
  }

  function toolContext(input) {
    const feelings = {
      together: 'Your current tools appear to work together reasonably well. Do not create a replacement project without a specific operational reason.',
      separate: 'The individual tools may be fine; the friction is more likely in the gaps between them.',
      partial: 'Before buying anything new, check whether capabilities you already pay for can remove a recurring handoff.',
      added: 'The stack has grown one problem at a time. Simplify the flow before adding another layer.',
      outgrown: 'Some tools or processes may genuinely be at their limit, but replacement should follow a workflow review rather than lead it.',
      unsure: 'Uncertainty about the stack is a visibility issue first—not a reason to shop for software.'
    };
    return feelings[input.toolFeeling] || 'Keep what works, connect what should connect and replace only what has genuinely become a limitation.';
  }

  function usefulTools(input, scores, stage) {
    const tools = [];
    const add = (key, title, usefulWhen, beforeBuying) => {
      if (!tools.some((item) => item.key === key)) tools.push({ key, title, usefulWhen, beforeBuying });
    };

    if (scores.communication >= 30 || array(input.improvementPriorities).some((item) => ['missed', 'calls'].includes(item))) {
      add('inquiry', 'Phone and inquiry management', 'Useful when calls or messages can be missed, callbacks depend on memory, or several people need visibility into the same inquiry.', 'Check whether your current phone, CRM or scheduling platform already supports routing, shared history, missed-call follow-up or integrations.');
    }
    if (scores.information >= 30 || array(input.improvementPriorities).some((item) => ['visibility', 'dependency', 'systems'].includes(item))) {
      add('customer-record', 'Shared customer record or CRM', 'Useful when staff routinely check several places or rely on one person to understand a customer.', 'Decide which existing system should own the customer relationship before adding a second place to store the same information.');
    }
    if (scores.workflow >= 35 || array(input.improvementPriorities).some((item) => ['admin', 'followup', 'staff', 'existing'].includes(item))) {
      add('workflow', 'Workflow automation and integrations', 'Useful when people repeatedly copy information, create follow-up tasks, relay updates or re-enter the same details.', 'Simplify the handoff first. Automating a confusing workflow usually preserves the confusion.');
    }
    if (array(input.improvementPriorities).includes('scheduling')) {
      add('scheduling', 'Scheduling tools or scheduling features', 'Useful when booking, rescheduling or confirming appointments creates repeated back-and-forth.', 'Check whether the system already used for jobs, appointments, payments or customer records has scheduling capabilities you are not using.');
    }
    if (array(input.improvementPriorities).some((item) => ['dependency', 'staff', 'visibility'].includes(item))) {
      add('shared-status', 'Shared task and status visibility', 'Useful when people need to ask one another what happened, what happens next or who owns the follow-up.', 'Agree on the status and ownership rules before choosing another task-management product.');
    }
    if (array(input.improvementPriorities).includes('technology')) {
      add('capability-review', 'Current-tool capability review', 'Useful when it is hard to tell which newer features, integrations or AI capabilities are actually relevant to the business.', 'Start with the problem and the tools you already pay for. Ignore new technology until it solves a defined operating need.');
    }

    if (stage === 1 && tools.length === 0) {
      return [{
        key: 'none',
        title: 'No new tool category stands out as necessary right now',
        usefulWhen: 'Your answers suggest protecting what is working and watching for a recurring friction point before adding technology.',
        beforeBuying: 'Do not create a software project without a specific operating problem to solve.'
      }];
    }
    return tools.slice(0, 4);
  }

  function beforeBuying(input) {
    const notes = [
      'Check whether a system you already pay for can solve the problem.',
      'Decide which system should own the customer information involved in the handoff.',
      'Fix or simplify the workflow before automating it.',
      'Replace a tool only when it has genuinely become the limitation.'
    ];
    if (input.toolFeeling === 'partial') notes.unshift('Review the capabilities already included in your current platforms before adding another subscription.');
    return [...new Set(notes)].slice(0, 4);
  }

  function evaluate(input) {
    const workflow = workflowScore(input);
    const scores = {
      communication: communicationScore(input),
      information: informationScore(input),
      workflow,
      capacity: capacityScore(input, workflow),
      changePressure: changePressureScore(input)
    };
    const flowFriction = clamp((scores.communication + scores.information + scores.workflow + scores.capacity) / 4);
    const stage = stageFor(flowFriction, scores.changePressure);
    const details = stageDetails(stage);
    const visibility = visibilityDetails(input);

    return {
      stage,
      stageName: details.name,
      summary: details.summary,
      action: details.action,
      decision: details.decision,
      flowFriction,
      scores,
      statuses: {
        communication: dimensionStatus(scores.communication, false),
        information: dimensionStatus(scores.information, false),
        workflow: dimensionStatus(scores.workflow, false),
        capacity: dimensionStatus(scores.capacity, false),
        changePressure: dimensionStatus(scores.changePressure, true)
      },
      visibility,
      workingSignals: workingSignals(input, scores),
      recognitionSignals: recognitionSignals(input, scores),
      focusAreas: focusAreas(input, scores, stage),
      toolContext: toolContext(input),
      usefulTools: usefulTools(input, scores, stage),
      beforeBuying: beforeBuying(input)
    };
  }

  return { evaluate };
});
