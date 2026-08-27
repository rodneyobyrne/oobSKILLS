(function () {
  'use strict';

  const form = document.getElementById('customer-flow-review');
  if (!form) return;

  const storageKey = 'oob-customer-flow-review-v1';
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
  const reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  let currentStep = 1;
  let currentMarkdown = '';

  const labels = {
    relationshipModel: {
      field: 'job / property / field service',
      professional: 'professional relationship / opportunity',
      appointment: 'appointment / specialized service record',
      transactional: 'order / purchase / transaction',
      mixed: 'mixed operating model'
    },
    existingSystem: {
      operational: 'field-service or job-management platform',
      crm: 'CRM',
      vertical: 'industry-specific scheduling / practice / service platform',
      pos: 'POS or commerce platform',
      sheets: 'Google Sheets or another spreadsheet',
      scattered: 'several competing systems',
      none: 'no reliable shared customer record'
    },
    recordQuality: {
      strong: 'reliable and routinely maintained',
      mostly: 'mostly reliable with some cleanup needed',
      weak: 'duplicates, missing fields or conflicting information are common',
      unknown: 'current record quality is not known'
    },
    firstCapture: {
      primary: 'directly in the primary customer system',
      sheet: 'a spreadsheet',
      inbox: 'an inbox, text thread or voicemail',
      memory: 'paper, memory or a personal note',
      varies: 'wherever the receiving person happens to work'
    },
    painPoint: {
      missed: 'missed inquiries or delayed response',
      admin: 'retyping and avoidable office work',
      status: 'unclear customer or job status',
      scheduling: 'scheduling or handoff confusion',
      followup: 'quotes, proposals or follow-up going quiet',
      reporting: 'manual reporting reconstruction',
      growth: 'a system that no longer fits the size of the team'
    },
    changeTiming: {
      now: 'address it now',
      offseason: 'use a slower / off-season window',
      quarter: 'address it within the next three months',
      exploring: 'understand the problem before choosing a change window'
    }
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
        if (field.type === 'checkbox' || field.type === 'radio') field.checked = field.value === saved || (field.type === 'checkbox' && saved === 'on');
        else field.value = saved;
      });
    });
  }

  function fieldName(field) {
    const explicitLabel = field.id ? form.querySelector(`label[for="${field.id}"]`) : null;
    const groupLegend = field.closest('fieldset')?.querySelector(':scope > legend');
    const wrappedLabel = field.closest('label');
    return (explicitLabel || groupLegend || wrappedLabel)?.textContent.trim().replace(/\s+/g, ' ') || 'this question';
  }

  function markInvalid(field, message) {
    field.setAttribute('aria-invalid', 'true');
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
      if (!field.checkValidity()) return markInvalid(field, `Complete “${fieldName(field)}” before continuing.`);
      field.removeAttribute('aria-invalid');
    }
    return true;
  }

  function collectData() {
    return {
      businessName: value('businessName').trim(),
      role: value('role').trim(),
      relationshipModel: value('relationshipModel'),
      sensitiveData: value('sensitiveData'),
      existingSystem: value('existingSystem'),
      recordQuality: value('recordQuality'),
      primaryChannel: value('primaryChannel'),
      firstCapture: value('firstCapture'),
      customerStep: value('customerStep').trim(),
      retyping: value('retyping'),
      followup: value('followup'),
      conversationHistory: value('conversationHistory'),
      sourceOwnership: value('sourceOwnership'),
      sheetsRole: value('sheetsRole'),
      integration: value('integration'),
      accountingAsCrm: value('accountingAsCrm'),
      accessReadiness: value('accessReadiness'),
      painPoint: value('painPoint'),
      changeTiming: value('changeTiming'),
      willingness: value('willingness'),
      successMeaning: value('successMeaning').trim()
    };
  }

  function sourceMap(data, evaluation) {
    const workOwner = data.relationshipModel === 'field'
      ? evaluation.primarySystem
      : data.relationshipModel === 'professional'
        ? evaluation.primarySystem
        : data.relationshipModel === 'appointment'
          ? evaluation.primarySystem
          : data.relationshipModel === 'transactional'
            ? evaluation.primarySystem
            : 'Selected operating platform after the workflow audit';

    return [
      ['Customer identity', evaluation.primarySystem],
      ['Job / opportunity / appointment / order state', workOwner],
      ['Conversation history', `${evaluation.primarySystem} or a reliably linked communication history`],
      ['Accounting', 'Accounting platform; receive the financial information it needs without becoming a competing operational record'],
      ['Documents', 'Existing shared document system, linked from the operating record when useful'],
      ['Temporary analysis', 'Google Sheets when useful for reporting, exports or one-off analysis']
    ];
  }

  function buildMarkdown(data, evaluation, createdDate) {
    const title = data.businessName ? `${data.businessName} Customer Flow WORKFILE` : 'Customer Flow WORKFILE';
    const warnings = evaluation.warnings.length
      ? evaluation.warnings.map((item) => `- ${item}`).join('\n')
      : '- No special warning was triggered by the answers. Platform fit and implementation details still need to be confirmed.';
    const priorities = evaluation.priorities.map((item, index) => `${index + 1}. ${item}`).join('\n');
    const map = sourceMap(data, evaluation).map(([kind, owner]) => `- **${kind}:** ${owner}`).join('\n');
    const flow = evaluation.flow.map((item) => `- **${item.label}:** ${item.value}`).join('\n');

    return `# ${title}\n\nCreated ${createdDate} with the free oobCREATIVE Customer Flow Review.\n\n## Architecture decision\n\n**${evaluation.verdict}**\n\n${evaluation.direction}\n\n**Primary system direction:** ${evaluation.primarySystem}\n\n**Platform direction:** ${evaluation.platformExample}\n\n## Implementation readiness\n\n**${evaluation.readinessLabel}**\n\n${evaluation.readinessExplanation}\n\n## What the business is organized around\n\n- **Relationship model:** ${labels.relationshipModel[data.relationshipModel]}\n- **Closest current master record:** ${labels.existingSystem[data.existingSystem]}\n- **Record quality:** ${labels.recordQuality[data.recordQuality]}\n- **First capture today:** ${labels.firstCapture[data.firstCapture]}\n- **Most visible cost:** ${labels.painPoint[data.painPoint]}\n- **Practical timing:** ${labels.changeTiming[data.changeTiming]}\n\n## Current customer sequence\n\n${data.customerStep}\n\n## Recommended information ownership\n\n${map}\n\n## Recommended customer flow\n\n${flow}\n\n## First priorities\n\n${priorities}\n\n## Risks or boundaries\n\n${warnings}\n\n## What success should feel like\n\n${data.successMeaning}\n\n## Do not do this first\n\n- Do not buy a CRM simply because the current system is messy.\n- Do not automate conflicting records before deciding which record is authoritative.\n- Do not import a spreadsheet without cleaning and mapping what each field actually means.\n- Do not make accounting software responsible for operational customer state by default.\n- Do not add a second CRM when an existing vertical or POS platform already owns the relationship well.\n\n## Suggested next working session\n\nMap one real customer from first contact to completed work and payment. For each handoff, record: who acts, which system changes, what information is copied, what can fail, and which system should own the result. Then confirm platform fit before migration or automation.\n\n## Important boundary\n\nThis workfile is planning guidance, not a guarantee that a named platform or integration will fit the business. Confirm current product capabilities, data-handling requirements, permissions, migration limits and implementation scope before changing systems. Do not enter confidential, regulated or identifying customer records into this browser review.\n`;
  }

  function renderResult(data, evaluation) {
    const createdDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
    const title = data.businessName ? `${data.businessName}: customer-system direction` : 'Your customer-system direction';
    const priorities = `<ol>${evaluation.priorities.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`;
    const warnings = evaluation.warnings.length
      ? `<ul>${evaluation.warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : '<p>No special warning was triggered by the answers. Product fit and implementation details still need to be confirmed.</p>';
    const map = sourceMap(data, evaluation)
      .map(([kind, owner]) => `<li><strong>${escapeHtml(kind)}</strong><span>${escapeHtml(owner)}</span></li>`)
      .join('');
    const flow = evaluation.flow
      .map((item) => `<li><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.value)}</span></li>`)
      .join('');

    resultTitle.textContent = title;
    resultDate.textContent = createdDate;
    resultContent.innerHTML = `
      <div class="result-verdict"><p class="meta">Architecture decision</p><h3>${escapeHtml(evaluation.verdict)}</h3><p>${escapeHtml(evaluation.direction)}</p><p><strong>Primary system direction:</strong> ${escapeHtml(evaluation.primarySystem)}</p></div>
      <div class="result-grid">
        <article class="result-card"><p class="meta">Implementation readiness</p><h3>${escapeHtml(evaluation.readinessLabel)}</h3><p>${escapeHtml(evaluation.readinessExplanation)}</p></article>
        <article class="result-card"><p class="meta">Platform direction</p><h3>Architecture before vendor</h3><p>${escapeHtml(evaluation.platformExample)}</p></article>
      </div>
      <h3>Recommended information ownership</h3>
      <ul class="result-map">${map}</ul>
      <h3>Recommended customer flow</h3>
      <ul class="result-map">${flow}</ul>
      <div class="result-callout"><p class="meta">Current sequence</p><p>${escapeHtml(data.customerStep)}</p></div>
      <h3>Fix these first</h3>
      ${priorities}
      <h3>Risks and boundaries</h3>
      ${warnings}
      <div class="result-script"><p><strong>Six-week success test:</strong> ${escapeHtml(data.successMeaning)}</p></div>
      <div class="do-not-build"><h3>Do not solve the wrong problem first.</h3><ul><li>Do not buy a CRM simply because the current setup is messy.</li><li>Do not automate conflicting records before defining one authoritative source.</li><li>Do not migrate a spreadsheet without cleaning and mapping the data.</li><li>Do not make accounting software the operational customer system by default.</li><li>Do not add a second CRM when a vertical or POS platform already owns the relationship well.</li></ul></div>
      <aside class="result-next-step"><p class="meta">Optional human support</p><h3>Map the real workflow before changing the stack.</h3><p>You can use this workfile independently. If the handoffs, data cleanup or platform choice need a second set of eyes, oobCREATIVE can review the customer flow and define a bounded implementation path.</p><a class="button button--paper" href="/services/">See ways to work together</a></aside>
    `;

    currentMarkdown = buildMarkdown(data, evaluation, createdDate);
    result.hidden = false;
    result.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    result.focus({ preventScroll: true });
  }

  function fallbackCopy(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(area);
    return copied;
  }

  restoreDraft();
  showStep(1, false);

  form.addEventListener('input', saveDraft);
  form.addEventListener('change', saveDraft);

  nextButton.addEventListener('click', function () {
    if (!validateStep()) return;
    saveDraft();
    showStep(Math.min(steps.length, currentStep + 1));
  });

  backButton.addEventListener('click', function () {
    saveDraft();
    showStep(Math.max(1, currentStep - 1));
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validateStep()) return;
    const data = collectData();
    const evaluation = window.OobCustomerFlowEngine.evaluate(data);
    saveDraft();
    renderResult(data, evaluation);
  });

  document.getElementById('clear-draft').addEventListener('click', function () {
    try { localStorage.removeItem(storageKey); } catch (error) { /* no-op */ }
    form.reset();
    result.hidden = true;
    currentMarkdown = '';
    showStep(1);
    status.textContent = 'Saved draft cleared.';
  });

  document.getElementById('start-over').addEventListener('click', function () {
    try { localStorage.removeItem(storageKey); } catch (error) { /* no-op */ }
    form.reset();
    result.hidden = true;
    currentMarkdown = '';
    showStep(1);
  });

  document.getElementById('copy-result').addEventListener('click', async function () {
    if (!currentMarkdown) return;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(currentMarkdown);
      else if (!fallbackCopy(currentMarkdown)) throw new Error('Copy unavailable');
      copyStatus.textContent = 'Workfile copied.';
    } catch (error) {
      copyStatus.textContent = 'Copy was not available in this browser. Use Download Markdown instead.';
    }
  });

  document.getElementById('download-result').addEventListener('click', function () {
    if (!currentMarkdown) return;
    const data = collectData();
    const safeName = (data.businessName || 'customer-flow')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'customer-flow';
    const blob = new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeName}-customer-flow-workfile.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    copyStatus.textContent = 'Markdown workfile downloaded.';
  });

  document.getElementById('print-result').addEventListener('click', function () {
    window.print();
  });
})();
