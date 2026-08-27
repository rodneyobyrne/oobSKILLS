(function () {
  'use strict';

  const form = document.getElementById('customer-flow-review');
  if (!form) return;

  const storageKey = 'oob-customer-flow-review-v3';
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
  const slowPeriodWrap = document.getElementById('slow-period-wrap');
  const slowPeriodField = document.getElementById('slow-period');
  const reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  let currentStep = 1;
  let currentMarkdown = '';
  let currentShareText = '';

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

  function updateSlowPeriod() {
    const timing = value('changeTiming');
    const needed = timing === 'slower' || timing === 'beforeBusy';
    if (slowPeriodWrap) slowPeriodWrap.hidden = !needed;
    if (slowPeriodField) slowPeriodField.required = needed;
    if (!needed && slowPeriodField) slowPeriodField.removeAttribute('aria-invalid');
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
    updateSlowPeriod();
    for (const field of steps[currentStep - 1].querySelectorAll('[required]')) {
      if (field.closest('[hidden]')) continue;
      if (!field.checkValidity()) return markInvalid(field, `Complete “${fieldName(field)}” before continuing.`);
      field.removeAttribute('aria-invalid');
    }
    if (currentStep === 1 && !values('contactChannels').length) return markGroupInvalid('contactChannels', 'Choose at least one way customers can contact the business.');
    if (currentStep === 2 && !values('infoPlaces').length) return markGroupInvalid('infoPlaces', 'Choose at least one place where customer information is found.');
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
        copy: value('taskCopy'),
        reenter: value('taskReenter'),
        check: value('taskCheck'),
        remind: value('taskRemind'),
        tell: value('taskTell'),
        handled: value('taskHandled')
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
      ['Communication', evaluation.statuses.communication, 'Are important customer contacts being captured and answered?'],
      ['Information', evaluation.statuses.information, 'Can the person helping the customer find the context they need?'],
      ['Workflow', evaluation.statuses.workflow, 'Does information lead to the next action without repeated manual handoffs?'],
      ['Capacity', evaluation.statuses.capacity, 'How much human attention is being spent bridging gaps?'],
      ['Change Pressure', evaluation.statuses.changePressure, 'How much does the current pattern matter as the business changes?']
    ];
  }

  function toolCards(tools) {
    return tools.map((tool) => `<article class="tool-card"><h4>${escapeHtml(tool.title)}</h4><p><strong>Useful when:</strong> ${escapeHtml(tool.usefulWhen)}</p><p><strong>Before buying:</strong> ${escapeHtml(tool.beforeBuying)}</p></article>`).join('');
  }

  function statusCard(name, statusLabel, description) {
    return `<article class="health-card"><div class="health-card__heading"><h4>${escapeHtml(name)}</h4><strong>${escapeHtml(statusLabel)}</strong></div><div class="health-state" aria-label="${escapeHtml(name)}: ${escapeHtml(statusLabel)}"><span>${escapeHtml(statusLabel)}</span></div><p>${escapeHtml(description)}</p></article>`;
  }

  function buildMarkdown(data, evaluation, createdDate) {
    const title = data.businessName ? `${data.businessName} Customer Flow Health` : 'Customer Flow Health';
    const dimensions = dimensionRows(evaluation).map(([name, statusLabel, description]) => `- **${name} — ${statusLabel}:** ${description}`).join('\n');
    const working = evaluation.workingSignals.map((item) => `- ${item}`).join('\n');
    const signals = evaluation.recognitionSignals.map((item) => `- ${item}`).join('\n');
    const visibility = evaluation.visibility.signals.length ? evaluation.visibility.signals.map((item) => `- ${item}`).join('\n') : '- Your answers provide enough visibility to interpret the main patterns without treating uncertainty as evidence of a problem.';
    const focus = evaluation.focusAreas.map((item, index) => `${index + 1}. ${item}`).join('\n');
    const tools = evaluation.usefulTools.map((tool) => `### ${tool.title}\n\n**Useful when:** ${tool.usefulWhen}\n\n**Before buying:** ${tool.beforeBuying}`).join('\n\n');
    const before = evaluation.beforeBuying.map((item) => `- ${item}`).join('\n');
    const timing = data.slowPeriod ? ` You identified ${labels.slowPeriod[data.slowPeriod]} as a practical window for operational changes.` : '';

    return `# ${title}\n\nCreated ${createdDate} with the free oobCREATIVE Customer Flow Health Review.\n\n## Your short answer\n\n**${evaluation.stageName}**\n\n${evaluation.summary}\n\n## Your next decision\n\n**${evaluation.action}**\n\n${evaluation.decision}\n\n## What appears to be working\n\n${working}\n\n## Customer Flow Health\n\n${dimensions}\n\nThese are directional signals based on your answers, not industry benchmarks or performance scores.\n\n## Where friction is showing up\n\n${signals}\n\n## Visibility note — ${evaluation.visibility.level}\n\n${visibility}\n\n## Invisible work estimate\n\nYou estimated ${labels.adminTime[data.adminTime]} each week is spent on small administrative handoffs. This is your estimate, not a measured savings claim.\n\n## What to look at first\n\n${focus}\n\n## Your current tools\n\n${evaluation.toolContext}\n\n${data.productNames ? `Tools you named: ${data.productNames}\n\n` : ''}## Useful tools to consider\n\nA little out-of-box thinking can help here. Sometimes the useful answer is an existing feature, a workflow automation or an AI product that carries repetitive support work. The goal is welcome relief for the team—not another tool to babysit.\n\nTreat these as options, not a checklist. More software is not more progress. Start with one problem, check what you already have, and add something new only when it clearly earns its place.\n\n${tools}\n\n## Before you buy anything\n\n${before}\n\n## Practical timing\n\nYou said the business could realistically address this ${labels.changeTiming[data.changeTiming]}.${timing}\n\n## Optional human review\n\nIf you want another set of eyes on the result, you can choose to share it with oobCREATIVE. A human can help you make sense of what is showing up and identify useful next steps. Sharing does not commit you to software, services or a project.\n\n## Important boundary\n\nThis review identifies patterns and places worth examining. It does not diagnose a business, guarantee savings or assume that new software or AI is the answer. Your assessment answers are processed in this browser and are not automatically sent to oobCREATIVE.\n`;
  }

  function buildShareText(data, evaluation) {
    const name = data.businessName || 'My business';
    const focus = evaluation.focusAreas.map((item) => `- ${item}`).join('\n');
    return `${name} — Customer Flow Health Review\n\nStage: ${evaluation.stageName}\nNext decision: ${evaluation.action}\n\n${evaluation.decision}\n\nPlaces I want help reviewing:\n${focus}\n\nI chose to share this summary from the oobCREATIVE Customer Flow Health Review. The assessment itself was processed in my browser.`;
  }

  function renderResult(data, evaluation) {
    const createdDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
    resultTitle.textContent = data.businessName ? `${data.businessName}: what your customer flow is showing` : 'What your customer flow is showing';
    resultDate.textContent = createdDate;

    const dimensions = dimensionRows(evaluation).map((row) => statusCard(...row)).join('');
    const working = `<ul>${evaluation.workingSignals.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    const signals = `<ul>${evaluation.recognitionSignals.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    const focus = `<ol>${evaluation.focusAreas.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`;
    const visibility = evaluation.visibility.signals.length
      ? `<ul>${evaluation.visibility.signals.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : '<p>Your answers provide enough visibility to interpret the main patterns without treating uncertainty as evidence of a problem.</p>';
    const before = `<ul>${evaluation.beforeBuying.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    const timing = data.slowPeriod ? ` You identified ${escapeHtml(labels.slowPeriod[data.slowPeriod])} as a practical window for operational changes.` : '';

    resultContent.innerHTML = `
      <section class="result-verdict answer-first-result"><p class="meta">Your short answer</p><h3>${escapeHtml(evaluation.stageName)}</h3><p>${escapeHtml(evaluation.summary)}</p></section>
      <section class="next-decision"><p class="meta">Your next decision</p><h3>${escapeHtml(evaluation.action)}</h3><p>${escapeHtml(evaluation.decision)}</p></section>
      <section class="result-callout working-block"><p class="meta">Start with what is true</p><h3>What appears to be working</h3>${working}</section>
      <section><h3>Customer Flow Health</h3><p class="result-boundary">These are directional signals based on your answers, not industry benchmarks or performance scores.</p><div class="health-grid">${dimensions}</div></section>
      <section class="result-callout recognition-block"><p class="meta">Self-recognition</p><h3>Where friction is showing up</h3>${signals}</section>
      <section class="visibility-block"><p class="meta">Visibility note</p><h3>${escapeHtml(evaluation.visibility.level)}</h3>${visibility}</section>
      <div class="result-grid"><article class="result-card"><p class="meta">Invisible work</p><h3>${escapeHtml(labels.adminTime[data.adminTime])} each week</h3><p>Your estimate for small administrative handoffs. This is not a savings claim; it is a place to look.</p></article><article class="result-card"><p class="meta">Growth check</p><h3>${escapeHtml(labels.paceMatch[data.paceMatch])}</h3><p>That is how you described whether customer-information management has changed at roughly the same pace as the business.</p></article></div>
      <section><h3>What to look at first</h3>${focus}</section>
      <section class="result-callout"><p class="meta">Your existing tools</p><p>${escapeHtml(evaluation.toolContext)}</p>${data.productNames ? `<p><strong>Tools you named:</strong> ${escapeHtml(data.productNames)}</p>` : ''}</section>
      <section class="tool-consideration"><p class="meta">Decision support, not a shopping list</p><h3>Useful tools to consider</h3><p class="tool-consideration__friendly"><strong>A little out-of-box thinking can help here.</strong> Sometimes the useful answer is an existing feature, a workflow automation or an AI product that carries repetitive support work. The goal is welcome relief for the team—not another tool to babysit.</p><p class="tool-consideration__restraint"><strong>Options, not a checklist.</strong> More software is not more progress. Start with one problem, check what you already have, and add something new only when it clearly earns its place.</p><div class="tool-grid">${toolCards(evaluation.usefulTools)}</div></section>
      <section class="before-buying"><h3>Before you buy anything</h3>${before}</section>
      <section class="result-callout"><p class="meta">Practical timing</p><p>You said the business could realistically address this ${escapeHtml(labels.changeTiming[data.changeTiming])}.${timing}</p></section>
      <aside class="result-next-step"><p class="meta">Optional human review</p><h3>Want a human to look at this with you?</h3><p>Share your results with oobCREATIVE and connect with a human who can help you make sense of what is showing up and identify useful next steps.</p><p class="review-privacy-note"><strong>You choose what to share.</strong> Sharing does not commit you to software, services or a project.</p><a class="button button--paper" id="share-result-link" href="#">Share My Results for Review</a></aside>`;

    currentMarkdown = buildMarkdown(data, evaluation, createdDate);
    currentShareText = buildShareText(data, evaluation);
    const shareLink = document.getElementById('share-result-link');
    if (shareLink) {
      const subject = data.businessName ? `${data.businessName} Customer Flow Review` : 'Customer Flow Review';
      shareLink.href = `mailto:hello@oobcreative.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(currentShareText)}`;
    }

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
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
    area.remove();
    return copied;
  }

  function clearStoredDraft() {
    try { sessionStorage.removeItem(storageKey); } catch (error) { /* no-op */ }
  }

  restoreDraft();
  updateSlowPeriod();
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
    if (target?.name === 'changeTiming') updateSlowPeriod();
    ['contactChannels', 'infoPlaces'].forEach((name) => { if (target?.name === name) clearGroupInvalid(name); });
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

  document.getElementById('clear-draft').addEventListener('click', function () { clearStoredDraft(); form.reset(); updateSlowPeriod(); result.hidden = true; currentMarkdown = ''; currentShareText = ''; showStep(1); status.textContent = 'Saved draft cleared.'; });
  document.getElementById('start-over').addEventListener('click', function () { clearStoredDraft(); form.reset(); updateSlowPeriod(); result.hidden = true; currentMarkdown = ''; currentShareText = ''; showStep(1); });
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