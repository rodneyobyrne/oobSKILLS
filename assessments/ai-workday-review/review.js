(function () {
  'use strict';

  const form = document.getElementById('workday-review');
  if (!form) return;

  const storageKey = 'oob-ai-workday-review-v1';
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
  let currentStep = 1;
  let currentMarkdown = '';

  const areaDetails = {
    communication: {
      label: 'Drafting or adapting communication',
      opportunity: 'Prepare a first draft from approved facts, examples and voice guidance; keep approval and relationship judgment human.'
    },
    intake: {
      label: 'Gathering requests or intake',
      opportunity: 'Collect a consistent first set of permitted details, mark missing information and route exceptions to a person.'
    },
    scheduling: {
      label: 'Scheduling or routing',
      opportunity: 'Apply approved availability and routing rules while escalating exceptions, urgency and promises to a named person.'
    },
    followup: {
      label: 'Requested follow-up or reminders',
      opportunity: 'Prepare or send permission-based follow-up from an approved event without creating unsolicited outreach.'
    },
    research: {
      label: 'Researching or comparing information',
      opportunity: 'Gather and compare approved sources, preserve links and mark uncertainty before a person draws a conclusion.'
    },
    reporting: {
      label: 'Summarizing or reporting',
      opportunity: 'Turn approved records into a structured first summary while preserving source references and human interpretation.'
    },
    knowledge: {
      label: 'Finding approved internal knowledge',
      opportunity: 'Retrieve and organize approved policies, examples or answers without inventing policy or treating memory as a source.'
    },
    records: {
      label: 'Organizing records or documents',
      opportunity: 'Classify, label or prepare permitted documents for review without making the decision the records support.'
    }
  };

  const measureLabels = {
    time: 'preparation time per completed item',
    missed: 'missed contacts or incomplete handoffs',
    rework: 'preventable corrections before approval',
    response: 'time to a responsible first response',
    consistency: 'items meeting the agreed first-draft standard'
  };

  const pressureLabels = {
    time: 'repeated time',
    missed: 'missed opportunities',
    rework: 'preventable rework',
    capacity: 'a one-person bottleneck'
  };

  const protectLabels = {
    quality: 'quality and judgment',
    trust: 'trust and responsibility',
    relationship: 'human relationships',
    agency: 'professional agency'
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function selected(name) {
    return Array.from(form.querySelectorAll(`[name="${name}"]:checked`)).map((input) => input.value);
  }

  function value(name) {
    const field = form.elements.namedItem(name);
    if (!field) return '';
    if (field instanceof RadioNodeList) return field.value;
    return field.value || '';
  }

  function serializeDraft() {
    const draft = {};
    new FormData(form).forEach((entry, key) => {
      if (draft[key]) draft[key] = [].concat(draft[key], entry);
      else draft[key] = entry;
    });
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
      if (!fields.length) return;
      const values = Array.isArray(saved) ? saved : [saved];
      fields.forEach((field) => {
        if (field.type === 'checkbox' || field.type === 'radio') field.checked = values.includes(field.value);
        else field.value = saved;
      });
    });
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
      steps[currentStep - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function validateStep() {
    const step = steps[currentStep - 1];
    const required = Array.from(step.querySelectorAll('[required]'));

    if (currentStep === 2 && selected('workArea').length === 0) {
      document.getElementById('work-area-error').hidden = false;
      status.textContent = 'Choose at least one recurring work area before continuing.';
      return false;
    }
    document.getElementById('work-area-error').hidden = true;

    for (const field of required) {
      if (!field.checkValidity()) {
        field.setAttribute('aria-invalid', 'true');
        field.reportValidity();
        status.textContent = 'Complete the marked question before continuing.';
        return false;
      }
      field.removeAttribute('aria-invalid');
    }
    return true;
  }

  function evaluate() {
    return window.OobWorkdayEngine.evaluate({
      frequency: value('frequency'),
      duration: value('duration'),
      judgment: value('judgment'),
      consequence: value('consequence'),
      sensitivity: value('sensitivity'),
      sources: value('sources'),
      reviewer: value('reviewer'),
      reversible: value('reversible'),
      capacity: value('capacity')
    });
  }

  function buildBriefs(data, evaluation) {
    const permitted = data.sensitivity === 'public'
      ? 'approved public or intentionally shareable sources'
      : 'only the approved internal sources named for this pilot';
    const prohibited = data.prohibited || 'personal, regulated, confidential or unverified information not explicitly approved for the pilot';
    const escalation = data.stopCondition;

    return [
      `BRIEF 1 - PREPARE\nSupport this bounded task: ${data.task}\nUse only ${permitted}. Do not use or infer ${prohibited}. Prepare a first result that follows this standard: ${data.goodOutput} Mark missing information and uncertainty instead of guessing. The final decision belongs to ${data.owner}.`,
      `BRIEF 2 - REVIEW\nReview the prepared result for source support, completeness, privacy, inappropriate inference and the agreed quality standard: ${data.goodOutput} List each issue separately. Do not silently rewrite a consequential claim. Escalate to ${data.owner} when the source is missing, the request falls outside scope or this condition appears: ${escalation}`,
      `BRIEF 3 - HANDOFF\nCreate a concise handoff for ${data.owner}. Include: what was requested, which approved sources were used, what remains uncertain, what changed during review and the specific decision still required from a person. Do not represent the work as approved until ${data.owner} approves it.`
    ];
  }

  function collectData() {
    return {
      organization: value('organization').trim(),
      role: value('role').trim(),
      pressure: value('pressure'),
      protect: value('protect'),
      areas: selected('workArea'),
      task: value('task').trim(),
      frequency: value('frequency'),
      duration: value('duration'),
      currentProcess: value('currentProcess').trim(),
      judgment: value('judgment'),
      consequence: value('consequence'),
      sensitivity: value('sensitivity'),
      sources: value('sources'),
      reviewer: value('reviewer'),
      reversible: value('reversible'),
      prohibited: value('prohibited').trim(),
      owner: value('owner').trim(),
      measure: value('measure'),
      capacity: value('capacity'),
      goodOutput: value('goodOutput').trim(),
      stopCondition: value('stopCondition').trim()
    };
  }

  function buildMarkdown(data, evaluation, briefs, date) {
    const title = data.organization ? `${data.organization} AI Workday WORKFILE` : 'AI Workday WORKFILE';
    const opportunities = data.areas.slice(0, 3).map((area, index) => `${index + 1}. **${areaDetails[area].label}:** ${areaDetails[area].opportunity}`).join('\n');
    const blockers = evaluation.blockers.length
      ? evaluation.blockers.map((item) => `- ${item}`).join('\n')
      : '- No immediate blocker was identified. Continue to test narrowly and review every result.';

    return `# ${title}\n\nCreated ${date} with the free oobCREATIVE AI Workday Review.\n\n## Readiness decision\n\n**${evaluation.verdict}**\n\n${evaluation.explanation}\n\n## What this work is protecting\n\n- Pressure to reduce: ${pressureLabels[data.pressure]}\n- Value to protect: ${protectLabels[data.protect]}\n- Responsible owner: ${data.owner}\n\n## Recurring responsibility\n\n${data.task}\n\n### Current process and friction\n\n${data.currentProcess}\n\n## Opportunity map\n\n${opportunities}\n\n## Conditions to resolve or watch\n\n${blockers}\n\n## 14-day pilot\n\n- **Bounded task:** ${data.task}\n- **Human responsibility:** ${data.owner} reviews and approves every result before use.\n- **Permitted inputs:** Only explicitly approved sources appropriate to the selected information sensitivity.\n- **Prohibited inputs or situations:** ${data.prohibited || 'Personal, regulated, confidential or unverified information not explicitly approved for the pilot.'}\n- **Quality standard:** ${data.goodOutput}\n- **Measure:** Compare ${measureLabels[data.measure]} with the current process.\n- **Stopping condition:** ${data.stopCondition}\n- **End decision:** Keep, revise, stop or choose a different problem.\n\n## Reusable working briefs\n\n${briefs.map((brief) => `### ${brief.split('\n')[0]}\n\n${brief.split('\n').slice(1).join('\n')}`).join('\n\n')}\n\n## Important boundary\n\nThis result is operational guidance, not legal, cybersecurity, compliance, medical, financial or other professional advice. Do not use a general AI system with data your organization has not approved for that system.\n`;
  }

  function renderResult(data, evaluation) {
    const date = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
    const briefs = buildBriefs(data, evaluation);
    const title = data.organization ? `${data.organization}: one useful place to begin` : 'One useful place to begin';
    const opportunities = data.areas.slice(0, 3).map((area) => `<li><strong>${escapeHtml(areaDetails[area].label)}</strong><span>${escapeHtml(areaDetails[area].opportunity)}</span></li>`).join('');
    const blockers = evaluation.blockers.length
      ? `<ul>${evaluation.blockers.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : '<p>No immediate blocker was identified. Continue to test narrowly and review every result.</p>';
    const optionalNextStep = evaluation.verdict === 'Pilot now - narrowly'
      ? '<aside class="result-next-step"><p class="meta">Optional human support</p><h3>Keep the pilot bounded. Add help only if implementation gets stuck.</h3><p>This workfile is complete enough to use on its own. If the test reveals a defined workflow, review or adoption problem, oobCREATIVE can help implement that specific next step.</p><a class="button button--paper" href="/services/responsible-ai-implementation/">See responsible implementation support</a></aside>'
      : '<aside class="result-next-step"><p class="meta">Optional human support</p><h3>Resolve the boundary before adding another AI tool.</h3><p>You can use this workfile independently. If ownership, source quality, review capacity or consequence involves several people, a bounded implementation review can help the team make the decision together.</p><a class="button button--paper" href="/services/responsible-ai-implementation/">See responsible implementation support</a></aside>';

    resultTitle.textContent = title;
    resultDate.textContent = date;
    resultContent.innerHTML = `
      <div class="result-verdict"><p class="meta">Readiness decision</p><h3>${escapeHtml(evaluation.verdict)}</h3><p>${escapeHtml(evaluation.explanation)}</p></div>
      <div class="result-grid">
        <article class="result-card"><p class="meta">Pressure to reduce</p><h3>${escapeHtml(pressureLabels[data.pressure])}</h3><p>${escapeHtml(data.currentProcess)}</p></article>
        <article class="result-card"><p class="meta">Value to protect</p><h3>${escapeHtml(protectLabels[data.protect])}</h3><p>${escapeHtml(data.owner)} remains responsible for the final result.</p></article>
      </div>
      <h3>Your opportunity map</h3><ul class="result-map">${opportunities}</ul>
      <h3>Conditions to resolve or watch</h3>${blockers}
      <h3>Your 14-day pilot</h3>
      <ul><li><strong>Bounded task:</strong> ${escapeHtml(data.task)}</li><li><strong>Human responsibility:</strong> ${escapeHtml(data.owner)} reviews and approves every result before use.</li><li><strong>Quality standard:</strong> ${escapeHtml(data.goodOutput)}</li><li><strong>Measure:</strong> Compare ${escapeHtml(measureLabels[data.measure])} with the current process.</li><li><strong>Stopping condition:</strong> ${escapeHtml(data.stopCondition)}</li><li><strong>End decision:</strong> Keep, revise, stop or choose a different problem.</li></ul>
      <h3>Three reusable working briefs</h3>
      ${briefs.map((brief) => `<pre class="working-brief">${escapeHtml(brief)}</pre>`).join('')}
      <div class="content-note"><strong>Important boundary:</strong> This result is operational guidance, not legal, cybersecurity, compliance or professional advice. Do not use a general AI system with data your organization has not approved for that system.</div>
      ${optionalNextStep}`;

    currentMarkdown = buildMarkdown(data, evaluation, briefs, date);
    result.hidden = false;
    result.focus();
  }

  nextButton.addEventListener('click', () => {
    if (!validateStep()) return;
    saveDraft();
    showStep(Math.min(steps.length, currentStep + 1));
  });

  backButton.addEventListener('click', () => showStep(Math.max(1, currentStep - 1)));

  form.addEventListener('input', (event) => {
    event.target.removeAttribute('aria-invalid');
    status.textContent = '';
    if (event.target.name === 'workArea') {
      const areas = selected('workArea');
      if (areas.length > 5) {
        event.target.checked = false;
        status.textContent = 'Choose no more than five work areas.';
      }
      document.getElementById('work-area-error').hidden = selected('workArea').length > 0;
    }
    saveDraft();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateStep()) return;
    const data = collectData();
    renderResult(data, evaluate());
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
    const organization = value('organization').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    anchor.href = url;
    anchor.download = `${organization ? `${organization}-` : ''}ai-workday-workfile.md`;
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

  restoreDraft();
  showStep(1, false);
})();
