(() => {
  'use strict';

  const STORAGE_KEY = 'oobcreative-audience-review-v1';
  const FIELD_NAMES = [
    'offer', 'website', 'offer_type', 'audience_values', 'audience_trigger',
    'audience_emotions', 'audience_needs', 'audience_hesitation',
    'audience_outcome', 'business_values', 'business_message'
  ];
  const REQUIRED_BY_STEP = {
    1: ['offer', 'offer_type'],
    2: ['audience_values', 'audience_trigger', 'audience_emotions', 'audience_needs', 'audience_hesitation', 'audience_outcome'],
    3: ['business_values']
  };
  const ERROR_COPY = {
    offer: 'Describe the product, service, or professional role you want to review.',
    offer_type: 'Choose the description that is closest to your work.',
    audience_values: 'Choose what matters most to the people you serve.',
    audience_trigger: 'Choose what usually starts their search.',
    audience_emotions: 'Choose the feeling that seems closest.',
    audience_needs: 'Choose what helps them decide.',
    audience_hesitation: 'Choose what most often creates hesitation.',
    audience_outcome: 'Choose what they hope to feel afterward.',
    business_values: 'Choose at least one standard people can count on.'
  };

  const SENTENCES = {
    audience_values: {
      clarity: 'They value understanding the choice before they commit.',
      confidence: 'They want to feel confident that they are choosing well.',
      quality: 'They care about work that holds up after the purchase.',
      time: 'They want to avoid wasted time and unnecessary effort.',
      'not-sure': 'You have not seen one consistent value yet, so your message should stay curious and specific.'
    },
    audience_trigger: {
      'current-way-failing': 'The search often begins when the current way stops working.',
      'urgent-problem': 'The search often begins when a problem becomes too urgent to ignore.',
      evaluating: 'The search often begins when people start comparing credible options.',
      'growth-change': 'The search often begins when growth or change creates a new need.',
      'not-sure': 'The starting moment is not clear yet, so real customer language is the next useful evidence.'
    },
    audience_emotions: {
      overwhelmed: 'They may feel overwhelmed by details and competing choices.',
      cautious: 'They may feel cautious because a wrong choice could be costly or disruptive.',
      frustrated: 'They may feel frustrated that the problem still demands attention.',
      hopeful: 'They may feel hopeful that a better way is finally possible.',
      'not-sure': 'Their emotional state varies, so the message should avoid assuming too much.'
    },
    audience_needs: {
      'clear-next-step': 'A clear, manageable next step makes the decision easier.',
      proof: 'Relevant evidence helps them believe the work can deliver.',
      'simple-process': 'A process they can understand reduces uncertainty.',
      'human-guidance': 'A real person who listens makes the decision feel safer.',
      'not-sure': 'The strongest decision aid is not clear yet, so test one reassurance at a time.'
    },
    audience_hesitation: {
      'price-value': 'They may hesitate when the relationship between price and value is unclear.',
      trust: 'They may hesitate until they have a credible reason to trust the provider.',
      'time-effort': 'They may hesitate when the work sounds disruptive or demanding.',
      fit: 'They may hesitate when they cannot tell whether the offer fits their situation.',
      'not-sure': 'You have not heard one consistent objection, so invite questions instead of guessing.'
    },
    audience_outcome: {
      relief: 'They want to feel relief because the problem is being handled.',
      confidence: 'They want to feel confident about the path forward.',
      progress: 'They want to see momentum and meaningful progress.',
      control: 'They want more control and fewer surprises.',
      'not-sure': 'The desired result depends on the person, so describe concrete changes rather than one universal promise.'
    }
  };
  const STANDARD_SENTENCES = {
    honesty: 'Name tradeoffs plainly instead of hiding them.',
    quality: 'Show the standard your work must meet and how people will recognize it.',
    clarity: 'Explain what happens next, who is responsible, and what a good result looks like.',
    care: 'Show how decisions account for the person affected by the work.',
    practicality: 'Turn expertise into a next step people can use.',
    'not-sure': 'Keep the promise modest while you name and test the standards that matter most.'
  };
  const TRIGGER_DRAFTS = {
    'current-way-failing': 'When the current way stops working, the next choice should create clarity—not more uncertainty.',
    'urgent-problem': 'When a problem becomes urgent, people need a calm path forward and honest expectations.',
    evaluating: 'When several choices look similar, clear standards make a better decision possible.',
    'growth-change': 'When growth creates a new need, the right next step should support progress without adding avoidable strain.',
    'not-sure': 'Every customer arrives with a different situation, so the first step is a clear conversation about what matters now.'
  };
  const NEED_DRAFTS = {
    'clear-next-step': 'Start with one manageable next step and explain what follows.',
    proof: 'Use a relevant example, demonstration, or standard instead of a broad claim.',
    'simple-process': 'Show the process in plain language before asking for commitment.',
    'human-guidance': 'Make it easy to reach a real person who will listen before recommending a path.',
    'not-sure': 'Offer one useful next step, then listen for the question that still feels unresolved.'
  };
  const HESITATION_DRAFTS = {
    'price-value': 'Connect price to the problem addressed, the work included, and the change the customer can evaluate.',
    trust: 'Make trust visible through specific standards, boundaries, and evidence.',
    'time-effort': 'Explain the time, effort, and disruption required before the customer commits.',
    fit: 'Say who the offer helps, when it does not fit, and how to check before buying.',
    'not-sure': 'Invite the customer to name what would make the decision feel safer.'
  };

  const form = document.getElementById('audience-form');
  if (!form) return;

  const shell = document.getElementById('tool-shell');
  const resultsView = document.getElementById('results-view');
  const report = document.getElementById('results-report');
  const resultsTitle = document.getElementById('results-title');
  const validationSummary = document.getElementById('validation-summary');
  const draftStatus = document.getElementById('draft-status');
  const resultsStatus = document.getElementById('results-status');
  const steps = [...form.querySelectorAll('[data-step]')];
  let currentStep = 1;
  let saveTimer = null;
  let lastReview = null;

  const escapeHTML = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const checkedValue = name => form.querySelector(`[name="${name}"]:checked`)?.value || '';
  const checkedValues = name => [...form.querySelectorAll(`[name="${name}"]:checked`)].map(input => input.value);

  function formState() {
    return {
      offer: form.elements.offer.value.trim(),
      website: form.elements.website.value.trim(),
      offer_type: checkedValue('offer_type'),
      audience_values: checkedValue('audience_values'),
      audience_trigger: checkedValue('audience_trigger'),
      audience_emotions: checkedValue('audience_emotions'),
      audience_needs: checkedValue('audience_needs'),
      audience_hesitation: checkedValue('audience_hesitation'),
      audience_outcome: checkedValue('audience_outcome'),
      business_values: checkedValues('business_values'),
      business_message: checkedValue('business_message')
    };
  }

  function hasValue(name) {
    if (name === 'offer') return Boolean(form.elements.offer.value.trim());
    if (name === 'business_values') return checkedValues(name).length > 0;
    return Boolean(checkedValue(name));
  }

  function fieldFor(name) {
    return form.querySelector(`[data-field="${name}"]`);
  }

  function errorFor(name) {
    const safeName = name.replaceAll('_', '-');
    return document.getElementById(`${safeName}-error`);
  }

  function clearError(name) {
    const field = fieldFor(name);
    const error = errorFor(name);
    if (!field || !error) return;
    field.removeAttribute('aria-invalid');
    const textInput = field.querySelector('.text-input');
    if (textInput) textInput.removeAttribute('aria-invalid');
    error.hidden = true;
    error.textContent = '';
  }

  function showError(name) {
    const field = fieldFor(name);
    const error = errorFor(name);
    if (!field || !error) return;
    field.setAttribute('aria-invalid', 'true');
    const textInput = field.querySelector('.text-input');
    if (textInput) textInput.setAttribute('aria-invalid', 'true');
    error.textContent = ERROR_COPY[name];
    error.hidden = false;
  }

  function clearValidation() {
    Object.keys(ERROR_COPY).forEach(clearError);
    validationSummary.hidden = true;
    validationSummary.textContent = '';
  }

  function validateStep(stepNumber) {
    clearValidation();
    const missing = REQUIRED_BY_STEP[stepNumber].filter(name => !hasValue(name));
    if (!missing.length) return true;
    missing.forEach(showError);
    const count = missing.length;
    validationSummary.textContent = count === 1
      ? 'One answer is still needed. Start with the question marked below.'
      : `${count} answers are still needed. Start with the first question marked below.`;
    validationSummary.hidden = false;
    validationSummary.focus({ preventScroll: true });
    validationSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }

  function showStep(stepNumber, focus = true) {
    currentStep = stepNumber;
    clearValidation();
    steps.forEach(step => { step.hidden = Number(step.dataset.step) !== stepNumber; });
    document.querySelectorAll('[data-progress]').forEach(item => {
      const number = Number(item.dataset.progress);
      item.classList.toggle('is-current', number === stepNumber);
      item.classList.toggle('is-complete', number < stepNumber);
      if (number === stepNumber) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    const heading = document.getElementById(`step-${stepNumber}-title`);
    if (focus) {
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function updateBusinessValueLimit(changedInput = null) {
    const values = [...form.querySelectorAll('[name="business_values"]')];
    let selected = values.filter(input => input.checked);
    if (selected.length > 3 && changedInput) {
      changedInput.checked = false;
      selected = values.filter(input => input.checked);
      draftStatus.textContent = 'Choose up to three working standards.';
    }
    document.getElementById('business-values-count').textContent = `${selected.length} of 3 selected`;
    values.forEach(input => {
      input.disabled = !input.checked && selected.length >= 3;
    });
  }

  function saveDraft() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...formState(), step: currentStep }));
      draftStatus.textContent = 'Draft saved on this device.';
    } catch (_) {
      draftStatus.textContent = 'Draft saving is unavailable. You can still finish this review now.';
    }
  }

  function queueSave() {
    window.clearTimeout(saveTimer);
    draftStatus.textContent = 'Saving draft…';
    saveTimer = window.setTimeout(saveDraft, 250);
  }

  function restoreDraft() {
    let saved;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (_) { saved = null; }
    if (!saved || typeof saved !== 'object') return;
    ['offer', 'website'].forEach(name => {
      if (typeof saved[name] === 'string') form.elements[name].value = saved[name];
    });
    FIELD_NAMES.filter(name => !['offer', 'website', 'business_values'].includes(name)).forEach(name => {
      const value = saved[name];
      if (!value) return;
      const input = [...form.querySelectorAll(`[name="${name}"]`)].find(candidate => candidate.value === value);
      if (input) input.checked = true;
    });
    const values = Array.isArray(saved.business_values) ? saved.business_values.slice(0, 3) : [];
    form.querySelectorAll('[name="business_values"]').forEach(input => { input.checked = values.includes(input.value); });
    updateBusinessValueLimit();
    draftStatus.textContent = 'Saved answers restored from this device.';
  }

  function payloadFromState(state) {
    return {
      schemaVersion: '4.0',
      reviewType: 'audience_review',
      offer: { name: state.offer, type: state.offer_type || null, website: state.website || null },
      audienceEvidence: {
        values: state.audience_values ? [state.audience_values] : [],
        triggerContext: state.audience_trigger ? [state.audience_trigger] : [],
        emotionalState: state.audience_emotions ? [state.audience_emotions] : [],
        decisionNeeds: state.audience_needs ? [state.audience_needs] : [],
        resistanceSignals: state.audience_hesitation ? [state.audience_hesitation] : [],
        desiredMovement: state.audience_outcome ? [state.audience_outcome] : []
      },
      businessEvidence: {
        providerValues: state.business_values || [],
        intendedMessage: state.business_message ? [state.business_message] : []
      }
    };
  }

  function buildReview(state) {
    const offer = state.offer.trim();
    const snapshot = [
      SENTENCES.audience_trigger[state.audience_trigger],
      SENTENCES.audience_emotions[state.audience_emotions],
      SENTENCES.audience_values[state.audience_values],
      SENTENCES.audience_outcome[state.audience_outcome]
    ];
    const standards = (state.business_values || []).map(value => STANDARD_SENTENCES[value]).filter(Boolean);
    const recommendations = [
      `Lead with the moment people recognize. ${SENTENCES.audience_trigger[state.audience_trigger]}`,
      `Make the decision easier. ${SENTENCES.audience_needs[state.audience_needs]} ${HESITATION_DRAFTS[state.audience_hesitation]}`,
      `Make your standards visible. ${standards.join(' ')}`
    ];
    const tone = {
      direct: 'Keep the language direct, specific, and free of inflated promises.',
      reassuring: 'Use a calm voice that names the concern before offering reassurance.',
      educational: 'Teach one useful idea before asking the reader to act.',
      'not-sure': 'Use plain language and let real customer responses shape the tone.'
    }[state.business_message] || 'Use plain language that sounds natural when spoken aloud.';
    const websiteDraft = `${offer}\n\n${TRIGGER_DRAFTS[state.audience_trigger]}\n\nWe explain what happens next, what the work includes, and how to decide whether it fits. ${standards[0] || NEED_DRAFTS[state.audience_needs]}`;
    const socialDraft = `${TRIGGER_DRAFTS[state.audience_trigger]}\n\n${NEED_DRAFTS[state.audience_needs]} ${HESITATION_DRAFTS[state.audience_hesitation]}\n\nThat is the standard we bring to ${offer}.`;
    const conversationDraft = `You do not need to have the perfect answer before we talk. Tell us what is happening, what you have already tried, and what you need to protect. We will help you understand the next useful step—and tell you plainly if ${offer} is not the right fit.`;
    return {
      offer,
      snapshot,
      recommendations,
      tone,
      drafts: [
        { title: 'Website introduction', text: websiteDraft },
        { title: 'Social post', text: socialDraft },
        { title: 'Conversation invitation', text: conversationDraft }
      ],
      payload: payloadFromState(state)
    };
  }

  function reviewText(review) {
    const lines = [
      `Audience Review: ${review.offer}`,
      '',
      'What the customer may be working through',
      ...review.snapshot.map(sentence => `- ${sentence}`),
      '',
      'Message priorities',
      ...review.recommendations.map((sentence, index) => `${index + 1}. ${sentence}`),
      '',
      'Tone',
      review.tone,
      '',
      'Ready-to-use drafts'
    ];
    review.drafts.forEach(draft => lines.push('', draft.title, draft.text));
    lines.push('', 'Use this as a working message. Test it in real conversations and revise what you learn.');
    return lines.join('\n');
  }

  function reviewMarkdown(review) {
    const lines = [
      `# Audience Review: ${review.offer}`,
      '',
      '## What the customer may be working through',
      ...review.snapshot.map(sentence => `- ${sentence}`),
      '',
      '## Message priorities',
      ...review.recommendations.map((sentence, index) => `${index + 1}. ${sentence}`),
      '',
      '## Tone',
      review.tone,
      '',
      '## Ready-to-use drafts'
    ];
    review.drafts.forEach(draft => lines.push('', `### ${draft.title}`, '', draft.text));
    lines.push('', '---', '', 'Use this as a working message. Test it in real conversations and revise what you learn.');
    return lines.join('\n');
  }

  function renderReview(review) {
    report.innerHTML = `
      <section class="report-section">
        <h3>What the customer may be working through</h3>
        ${review.snapshot.map(sentence => `<p>${escapeHTML(sentence)}</p>`).join('')}
      </section>
      <section class="report-section">
        <h3>Your message priorities</h3>
        <ol>${review.recommendations.map(sentence => `<li>${escapeHTML(sentence)}</li>`).join('')}</ol>
        <p><strong>Tone:</strong> ${escapeHTML(review.tone)}</p>
      </section>
      <section class="report-section">
        <h3>Ready-to-use drafts</h3>
        <p>Adapt these to sound like you. Specific examples from your real work will make them stronger.</p>
        ${review.drafts.map((draft, index) => `
          <div class="draft-card">
            <h4>${escapeHTML(draft.title)}</h4>
            <p>${escapeHTML(draft.text)}</p>
            <button class="button secondary" type="button" data-copy-draft="${index}">Copy ${escapeHTML(draft.title.toLowerCase())}</button>
          </div>`).join('')}
      </section>`;
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      resultsStatus.textContent = successMessage;
    } catch (_) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      resultsStatus.textContent = copied ? successMessage : 'Copy is unavailable. Select the text in the report to copy it manually.';
    }
  }

  function downloadReview(review) {
    const markdown = reviewMarkdown(review);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const slug = review.offer.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'audience-review';
    anchor.href = url;
    anchor.download = `${slug}-audience-review.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    resultsStatus.textContent = 'Markdown review downloaded.';
  }

  form.addEventListener('click', event => {
    const next = event.target.closest('[data-next]');
    const back = event.target.closest('[data-back]');
    if (next) {
      if (validateStep(currentStep)) showStep(Number(next.dataset.next));
      return;
    }
    if (back) showStep(Number(back.dataset.back));
  });

  form.addEventListener('input', event => {
    const name = event.target.name;
    if (name && hasValue(name)) clearError(name);
    if (name === 'business_values') updateBusinessValueLimit(event.target);
    queueSave();
  });

  form.addEventListener('change', event => {
    const name = event.target.name;
    if (name && hasValue(name)) clearError(name);
    if (name === 'business_values') updateBusinessValueLimit(event.target);
    queueSave();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateStep(3)) return;
    const state = formState();
    lastReview = buildReview(state);
    renderReview(lastReview);
    saveDraft();
    shell.hidden = true;
    resultsView.hidden = false;
    resultsTitle.textContent = `${lastReview.offer}: a clearer path to the customer decision`;
    resultsTitle.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('clear-draft').addEventListener('click', () => {
    form.reset();
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    updateBusinessValueLimit();
    showStep(1, false);
    draftStatus.textContent = 'Saved answers cleared from this device.';
    form.elements.offer.focus();
  });

  document.getElementById('edit-review').addEventListener('click', () => {
    resultsView.hidden = true;
    shell.hidden = false;
    resultsStatus.textContent = '';
    showStep(3);
  });

  document.getElementById('copy-review').addEventListener('click', () => {
    if (lastReview) copyText(reviewText(lastReview), 'Full review copied.');
  });
  document.getElementById('download-review').addEventListener('click', () => {
    if (lastReview) downloadReview(lastReview);
  });
  document.getElementById('print-review').addEventListener('click', () => window.print());
  report.addEventListener('click', event => {
    const button = event.target.closest('[data-copy-draft]');
    if (!button || !lastReview) return;
    const draft = lastReview.drafts[Number(button.dataset.copyDraft)];
    if (draft) copyText(draft.text, `${draft.title} copied.`);
  });

  restoreDraft();
  updateBusinessValueLimit();
  showStep(1, false);

  window.AudienceReview = { buildReview, reviewText, reviewMarkdown, payloadFromState };
})();
