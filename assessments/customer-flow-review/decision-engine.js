(function (root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  else root.OobCustomerFlowEngine = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const frequencyPoints = { never: 0, occasionally: 1, weekly: 2, daily: 3, constantly: 4 };
  const adminPoints = { under1: 0, one3: 1, four8: 2, one2days: 3, over2days: 4, unknown: 2.5 };

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
    const confidence = points({ very: 0, mostly: 1, depends: 2, occasional: 3, losing: 4 }, input.responseConfidence);
    const missed = points({ voicemail: 0, callback: 1, depends: 2, several: 3, unsure: 2.5, lose: 4 }, input.missedCall);
    const channelCount = array(input.contactChannels).filter((item) => item !== 'other').length;
    const complexity = channelCount <= 2 ? 0 : channelCount <= 4 ? 1 : channelCount <= 6 ? 2 : 3;
    return clamp(((confidence * 0.45) + (missed * 0.4) + (complexity * 0.15)) / 4 * 100);
  }

  function informationScore(input) {
    const history = points({ immediate: 0, easy: 1, couple: 2, depends: 3, difficult: 4, none: 4 }, input.historyEase);
    const phrase = points({ system: 0, lookup: 1, talked: 2.5, send: 2.5, ask: 3.5, handled: 4 }, input.familiarPhrase);
    const places = array(input.infoPlaces);
    const placeCount = places.filter((item) => item !== 'more').length;
    let spread = placeCount <= 2 ? 0 : placeCount === 3 ? 1.5 : placeCount === 4 ? 2.5 : 3.5;
    if (places.includes('memory')) spread += 0.5;
    if (places.includes('more')) spread += 0.5;
    return clamp(((history * 0.4) + (phrase * 0.3) + (Math.min(4, spread) * 0.3)) / 4 * 100);
  }

  function workflowScore(input) {
    const tasks = Object.values(input.taskFrequency || {});
    const averageFrequency = tasks.length
      ? tasks.reduce((sum, value) => sum + points(frequencyPoints, value), 0) / tasks.length
      : 0;
    const admin = points(adminPoints, input.adminTime);
    return clamp(((averageFrequency * 0.75) + (admin * 0.25)) / 4 * 100);
  }

  function capacityScore(input) {
    const admin = points(adminPoints, input.adminTime);
    const pace = points({ yes: 0, mostly: 1, little: 2.5, no: 3.5, workarounds: 4 }, input.paceMatch);
    const growth = array(input.growthChanges).filter((item) => item !== 'none').length;
    const growthPressure = growth === 0 ? 0 : growth <= 2 ? 1 : growth <= 4 ? 2 : 3.5;
    return clamp(((admin * 0.35) + (pace * 0.4) + (growthPressure * 0.25)) / 4 * 100);
  }

  function changePressureScore(input) {
    const concern = points({ nothing: 0, time: 1, experience: 2.5, opportunities: 3.5, hire: 3.5, overwhelmed: 4, growth: 4, unknown: 2 }, input.yearConcern);
    const timing = points({ now: 4, one3: 3.5, slower: 2.5, beforeBusy: 3, later: 2, exploring: 1 }, input.changeTiming);
    let result = ((concern * 0.6) + (timing * 0.4)) / 4 * 100;
    if (input.paceMatch === 'no' || input.paceMatch === 'workarounds') result += 10;
    return clamp(result);
  }

  function stageFor(flowFriction, pressure) {
    if ((flowFriction >= 80 && pressure >= 60) || (flowFriction >= 68 && pressure >= 78)) return 5;
    if (flowFriction >= 60) return 4;
    if (flowFriction >= 40) return 3;
    if (flowFriction >= 20) return 2;
    return 1;
  }

  function stageDetails(stage) {
    return {
      1: {
        name: 'Working Fine',
        summary: 'Your current systems appear appropriate for the way your business operates. There may be opportunities for small improvements, but we would not recommend replacing technology simply because something newer exists.',
        action: 'Protect what is working. Improve only a specific friction point when the benefit is clear.'
      },
      2: {
        name: 'Patchwork Starting',
        summary: 'Your tools mostly work, but people are beginning to fill gaps between them manually. This is often where a few targeted connections or clearer handoffs can prevent a larger operational problem later.',
        action: 'Look for one repeated handoff that can be simplified without replacing the systems that already work.'
      },
      3: {
        name: 'Successful but Stretched',
        summary: 'Your business appears to have grown beyond some of the processes that originally worked well. Customer information exists, but people are spending increasing amounts of time finding it, moving it, remembering it or following up on it.',
        action: 'Map the customer flow and identify the one or two gaps costing the most staff time, attention or opportunity.'
      },
      4: {
        name: 'Systems Are Creating Work',
        summary: 'Your technology is no longer simply supporting the business. Employees are functioning as the connections between systems.',
        action: 'Before adding another tool, redesign how customer communication and information move through the business.'
      },
      5: {
        name: 'Growth Risk',
        summary: 'Communication or information gaps are now affecting customer experience, staff capacity, revenue opportunities or the ability to grow without adding unnecessary administrative overhead.',
        action: 'Fix the operating model before adding more volume to it.'
      }
    }[stage];
  }

  function dimensionStatus(score, pressure) {
    if (pressure) {
      if (score < 20) return 'Low';
      if (score < 40) return 'Watch';
      if (score < 60) return 'Building';
      if (score < 80) return 'Near-term';
      return 'High';
    }
    if (score < 20) return 'Steady';
    if (score < 40) return 'Some friction';
    if (score < 60) return 'Stretching';
    if (score < 80) return 'High friction';
    return 'Heavy pressure';
  }

  function recognitionSignals(input, scores) {
    const signals = [];
    const phraseCopy = {
      system: '“It’s already in the system.”',
      lookup: '“Let me look that up.”',
      talked: '“Did someone already talk to them?”',
      send: '“Can you send me their information?”',
      ask: '“Ask ___; they know what’s going on.”',
      handled: '“I thought someone handled that.”'
    };

    if (array(input.contactChannels).length >= 5) signals.push('Customers can reach the business through several channels, increasing the number of places an inquiry can begin.');
    if (['depends', 'occasional', 'losing'].includes(input.responseConfidence)) signals.push('Whether an inquiry gets a timely response depends at least partly on who is working or who notices it.');
    if (['depends', 'several', 'lose'].includes(input.missedCall)) signals.push('A missed phone call can create another manual handoff—or an opportunity can disappear before anyone owns it.');
    if (['couple', 'depends', 'difficult', 'none'].includes(input.historyEase)) signals.push('Customer context is not always available in one place when someone needs it.');
    if (input.familiarPhrase && input.familiarPhrase !== 'system') signals.push(`A familiar sentence in the business is ${phraseCopy[input.familiarPhrase]} That is usually a people-and-information handoff, not just a software feature gap.`);
    if (scores.workflow >= 40) signals.push('People are doing recurring invisible work to move, restate, check or remember information between steps.');
    if (['four8', 'one2days', 'over2days'].includes(input.adminTime)) {
      const label = { four8: '4–8 hours', one2days: 'about 1–2 workdays', over2days: 'more than 2 workdays' }[input.adminTime];
      signals.push(`You estimate that small administrative handoffs consume ${label} of staff time each week.`);
    }
    if (['little', 'no', 'workarounds'].includes(input.paceMatch)) signals.push('The way customer information is managed has not changed at the same pace as the business.');
    if (['connect', 'added', 'outgrown', 'unsure'].includes(input.toolFeeling)) signals.push('The tools themselves may not be the main problem; the way they connect—or the work people do between them—deserves attention first.');
    if (!signals.length) signals.push('Your answers do not show a strong pattern of customer-flow strain. That is useful evidence not to manufacture a technology project.');
    return signals.slice(0, 6);
  }

  function focusAreas(input, scores, stage) {
    const selected = array(input.improvementPriorities);
    const priorityCopy = {
      interruptions: 'Reduce interruptions and make routine customer context easier to find.',
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
      ['communication', scores.communication, 'Start with inquiry capture and response ownership.'],
      ['information', scores.information, 'Start with making customer history easier to find where work happens.'],
      ['workflow', scores.workflow, 'Start with the repeated copy/check/remind handoffs consuming staff attention.'],
      ['capacity', scores.capacity, 'Start with the administrative work that growth is multiplying.']
    ].sort((a, b) => b[1] - a[1]);

    dimensions.forEach((item) => {
      if (item[1] >= 35 && !result.includes(item[2])) result.push(item[2]);
    });

    if (stage === 1 && !result.length) result.push('Keep the current operating model and watch for one recurring handoff before changing anything.');
    return result.slice(0, 4);
  }

  function toolContext(input) {
    const feelings = {
      together: 'Your current tools appear to work together reasonably well. Do not create a replacement project without a specific operational reason.',
      separate: 'The individual tools may be fine; the friction is more likely in the gaps between them.',
      partial: 'Before buying anything new, check whether capabilities you already pay for can remove a recurring handoff.',
      added: 'The stack has grown one problem at a time. The next useful step is to simplify the flow before adding another layer.',
      outgrown: 'Some tools or processes may genuinely be at their limit, but replacement should follow a workflow review rather than lead it.',
      unsure: 'Uncertainty about the stack is a reason to map the work first—not a reason to shop for software.'
    };
    return feelings[input.toolFeeling] || 'Keep what works, connect what should connect and replace only what has genuinely become a limitation.';
  }

  function evaluate(input) {
    const scores = {
      communication: communicationScore(input),
      information: informationScore(input),
      workflow: workflowScore(input),
      capacity: capacityScore(input),
      changePressure: changePressureScore(input)
    };
    const flowFriction = clamp((scores.communication + scores.information + scores.workflow + scores.capacity) / 4);
    const stage = stageFor(flowFriction, scores.changePressure);
    const details = stageDetails(stage);

    return {
      stage,
      stageName: details.name,
      summary: details.summary,
      action: details.action,
      flowFriction,
      scores,
      statuses: {
        communication: dimensionStatus(scores.communication, false),
        information: dimensionStatus(scores.information, false),
        workflow: dimensionStatus(scores.workflow, false),
        capacity: dimensionStatus(scores.capacity, false),
        changePressure: dimensionStatus(scores.changePressure, true)
      },
      recognitionSignals: recognitionSignals(input, scores),
      focusAreas: focusAreas(input, scores, stage),
      toolContext: toolContext(input)
    };
  }

  return { evaluate };
});