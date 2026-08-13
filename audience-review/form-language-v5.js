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
      terms: ['Trust', 'Safety', 'Reliability', 'Peace of mind', 'Expertise', 'Clear information'],
      observation: 'That usually puts more weight on trust, visible judgment, and reducing uncertainty before the decision feels comfortable.'
    },
    {
      terms: ['Control', 'Independence', 'Being treated fairly', 'Clear information', 'Flexibility'],
      observation: 'That points toward customers who are likely to value guidance without giving up control of the decision.'
    },
    {
      terms: ['Price', 'Avoiding unnecessary cost', 'Being treated fairly', 'Quality'],
      observation: 'That suggests the decision may depend heavily on understanding what is necessary, what is optional, and why one choice is worth the difference.'
    },
    {
      terms: ['Being understood', 'Belonging or connection', 'Protecting people they care about', 'Personal values'],
      observation: 'That suggests the provider relationship itself may carry meaningful weight: people want to know their situation will actually be noticed and understood.'
    },
    {
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

  function domainModel() {
    const title = offerInput.value.trim();
    if (title.length < 3 || typeof window.buildAudienceDomainModel !== 'function') return null;
    return window.buildAudienceDomainModel({ offer: { name: title } });
  }

  function rolePhrase(domain, title) {
    if (domain?.family === 'drone_aerial') return 'a drone operator';
    const role = title.trim().toLowerCase();
    if (!role) return 'someone doing this work';
    const article = /^[aeiou]/i.test(role) ? 'an' : 'a';
    return `${article} ${role}`;
  }

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

    if (signals.some(value => ['Uncertain', 'Confused', 'More information', "Confidence they're not making a mistake", 'Fear of making the wrong choice', 'Uncertainty'].includes(value))) parts.push('more confidence before committing');
    if (signals.some(value => ['Proof that it works', 'Recommendations from other people', 'Lack of trust', 'Distrustful'].includes(value))) parts.push('proof they can judge for themselves');
    if (signals.some(value => ['Control over the decision', 'Clear choices', 'Time to think', "They don't want to feel pressured"].includes(value))) parts.push('room to stay in control of the choice');
    if (signals.some(value => ['A clear price', 'Lower financial risk', 'Price', "They don't understand the value"].includes(value))) parts.push('a clearer sense of value and financial tradeoffs');
    if (signals.some(value => ['Someone to make it easier', 'Convenience', 'Time or convenience', 'Overwhelmed'].includes(value))) parts.push('less friction and complexity');

    return [...new Set(parts)].slice(0, 2);
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

  const step1Actions = step1.querySelector('.actions');
  const step1Insight = step1Actions ? ensureInsight('step1-recognition', step1, step1Actions) : null;

  const audienceContainer = document.getElementById('audience-questions');
  const emotionQuestion = audienceContainer?.querySelector('[data-question="audience_emotions"]');
  const step2Insight = audienceContainer && emotionQuestion
    ? ensureInsight('step2-recognition', audienceContainer, emotionQuestion)
    : null;

  const step2Bridge = document.getElementById('step2-bridge');
  const step3Bridge = document.getElementById('step3-bridge');
  const step3Actions = step3.querySelector('.actions');
  const step3Insight = step3Actions ? ensureInsight('step3-recognition', step3, step3Actions) : null;

  function updateStep1Recognition() {
    if (!step1Insight) return;
    const title = offerInput.value.trim();
    const domain = domainModel();
    if (title.length < 3) {
      step1Insight.hidden = true;
      return;
    }

    if (domain && domain.family !== 'general') {
      step1Insight.innerHTML = `<strong>That gives us useful professional context.</strong> In ${title}, customers often need ${domain.customerNeed}. We’ll use common patterns from this field as a starting point, then let what you tell us about your own customers confirm, refine, or contradict them.`;
    } else {
      step1Insight.innerHTML = `<strong>That gives us the context we need.</strong> We’ll use “${title}” to frame the next questions around the actual decision your customers are making, rather than treating them as a generic audience.`;
    }
    step1Insight.hidden = false;
  }

  function updateStep2Language() {
    if (!step2Bridge) return;
    const title = offerInput.value.trim();
    const domain = domainModel();

    if (domain && domain.family !== 'general') {
      const role = rolePhrase(domain, title);
      step2Bridge.textContent = `As ${role}, you probably already know that customers do not always arrive knowing the right technical solution. They are usually trying to get ${domain.customerNeed}. ${domain.capabilityContrast} Help us understand what you already know about your customers so we can separate common patterns in the field from what you actually see in your work.`;
      return;
    }

    if (title) {
      step2Bridge.textContent = `As ${rolePhrase(domain, title)}, you probably already see patterns in why people contact you, what they worry about, and what helps them decide. Help us understand what you already know about your customers. We’ll use your observations to refine the general patterns around this kind of work.`;
      return;
    }

    step2Bridge.textContent = 'Help us understand what you already know about your customers. We’ll treat your answers as evidence and look for the recurring decision patterns behind them.';
  }

  function updateStep2Recognition() {
    if (!step2Insight) return;
    const values = selected('audience_values');
    const triggers = selected('audience_trigger');
    if (!values.length && !triggers.length) {
      step2Insight.hidden = true;
      return;
    }

    const pattern = bestAudiencePattern();
    const valueText = values.length ? `${natural(values.slice(0, 2))} matter` : 'you are seeing clear customer priorities';
    const triggerText = triggers.length ? `, especially when ${triggers[0].charAt(0).toLowerCase()}${triggers[0].slice(1)}` : '';
    const interpretation = pattern ? ` ${pattern.observation}` : '';
    step2Insight.innerHTML = `<strong>That adds an important distinction.</strong> You’re telling us ${valueText}${triggerText}.${interpretation} The next questions help us understand what that means at the moment they are deciding whether and how to hire you.`;
    step2Insight.hidden = false;
  }

  function updateStep3Language() {
    if (!step3Bridge) return;
    const title = offerInput.value.trim() || 'this work';
    const domain = domainModel();
    const decision = decisionSummary();
    const pattern = bestAudiencePattern();

    const evidence = decision.length
      ? `Your answers suggest they may especially need ${natural(decision)}.`
      : pattern ? pattern.observation : 'Your answers have given us a working picture of the decision.';

    if (domain && domain.family !== 'general') {
      step3Bridge.textContent = `We now have two kinds of evidence: what commonly happens around ${title}, and what you personally see in your customers. ${evidence} Now tell us how you work. We’re looking for where your standards genuinely make that decision clearer, safer, easier, or more useful—not for a value we can force into the story.`;
      return;
    }

    step3Bridge.textContent = `We now have the professional context and your observations about the customer decision. ${evidence} Tell us how you work so we can identify which of your standards actually help this customer make the decision well.`;
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
      ? `For ${title}, that is a meaningful combination because the customer may not be able to independently judge every professional or technical choice before hiring you.`
      : 'That gives us a credible set of standards to connect back to the customer decision.';

    step3Insight.innerHTML = `<strong>This is useful.</strong> ${domainLead} ${natural(visible)}. We’ll turn those standards into communication the customer can recognize rather than simply repeating the values as claims.`;
    step3Insight.hidden = false;
  }

  function updateAll() {
    updateStep1Recognition();
    updateStep2Language();
    updateStep2Recognition();
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
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-review-step'] });

  updateAll();
})();
