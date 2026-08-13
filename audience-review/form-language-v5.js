(() => {
  const form = document.getElementById('audience-form');
  const step1 = form?.querySelector('.step[data-step="1"]');
  const step2 = form?.querySelector('.step[data-step="2"]');
  const step3 = form?.querySelector('.step[data-step="3"]');
  const offerInput = document.getElementById('offer');

  if (!form || !step1 || !step2 || !step3 || !offerInput) return;

  const clean = values => values.filter(value => value && value !== "I'm not sure" && value !== 'Something else');
  const selected = name => clean([...document.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value));
  const natural = values => values.length < 2 ? (values[0] || '') : values.length === 2 ? `${values[0]} and ${values[1]}` : `${values.slice(0, -1).join(', ')}, and ${values.at(-1)}`;

  const AUDIENCE_PATTERNS = [
    {
      id: 'trust',
      terms: ['Trust', 'Safety', 'Reliability', 'Peace of mind', 'Expertise', 'Clear information'],
      observation: 'That combination usually puts more weight on trust, visible judgment, and reducing uncertainty before the decision feels comfortable.'
    },
    {
      id: 'autonomy',
      terms: ['Control', 'Independence', 'Being treated fairly', 'Clear information', 'Flexibility'],
      observation: 'That points toward an audience that is likely to value guidance without giving up control of the decision.'
    },
    {
      id: 'value',
      terms: ['Price', 'Avoiding unnecessary cost', 'Being treated fairly', 'Quality'],
      observation: 'That suggests the decision may depend heavily on understanding what is necessary, what is optional, and why one choice is worth the difference.'
    },
    {
      id: 'relationship',
      terms: ['Being understood', 'Belonging or connection', 'Protecting people they care about', 'Personal values'],
      observation: 'That suggests the provider relationship itself may carry meaningful weight: people want to know their situation will actually be noticed and understood.'
    },
    {
      id: 'progress',
      terms: ['Opportunity or improvement', 'Quality', 'Speed', 'Enjoyment'],
      observation: 'That points toward a decision shaped by progress and possibility: people need to see what will genuinely be better afterward.'
    }
  ];

  const VALUE_EFFECTS = {
    'Honesty': 'reduce the fear of being sold more than the customer really needs',
    'Fairness': 'make recommendations, tradeoffs, and pricing feel understandable rather than arbitrary',
    'Personal attention': 'show that the customer’s actual situation changes the recommendation',
    'Expertise': 'turn specialized knowledge into clearer customer judgment',
    'Reliability': 'make the process and follow-through easier to predict',
    'Safety': 'show that risk is noticed, managed, and communicated rather than dismissed',
    'Quality': 'make the difference between adequate and better work understandable',
    'Convenience': 'remove unnecessary effort without rushing the decision',
    'Human connection': 'show that the person is being recognized rather than processed',
    'Helping people understand their choices': 'increase confidence while preserving ownership of the decision',
    'Giving people control': 'make choice, timing, and tradeoffs explicit',
    'Responsibility': 'make it visible what the provider monitors, owns, and does when circumstances change'
  };

  function bestAudiencePattern() {
    const values = selected('audience_values');
    if (!values.length) return null;
    const scored = AUDIENCE_PATTERNS.map(pattern => ({
      ...pattern,
      score: pattern.terms.filter(term => values.includes(term)).length
    })).sort((a, b) => b.score - a.score);
    return scored[0].score ? scored[0] : null;
  }

  function decisionSummary() {
    const emotions = selected('audience_emotions');
    const needs = selected('audience_needs');
    const hesitation = selected('audience_hesitation');
    const signals = [...emotions, ...needs, ...hesitation];
    const parts = [];

    if (signals.some(value => ['Uncertain', 'Confused', 'More information', 'Confidence they\'re not making a mistake', 'Fear of making the wrong choice', 'Uncertainty'].includes(value))) parts.push('more confidence before committing');
    if (signals.some(value => ['Proof that it works', 'Recommendations from other people', 'Lack of trust', 'Distrustful'].includes(value))) parts.push('proof they can judge for themselves');
    if (signals.some(value => ['Control over the decision', 'Clear choices', 'Time to think', 'They don\'t want to feel pressured'].includes(value))) parts.push('room to stay in control of the choice');
    if (signals.some(value => ['A clear price', 'Lower financial risk', 'Price', 'They don\'t understand the value'].includes(value))) parts.push('a clearer sense of value and financial tradeoffs');
    if (signals.some(value => ['Someone to make it easier', 'Convenience', 'Time or convenience', 'Overwhelmed'].includes(value))) parts.push('less friction and complexity');

    return [...new Set(parts)].slice(0, 2);
  }

  function domainModel() {
    const title = offerInput.value.trim();
    if (title.length < 3 || typeof window.buildAudienceDomainModel !== 'function') return null;
    return window.buildAudienceDomainModel({ offer: { name: title } });
  }

  function ensureInsight(id, parent, before = null) {
    let node = document.getElementById(id);
    if (node) return node;
    node = document.createElement('div');
    node.id = id;
    node.className = 'progressive-insight';
    node.hidden = true;
    if (before) parent.insertBefore(node, before);
    else parent.appendChild(node);
    return node;
  }

  const primaryContainer = document.getElementById('audience-primary-questions');
  const firstAudienceQuestion = primaryContainer?.querySelector('[data-question="audience_values"]');
  const triggerQuestion = primaryContainer?.querySelector('[data-question="audience_trigger"]');
  const step1Insight = primaryContainer && triggerQuestion
    ? ensureInsight('step1-recognition', primaryContainer, triggerQuestion)
    : null;

  const step2Bridge = document.getElementById('step2-bridge');
  const step3Bridge = document.getElementById('step3-bridge');
  const step3Actions = step3.querySelector('.actions');
  const step3Insight = step3Actions ? ensureInsight('step3-recognition', step3, step3Actions) : null;

  const step1Heading = step1.querySelector('.section-heading h2');
  const step1Intro = step1.querySelector('.section-heading p:not(.eyebrow)');
  if (step1Heading) step1Heading.textContent = 'Start with what you already know about the people involved.';
  if (step1Intro) step1Intro.textContent = 'You do not need a perfect customer profile. Choose the patterns you see most often. We’ll treat them as evidence, then test and refine that picture as you move through the review.';

  function updateStep1Language() {
    if (!step1Insight) return;
    const values = selected('audience_values');
    if (!values.length) {
      step1Insight.hidden = true;
      return;
    }

    const pattern = bestAudiencePattern();
    const named = natural(values.slice(0, 2));
    step1Insight.innerHTML = `<strong>That gives us a useful first signal.</strong> You’re telling us ${named} matter. ${pattern?.observation || 'That begins to tell us what people may be protecting or trying to gain from the decision.'} We’ll keep this as a working pattern—not a label—and see whether the next answers support it.`;
    step1Insight.hidden = false;
  }

  function updateStep2Language() {
    if (!step2Bridge) return;
    const values = selected('audience_values');
    const triggers = selected('audience_trigger');
    const pattern = bestAudiencePattern();
    const domain = domainModel();
    const title = offerInput.value.trim();

    if (domain && domain.family !== 'general') {
      const earlier = pattern ? `Your earlier answers also suggest ${pattern.observation.charAt(0).toLowerCase()}${pattern.observation.slice(1)}` : '';
      step2Bridge.textContent = `That gives us a much sharper frame. With ${title}, customers often need ${domain.customerNeed}. ${domain.capabilityContrast} ${earlier} Now we’ll narrow what they need in order to feel confident choosing the right level of help.`;
      return;
    }

    if (title) {
      step2Bridge.textContent = `Now we can put the audience in context. We’ll treat “${title}” as the professional setting and use your next answers to distinguish what customers need to understand, trust, compare, or control before choosing it.`;
      return;
    }

    if (values.length || triggers.length) {
      const valueText = values.length ? `${natural(values.slice(0, 2))} matter` : 'you have identified meaningful audience priorities';
      const triggerText = triggers.length ? `, and interest often begins when ${triggers[0].charAt(0).toLowerCase()}${triggers[0].slice(1)}` : '';
      const interpretation = pattern ? ` ${pattern.observation}` : '';
      step2Bridge.textContent = `You’ve already given us something useful: ${valueText}${triggerText}.${interpretation} Now tell us what kind of work these people are actually choosing so we can interpret those signals in the right professional context.`;
      return;
    }

    step2Bridge.textContent = 'You’ve given us the audience side of the decision. Now tell us what they are actually choosing so we can interpret those answers in the right professional context.';
  }

  function updateStep3Language() {
    if (!step3Bridge) return;
    const domain = domainModel();
    const title = offerInput.value.trim() || 'this work';
    const decision = decisionSummary();
    const pattern = bestAudiencePattern();

    if (domain && domain.family !== 'general') {
      const decisionText = decision.length
        ? `Your answers suggest they may especially need ${natural(decision)}.`
        : pattern ? pattern.observation : 'We now have enough context to move beyond generic assumptions.';
      step3Bridge.textContent = `We now have a working picture of the decision around ${title}. Customers in this kind of work often need ${domain.customerNeed}. ${decisionText} Now tell us what matters in how you do the work. This is where we look for a credible fit between what they need and the standards you actually bring—not force one.`;
      return;
    }

    const decisionText = decision.length ? ` Your answers point toward ${natural(decision)}.` : '';
    step3Bridge.textContent = `We now have enough evidence to stop treating the audience generically.${decisionText} Tell us what matters in how you do the work so we can identify which of your standards genuinely help this customer make the decision well.`;
  }

  function updateStep3Recognition() {
    if (!step3Insight) return;
    const values = selected('business_values').filter(value => VALUE_EFFECTS[value]);
    if (!values.length) {
      step3Insight.hidden = true;
      return;
    }

    const domain = domainModel();
    const title = offerInput.value.trim() || 'this work';
    const visible = values.slice(0, 3).map(value => `${value} can ${VALUE_EFFECTS[value]}`);
    const domainLead = domain && domain.family !== 'general'
      ? `For ${title}, that is a meaningful combination because the customer often cannot independently judge every technical choice before hiring you.`
      : `That gives us a credible set of standards to connect back to the customer decision.`;

    step3Insight.innerHTML = `<strong>This is useful.</strong> ${domainLead} ${natural(visible)}. We’ll turn those into communication the customer can recognize rather than simply repeating the values as claims.`;
    step3Insight.hidden = false;
  }

  function updateAll() {
    updateStep1Language();
    updateStep2Language();
    updateStep3Language();
    updateStep3Recognition();
  }

  let offerTimer = null;
  form.addEventListener('change', event => {
    if (event.target.matches('input[type="checkbox"], input[type="radio"]')) updateAll();
  });

  offerInput.addEventListener('input', () => {
    window.clearTimeout(offerTimer);
    offerTimer = window.setTimeout(updateAll, 220);
  });
  offerInput.addEventListener('blur', updateAll);

  const observer = new MutationObserver(mutations => {
    if (mutations.some(mutation => mutation.attributeName === 'data-review-step')) updateAll();
  });
  observer.observe(document.body, { attributes: true });

  updateAll();
})();
