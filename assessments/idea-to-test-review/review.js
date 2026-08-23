(function () {
  'use strict';

  const form = document.getElementById('idea-test-review');
  if (!form) return;

  const storageKey = 'oob-idea-to-test-review-v1';
  const steps = Array.from(form.querySelectorAll('.review-step'));
  const progressItems = Array.from(document.querySelectorAll('[data-progress]'));
  const progressLabel = document.getElementById('progress-label');
  const progressBar = document.getElementById('progress-bar');
  const nextButton = document.getElementById('next-step');
  const backButton = document.getElementById('back-step');
  const submitButton = document.getElementById('create-result');
  const status = document.getElementById('form-status');
  const result = document.getElementById('review-result');
  const resultContent = document.getElementById('result-content');
  const resultTitle = document.getElementById('result-title');
  const resultDate = document.getElementById('result-date');
  const copyStatus = document.getElementById('copy-status');
  const decisionDate = document.getElementById('decision-date');
  const reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };
  let currentStep = 1;
  let currentMarkdown = '';

  const labels = {
    trigger: {
      transition: 'a transition in role, industry or season of work',
      request: 'a real request for related help',
      pattern: 'a repeated unmet need or workaround',
      deadline: 'a decision point before further investment'
    },
    protect: {
      possibility: 'room to change direction',
      credibility: 'professional credibility',
      independence: 'independence and ownership',
      relationships: 'existing relationships'
    },
    evidence: {
      observed: 'observed repeatedly in real work',
      asked: 'requested directly by real people',
      inferred: 'inferred from relevant experience',
      assumption: 'mostly untested assumption'
    },
    directionState: {
      one: 'one idea being refined privately',
      few: 'two or three plausible directions',
      many: 'too many directions competing for attention',
      audience: 'an idea without a clear first audience'
    },
    testType: {
      conversation: 'problem conversations',
      outreach: 'direct invitations',
      page: 'a simple offer page',
      paid: 'a small paid pilot invitation'
    },
    testSize: { three: '3 people', five: '5 people', ten: '6–10 people', over: 'more than 10 people' },
    timeframe: { twoWeeks: '14 days or less', month: '15–30 days', open: 'an open-ended period' }
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function value(name) {
    const checked = form.querySelector(`[name="${name}"]:checked`);
    if (checked) return checked.value;
    const field = form.querySelector(`[name="${name}"]`);
    return field ? field.value || '' : '';
  }

  function serializeDraft() {
    const draft = {};
    new FormData(form).forEach((entry, key) => { draft[key] = entry; });
    return draft;
  }

  function saveDraft() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(serializeDraft()));
    } catch (error) {
      // The review remains usable when browser storage is unavailable.
    }
  }

  function restoreDraft() {
    let draft;
    try {
      draft = JSON.parse(localStorage.getItem(storageKey) || 'null');
    } catch (error) {
      draft = null;
    }
    if (!draft) return;

    Object.entries(draft).forEach(([name, saved]) => {
      const fields = Array.from(form.querySelectorAll(`[name="${name}"]`));
      fields.forEach((field) => {
        if (field.type === 'checkbox' || field.type === 'radio') field.checked = field.value === saved;
        else field.value = saved;
      });
    });
  }

  function addDescription(element, id) {
    const ids = new Set((element.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    ids.add(id);
    element.setAttribute('aria-describedby', Array.from(ids).join(' '));
  }

  function removeDescription(element, id) {
    const ids = (element.getAttribute('aria-describedby') || '').split(/\s+/).filter((item) => item && item !== id);
    if (ids.length) element.setAttribute('aria-describedby', ids.join(' '));
    else element.removeAttribute('aria-describedby');
  }

  function fieldName(field) {
    const explicitLabel = field.id ? form.querySelector(`label[for="${field.id}"]`) : null;
    const wrappedLabel = field.closest('label');
    const groupLegend = field.closest('fieldset')?.querySelector(':scope > legend');
    return (explicitLabel || groupLegend || wrappedLabel)?.textContent.trim().replace(/\s+/g, ' ') || 'this question';
  }

  function markInvalid(field, message) {
    field.setAttribute('aria-invalid', 'true');
    addDescription(field, 'form-status');
    status.textContent = message;
    field.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
    field.focus({ preventScroll: true });
    return false;
  }

  function showStep(stepNumber, shouldScroll = true) {
    currentStep = stepNumber;
    steps.forEach((step) => { step.hidden = Number(step.dataset.step) !== currentStep; });
    progressItems.forEach((item) => {
      const number = Number(item.dataset.progress);
      item.classList.toggle('is-complete', number < currentStep);
      if (number === currentStep) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    progressLabel.textContent = `Step ${currentStep} of ${steps.length}`;
    progressBar.style.width = `${(currentStep / steps.length) * 100}%`;
    backButton.hidden = currentStep === 1;
    nextButton.hidden = currentStep === steps.length;
    submitButton.hidden = currentStep !== steps.length;
    status.textContent = '';
    if (shouldScroll) {
      const activeStep = steps[currentStep - 1];
      activeStep.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      activeStep.querySelector(':scope > legend')?.focus({ preventScroll: true });
    }
  }

  function validateStep() {
    const step = steps[currentStep - 1];
    const required = Array.from(step.querySelectorAll('[required]'));

    for (const field of required) {
      if (!field.checkValidity()) {
        return markInvalid(field, `Complete “${fieldName(field)}” before continuing.`);
      }
      field.removeAttribute('aria-invalid');
      removeDescription(field, 'form-status');
    }

    if (currentStep === 4 && decisionDate.value < decisionDate.min) {
      return markInvalid(decisionDate, 'Choose today or a future date for the decision.');
    }
    if (currentStep === 4) {
      const days = Math.ceil((new Date(`${decisionDate.value}T12:00:00`) - new Date(`${decisionDate.min}T12:00:00`)) / 86400000);
      if (value('timeframe') === 'twoWeeks' && days > 14) {
        return markInvalid(decisionDate, 'A 14-day test needs a decision date within the next 14 days.');
      }
      if (value('timeframe') === 'month' && days > 30) {
        return markInvalid(decisionDate, 'A 30-day test needs a decision date within the next 30 days.');
      }
    }
    return true;
  }

  function collectData() {
    return {
      projectName: value('projectName').trim(),
      role: value('role').trim(),
      trigger: value('trigger'),
      protect: value('protect'),
      directionState: value('directionState'),
      idea: value('idea').trim(),
      setAside: value('setAside').trim(),
      experience: value('experience').trim(),
      problem: value('problem').trim(),
      evidence: value('evidence'),
      audience: value('audience').trim(),
      audienceClarity: value('audienceClarity'),
      reach: value('reach'),
      buyer: value('buyer'),
      outcomeScope: value('outcomeScope'),
      smallestOutcome: value('smallestOutcome').trim(),
      boundary: value('boundary').trim(),
      proof: value('proof'),
      proofDetail: value('proofDetail').trim(),
      testType: value('testType'),
      testSize: value('testSize'),
      timeframe: value('timeframe'),
      decisionDate: value('decisionDate'),
      invitation: value('invitation').trim(),
      successSignal: value('successSignal').trim(),
      stopCondition: value('stopCondition').trim()
    };
  }

  function evaluate(data) {
    return window.OobIdeaTestEngine.evaluate(data);
  }

  function formatDecisionDate(date) {
    const parsed = new Date(`${date}T12:00:00`);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(parsed);
  }

  function buildBriefs(data, evaluation) {
    return [
      `BRIEF 1 — AUDIENCE CONVERSATION\nI am examining this problem, not selling a finished solution: ${data.problem}\nThe first audience I need to understand is: ${data.audience}\nAsk:\n1. Tell me about the last time this happened.\n2. What did you do instead?\n3. What did the workaround cost in time, money, attention or trust?\n4. Who decides whether anything changes?\n5. What would a meaningfully better result look like?\nListen for repeated language, current behavior and consequences. Do not teach, persuade or ask whether the idea sounds good.`,
      `BRIEF 2 — TEST INVITATION\nAudience: ${data.audience}\nProblem hypothesis: ${data.problem}\nSmallest useful outcome: ${data.smallestOutcome}\nCredibility to show: ${data.proofDetail}\nPlain-language ask: ${data.invitation}\nBoundary: ${data.boundary}\nDo not add false urgency, inflated proof or a promise larger than the test.`,
      `BRIEF 3 — POST-TEST DECISION\nDecision date: ${formatDecisionDate(data.decisionDate)}\nMeaningful evidence: ${data.successSignal}\nReason to revise or stop: ${data.stopCondition}\nAt the decision date, record:\n- What people actually did, not what they praised\n- Language or problems repeated without prompting\n- Who could decide or pay\n- Where the invitation confused people\n- What evidence would justify one next test\nChoose one: continue, revise, run a problem test or set the direction aside.`
    ];
  }

  function hypothesis(data) {
    return `For ${data.audience}, who are dealing with ${data.problem}, test whether ${data.smallestOutcome} is useful enough for them to take this next step: ${data.invitation}`;
  }

  function buildMarkdown(data, evaluation, briefs, createdDate) {
    const title = data.projectName ? `${data.projectName} Idea-to-Test WORKFILE` : 'Idea-to-Test WORKFILE';
    const blockers = evaluation.blockers.length
      ? evaluation.blockers.map((item) => `- ${item}`).join('\n')
      : '- No immediate structural blocker was identified. The market test can still disprove the idea.';

    return `# ${title}\n\nCreated ${createdDate} with the free oobCREATIVE Idea-to-Test Review.\n\n## Readiness decision\n\n**${evaluation.verdict}**\n\n${evaluation.explanation}\n\n**Next action:** ${evaluation.nextAction}\n\n## Test hypothesis\n\n${hypothesis(data)}\n\n## What this test protects\n\n- Timely because of: ${labels.trigger[data.trigger]}\n- Value to protect: ${labels.protect[data.protect]}\n- Direction deliberately set aside: ${data.setAside}\n\n## Evidence and assumptions\n\n- **Current evidence level:** ${labels.evidence[data.evidence]}\n- **Relevant experience or access:** ${data.experience}\n- **Credibility available now:** ${data.proofDetail}\n- **Riskiest assumption:** ${evaluation.riskiestAssumption}\n\n## Conditions to resolve or watch\n\n${blockers}\n\n## Credibility minimum\n\nShow only: ${data.proofDetail}\n\nDo not claim demand, results or authority the test has not established.\n\n## Field test\n\n- **Method:** ${labels.testType[data.testType]}\n- **People:** ${labels.testSize[data.testSize]}\n- **Window:** ${labels.timeframe[data.timeframe]}\n- **Decision date:** ${formatDecisionDate(data.decisionDate)}\n- **Invitation:** ${data.invitation}\n- **Meaningful evidence:** ${data.successSignal}\n- **Revise or stop when:** ${data.stopCondition}\n- **Outside scope:** ${data.boundary}\n\n## Do not build yet\n\n- A full brand or multi-page website\n- A course, content library or automated delivery system\n- A broad launch or paid advertising campaign\n- Multiple offers for multiple audiences\n- Technology that assumes demand before the test observes it\n\n## Reusable briefs\n\n${briefs.map((brief) => `### ${brief.split('\n')[0]}\n\n${brief.split('\n').slice(1).join('\n')}`).join('\n\n')}\n\n## Important boundary\n\nThis workfile structures a market test. It does not predict demand, guarantee sales or replace legal, financial, employment, privacy or other professional advice. Do not enter or share confidential or identifying records without appropriate permission and safeguards.\n`;
  }

  function renderResult(data, evaluation) {
    const createdDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
    const briefs = buildBriefs(data, evaluation);
    const title = data.projectName ? `${data.projectName}: the next honest test` : 'The next honest test';
    const blockerHtml = evaluation.blockers.length
      ? `<ul>${evaluation.blockers.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : '<p>No immediate structural blocker was identified. The market test can still disprove the idea.</p>';
    const needsAudienceClarity = evaluation.verdict === 'Test the problem first' || evaluation.verdict === 'Narrow the test';
    const optionalNextStep = needsAudienceClarity
      ? '<aside class="result-next-step"><p class="meta">Optional next step</p><h3>Clarify the audience before adding more offer language.</h3><p>You can use this workfile independently. If the first audience or decision context is still difficult to name, the free Audience Review provides another structured pass without a sales gate.</p><a class="button button--paper" href="/audience-review/">Review the audience</a></aside>'
      : '<aside class="result-next-step"><p class="meta">Optional human support</p><h3>Keep the test small. Add help only where judgment or implementation is stuck.</h3><p>You do not need a consultation to use this workfile. If evidence from the test reveals a defined need, review the bounded ways oobCREATIVE can help.</p><a class="button button--paper" href="/services/">See ways to work together</a></aside>';

    resultTitle.textContent = title;
    resultDate.textContent = createdDate;
    resultContent.innerHTML = `
      <div class="result-verdict"><p class="meta">Readiness decision</p><h3>${escapeHtml(evaluation.verdict)}</h3><p>${escapeHtml(evaluation.explanation)}</p><p><strong>Next action:</strong> ${escapeHtml(evaluation.nextAction)}</p></div>
      <h3>Your test hypothesis</h3>
      <div class="result-script"><p>${escapeHtml(hypothesis(data))}</p></div>
      <div class="result-grid">
        <article class="result-card"><p class="meta">What this protects</p><h3>${escapeHtml(labels.protect[data.protect])}</h3><p>${escapeHtml(data.role)} is starting with ${escapeHtml(labels.directionState[data.directionState])}. This is a reversible test, not a permanent identity decision.</p></article>
        <article class="result-card"><p class="meta">Riskiest assumption</p><h3>Test this first</h3><p>${escapeHtml(evaluation.riskiestAssumption)}</p></article>
      </div>
      <h3>Evidence and assumption map</h3>
      <ul class="evidence-key"><li><strong>Evidence level:</strong> ${escapeHtml(labels.evidence[data.evidence])}</li><li><strong>Decision date:</strong> ${escapeHtml(formatDecisionDate(data.decisionDate))}</li></ul>
      <table class="assumption-table"><thead><tr><th scope="col">What you know</th><th scope="col">What the test still needs to learn</th></tr></thead><tbody><tr><td>${escapeHtml(data.experience)}</td><td>${escapeHtml(evaluation.riskiestAssumption)}</td></tr><tr><td>${escapeHtml(data.proofDetail)}</td><td>Whether the intended audience takes the requested next step.</td></tr></tbody></table>
      <h3>Conditions to resolve or watch</h3>${blockerHtml}
      <div class="result-callout"><p class="meta">Credibility minimum</p><h3>Show one relevant reason to trust the test</h3><p>${escapeHtml(data.proofDetail)}</p><p>Do not claim demand, results or authority the test has not established.</p></div>
      <h3>Your bounded field test</h3>
      <ul><li><strong>Method:</strong> ${escapeHtml(labels.testType[data.testType])}</li><li><strong>People:</strong> ${escapeHtml(labels.testSize[data.testSize])}</li><li><strong>Window:</strong> ${escapeHtml(labels.timeframe[data.timeframe])}</li><li><strong>Decision date:</strong> ${escapeHtml(formatDecisionDate(data.decisionDate))}</li><li><strong>Invitation:</strong> ${escapeHtml(data.invitation)}</li><li><strong>Meaningful evidence:</strong> ${escapeHtml(data.successSignal)}</li><li><strong>Revise or stop when:</strong> ${escapeHtml(data.stopCondition)}</li><li><strong>Outside scope:</strong> ${escapeHtml(data.boundary)}</li></ul>
      <div class="do-not-build"><h3>Do not build yet</h3><ul><li>A full brand or multi-page website</li><li>A course, content library or automated delivery system</li><li>A broad launch or paid advertising campaign</li><li>Multiple offers for multiple audiences</li><li>Technology that assumes demand before the test observes it</li></ul></div>
      <h3>Three reusable briefs</h3>
      ${briefs.map((brief) => `<pre class="working-brief">${escapeHtml(brief)}</pre>`).join('')}
      <div class="content-note"><strong>Important boundary:</strong> This workfile structures a market test. It does not predict demand, guarantee sales or replace legal, financial, privacy or other professional advice.</div>
      ${optionalNextStep}`;

    currentMarkdown = buildMarkdown(data, evaluation, briefs, createdDate);
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  }

  nextButton.addEventListener('click', () => {
    if (!validateStep()) return;
    saveDraft();
    showStep(Math.min(steps.length, currentStep + 1));
  });

  backButton.addEventListener('click', () => showStep(Math.max(1, currentStep - 1)));

  form.addEventListener('input', (event) => {
    event.target.removeAttribute('aria-invalid');
    removeDescription(event.target, 'form-status');
    status.textContent = '';
    saveDraft();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateStep()) return;
    const data = collectData();
    renderResult(data, evaluate(data));
    saveDraft();
  });

  document.getElementById('clear-draft').addEventListener('click', () => {
    if (!window.confirm('Clear every answer and the generated result from this browser?')) return;
    localStorage.removeItem(storageKey);
    form.reset();
    result.hidden = true;
    currentMarkdown = '';
    showStep(1);
  });

  document.getElementById('download-result').addEventListener('click', () => {
    if (!currentMarkdown) return;
    const blob = new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const project = value('projectName').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    anchor.href = url;
    anchor.download = `${project ? `${project}-` : ''}idea-to-test-workfile.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  });

  document.getElementById('copy-result').addEventListener('click', async () => {
    if (!currentMarkdown) return;
    try {
      await navigator.clipboard.writeText(currentMarkdown);
      copyStatus.textContent = 'Result copied.';
    } catch (error) {
      copyStatus.textContent = 'Copy was blocked by the browser. Download the Markdown file instead.';
    }
  });

  document.getElementById('print-result').addEventListener('click', () => window.print());

  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  decisionDate.min = localToday;
  restoreDraft();
  showStep(1, false);
})();
