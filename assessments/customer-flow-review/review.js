(function () {
  'use strict';

  const form = document.getElementById('customer-flow-review');
  if (!form) return;

  const storageKey = 'oob-customer-flow-review-v2';
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
  const reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  let currentStep = 1;
  let currentMarkdown = '';

  const labels = {
    adminTime: { under1: 'less than 1 hour', one3: '1–3 hours', four8: '4–8 hours', one2days: '1–2 workdays', over2days: 'more than 2 workdays', unknown: 'an unknown amount of time' },
    paceMatch: { yes: 'yes', mostly: 'mostly', little: 'a little', no: 'no', workarounds: 'mostly through added workarounds' },
    changeTiming: { now: 'now', one3: 'within 1–3 months', slower: 'during the next slower period', beforeBusy: 'before the next busy season', later: 'later this year', exploring: 'exploring only for now' },
    slowPeriod: { winter: 'winter', spring: 'spring', summer: 'summer', fall: 'fall', none: 'no predictable slow period', varies: 'a timing window that varies' }
  };

  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  function value(name) {
    const checked = form.querySelector(`[name="${name}"]:checked`);
    if (checked) return checked.value;
    return form.querySelector(`[name="${name}"]`)?.value || '';
  }

  const values = (name) => Array.from(form.querySelectorAll(`[name="${name}"]:checked`)).map((field) => field.value);

  function serializeDraft() {
    const draft = {};
    new FormData(form).forEach((entry, key) => {
      if (Object.prototype.hasOwnProperty.call(draft, key)) draft[key] = Array.isArray(draft[key]) ? [...draft[key], entry] : [draft[key], entry];
      else draft[key] = entry;
    });
    return draft;
  }

  function saveDraft() {
    try { sessionStorage.setItem(storageKey, JSON.stringify(serializeDraft())); } catch (error) { /* usable without storage */ }
  }

  function restoreDraft() {
    let draft = null;
    try { draft = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch (error) { draft = null; }
    if (!draft) return;
    Object.entries(draft).forEach(([name, saved]) => {
      Array.from(form.querySelectorAll(`[name="${name}"]`)).forEach((field) => {
        if (field.type === 'checkbox' || field.type === 'radio') field.checked = Array.isArray(saved) ? saved.includes(field.value) : saved === field.value;
        else field.value = Array.isArray(saved) ? saved[0] : saved;
      });
    });
  }

  function fieldName(field) {
    return (field.id ? form.querySelector(`label[for="${field.id}"]`) : null)?.textContent.trim().replace(/\s+/g, ' ')
      || field.closest('fieldset')?.querySelector(':scope > legend')?.textContent.trim().replace(/\s+/g, ' ')
      || field.closest('label')?.textContent.trim().replace(/\s+/g, ' ')
      || 'this question';
  }

  function markInvalid(field, message) {
    field.setAttribute('aria-invalid', 'true');
    status.textContent = message;
    field.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
    field.focus({ preventScroll: true });
    return false;
  }

  function markGroupInvalid(name, message) {
    const first = form.querySelector(`[name="${name}"]`);
    first?.closest('.choice-group')?.setAttribute('aria-invalid', 'true');
    status.textContent = message;
    first?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
    first?.focus({ preventScroll: true });
    return false;
  }

  function clearGroupInvalid(name) {
    form.querySelector(`[name="${name}"]`)?.closest('.choice-group')?.removeAttribute('aria-invalid');
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
    for (const field of steps[currentStep - 1].querySelectorAll('[required]')) {
      if (!field.checkValidity()) return markInvalid(field, `Complete “${fieldName(field)}” before continuing.`);
      field.removeAttribute('aria-invalid');
    }
    if (currentStep === 1 && !values('contactChannels').length) return markGroupInvalid('contactChannels', 'Choose at least one way customers can contact the business.');
    if (currentStep === 2 && !values('infoPlaces').length) return markGroupInvalid('infoPlaces', 'Choose at least one place where customer information is found.');
    if (currentStep === 4 && !values('toolCategories').length) return markGroupInvalid('toolCategories', 'Choose at least one tool category the business relies on.');
    if (currentStep === 4 && !values('growthChanges').length) return markGroupInvalid('growthChanges', 'Choose at least one answer about what has changed in the business.');
    if (currentStep === 5) {
      const count = values('improvementPriorities').length;
      if (!count) return markGroupInvalid('improvementPriorities', 'Choose at least one outcome that would make the biggest difference.');
      if (count > 3) return markGroupInvalid('improvementPriorities', 'Choose no more than three outcomes.');
    }
    return true;
  }

  function collectData() {
    return {
      businessName: value('businessName').trim(),
      contactChannels: values('contactChannels'),
      responseConfidence: value('responseConfidence'),
      missedCall: value('missedCall'),
      infoPlaces: values('infoPlaces'),
      historyEase: value('historyEase'),
      familiarPhrase: value('familiarPhrase'),
      taskFrequency: {
        copy: value('taskCopy'), reenter: value('taskReenter'), check: value('taskCheck'), remind: value('taskRemind'), tell: value('taskTell'),
        voicemail: value('taskVoicemail'), messages: value('taskMessages'), contacted: value('taskContacted'), lookup: value('taskLookup'), reschedule: value('taskReschedule')
      },
      adminTime: value('adminTime'),
      toolCategories: values('toolCategories'),
      productNames: value('productNames').trim(),
      toolFeeling: value('toolFeeling'),
      growthChanges: values('growthChanges'),
      paceMatch: value('paceMatch'),
      improvementPriorities: values('improvementPriorities'),
      yearConcern: value('yearConcern'),
      changeTiming: value('changeTiming'),
      slowPeriod: value('slowPeriod')
    };
  }

  function dimensionRows(evaluation) {
    return [
      ['Communication', evaluation.statuses.communication, evaluation.scores.communication, 'Are customer contacts being captured and answered?'],
      ['Information', evaluation.statuses.information, evaluation.scores.information, 'Is customer context available where it is needed?'],
      ['Workflow', evaluation.statuses.workflow, evaluation.scores.workflow, 'Does information lead to the right next action without repeated manual handoffs?'],
      ['Capacity', evaluation.statuses.capacity, evaluation.scores.capacity, 'How much human time is being spent bridging gaps?'],
      ['Change Pressure', evaluation.statuses.changePressure, evaluation.scores.changePressure, 'How much does the current pattern matter to the next season of the business?']
    ];
  }

  function buildMarkdown(data, evaluation, createdDate) {
    const title = data.businessName ? `${data.businessName} Customer Flow Health` : 'Customer Flow Health';
    const dimensions = dimensionRows(evaluation).map(([name, statusLabel, , description]) => `- **${name} — ${statusLabel}:** ${description}`).join('\n');
    const signals = evaluation.recognitionSignals.map((item) => `- ${item}`).join('\n');
    const focus = evaluation.focusAreas.map((item, index) => `${index + 1}. ${item}`).join('\n');
    return `# ${title}\n\nCreated ${createdDate} with the free oobCREATIVE “Is Your Business Outgrowing Its Systems?” review.\n\n## Your stage\n\n**${evaluation.stageName}**\n\n${evaluation.summary}\n\n**What this suggests:** ${evaluation.action}\n\n## Customer Flow Health\n\n${dimensions}\n\n## What your answers are saying\n\n${signals}\n\n## Invisible work estimate\n\nYou estimated ${labels.adminTime[data.adminTime]} each week is spent on small administrative handoffs such as copying, checking, reminding, relaying or re-entering information. This is an estimate, not a measured savings claim.\n\n## Growth check\n\nHas customer-information management changed at the same pace as the business? **${labels.paceMatch[data.paceMatch]}**\n\n## Where to look first\n\n${focus}\n\n## Your current tools\n\n${evaluation.toolContext}\n\n${data.productNames ? `Tools you named: ${data.productNames}\n\n` : ''}## We don't have a favorite system\n\nJobber may be exactly right for one company. HubSpot may be right for another. Your current platform may already be capable of doing everything you need. Sometimes the answer is a new system. Sometimes it is connecting two systems you already have. Sometimes it is changing one workflow. And sometimes the right recommendation is: do not change anything yet.\n\noobCREATIVE works from the problem outward—not from a software product inward.\n\n## Practical timing\n\nYou said the business could realistically address this ${labels.changeTiming[data.changeTiming]}, and operational changes are usually easiest during ${labels.slowPeriod[data.slowPeriod]}.\n\n## Technology without the chase\n\nYou should not have to become an AI expert to run a good business. Technology changes quickly. Features appear, platforms change, AI capabilities improve and yesterday’s limitation may disappear with a software update. oobCREATIVE pays attention to that landscape so you can pay attention to your business. Until something is useful enough to matter to the way you work, you do not need another shiny thing.\n\n## Important boundary\n\nThis review identifies patterns and places worth examining. It does not diagnose a business, guarantee savings or assume that new software or AI is the answer. Your answers are processed in this browser and are not automatically sent to oobCREATIVE.\n`;
  }

  function meterCard(name, statusLabel, score, description) {
    return `<article class="health-card"><div class="health-card__heading"><h3>${escapeHtml(name)}</h3><strong>${escapeHtml(statusLabel)}</strong></div><div class="health-meter" role="img" aria-label="${escapeHtml(name)}: ${escapeHtml(statusLabel)}"><span style="width:${Number(score)}%"></span></div><p>${escapeHtml(description)}</p></article>`;
  }

  function renderResult(data, evaluation) {
    const createdDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
    resultTitle.textContent = data.businessName ? `${data.businessName}: what your customer flow is showing` : 'What your customer flow is showing';
    resultDate.textContent = createdDate;
    const dimensions = dimensionRows(evaluation).map((row) => meterCard(...row)).join('');
    const signals = `<ul>${evaluation.recognitionSignals.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    const focus = `<ol>${evaluation.focusAreas.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`;

    resultContent.innerHTML = `
      <div class="result-verdict"><p class="meta">Your stage</p><h3>${escapeHtml(evaluation.stageName)}</h3><p>${escapeHtml(evaluation.summary)}</p><p><strong>What this suggests:</strong> ${escapeHtml(evaluation.action)}</p></div>
      <h3>Customer Flow Health</h3><div class="health-grid">${dimensions}</div>
      <div class="result-callout recognition-block"><p class="meta">Self-recognition</p><h3>What your answers are saying</h3>${signals}</div>
      <div class="result-grid"><article class="result-card"><p class="meta">Invisible work</p><h3>${escapeHtml(labels.adminTime[data.adminTime])} each week</h3><p>Your estimate for small administrative handoffs—copying, checking, reminding, relaying or re-entering information. This is not a savings claim; it is a place to look.</p></article><article class="result-card"><p class="meta">Growth check</p><h3>${escapeHtml(labels.paceMatch[data.paceMatch])}</h3><p>That is how you described whether customer-information management has changed at roughly the same pace as the business.</p></article></div>
      <h3>See what is worth fixing first</h3>${focus}
      <div class="result-callout"><p class="meta">Your existing tools</p><p>${escapeHtml(evaluation.toolContext)}</p>${data.productNames ? `<p><strong>Tools you named:</strong> ${escapeHtml(data.productNames)}</p>` : ''}</div>
      <div class="neutrality-block"><p class="meta">A useful oobCREATIVE rule</p><h3>We don't have a favorite system.</h3><p>Jobber may be exactly right for one company. HubSpot may be right for another. Your current platform may already be capable of doing everything you need.</p><p>Sometimes the answer is a new system. Sometimes it is connecting two systems you already have. Sometimes it is changing one workflow. And sometimes the right recommendation is: <strong>do not change anything yet.</strong></p><p><strong>oobCREATIVE works from the problem outward—not from a software product inward.</strong></p></div>
      <div class="technology-block"><p class="meta">Technology without the chase</p><h3>You shouldn't have to become an AI expert to run a good business.</h3><p>Technology changes quickly. Features appear, platforms change, AI capabilities improve and yesterday's limitation may disappear with a software update.</p><p>oobCREATIVE pays attention to that landscape so you can pay attention to your business. Until something is useful enough to matter to the way you work, you do not need another shiny thing.</p></div>
      <aside class="result-next-step"><p class="meta">Optional human review</p><h3>Review My Customer Flow</h3><p>We'll look for the one or two places where customer communication or information flow appears to be costing the most time or opportunity. No requirement to replace your software. No predetermined AI solution. No technology shopping list.</p><p class="review-privacy-note">Your assessment answers are not automatically sent. You choose what to share.</p><a class="button button--paper" href="mailto:hello@oobcreative.com?subject=Review%20My%20Customer%20Flow">Review My Customer Flow</a></aside>`;

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
    area.remove();
    return copied;
  }

  function clearStoredDraft() {
    try { sessionStorage.removeItem(storageKey); } catch (error) { /* no-op */ }
  }

  restoreDraft();
  showStep(1, false);
  form.addEventListener('input', saveDraft);
  form.addEventListener('change', function (event) {
    const target = event.target;
    if (target?.name === 'growthChanges' && target.checked) {
      const growthFields = Array.from(form.querySelectorAll('[name="growthChanges"]'));
      if (target.value === 'none') growthFields.forEach((field) => { if (field !== target) field.checked = false; });
      else {
        const none = growthFields.find((field) => field.value === 'none');
        if (none) none.checked = false;
      }
      clearGroupInvalid('growthChanges');
    }
    if (target?.name === 'improvementPriorities') {
      const selected = values('improvementPriorities');
      const help = document.getElementById('priority-help');
      if (selected.length > 3) {
        target.checked = false;
        if (help) help.textContent = 'Choose up to three. Remove one before adding another.';
      } else if (help) help.textContent = selected.length ? `${selected.length} of 3 selected.` : 'Choose one to three.';
      clearGroupInvalid('improvementPriorities');
    }
    ['contactChannels', 'infoPlaces', 'toolCategories'].forEach((name) => { if (target?.name === name) clearGroupInvalid(name); });
    saveDraft();
  });

  nextButton.addEventListener('click', function () { if (validateStep()) { saveDraft(); showStep(Math.min(steps.length, currentStep + 1)); } });
  backButton.addEventListener('click', function () { saveDraft(); showStep(Math.max(1, currentStep - 1)); });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validateStep()) return;
    const data = collectData();
    saveDraft();
    renderResult(data, window.OobCustomerFlowEngine.evaluate(data));
  });

  document.getElementById('clear-draft').addEventListener('click', function () { clearStoredDraft(); form.reset(); result.hidden = true; currentMarkdown = ''; showStep(1); status.textContent = 'Saved draft cleared.'; });
  document.getElementById('start-over').addEventListener('click', function () { clearStoredDraft(); form.reset(); result.hidden = true; currentMarkdown = ''; showStep(1); });
  document.getElementById('copy-result').addEventListener('click', async function () {
    if (!currentMarkdown) return;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(currentMarkdown);
      else if (!fallbackCopy(currentMarkdown)) throw new Error('Copy unavailable');
      copyStatus.textContent = 'Workfile copied.';
    } catch (error) { copyStatus.textContent = 'Copy was not available in this browser. Use Download Markdown instead.'; }
  });
  document.getElementById('download-result').addEventListener('click', function () {
    if (!currentMarkdown) return;
    const safeName = (value('businessName').trim() || 'customer-flow').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'customer-flow';
    const blob = new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeName}-customer-flow-health.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
  document.getElementById('print-result').addEventListener('click', function () { window.print(); });
})();