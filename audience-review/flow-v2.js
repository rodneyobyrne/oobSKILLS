(() => {
  const MOTION_MS = 620;
  const step1 = document.querySelector('.step[data-step="1"]');
  const originalStep2 = document.querySelector('.step[data-step="2"]');
  const originalResultStep = document.querySelector('.step[data-step="3"]');
  const form = document.getElementById('audience-form');
  const page = document.querySelector('.page');
  const oldProgress = document.querySelector('.progress');

  if (!step1 || !originalStep2 || !originalResultStep || !form || !page) return;

  document.querySelector('.rule')?.classList.replace('rule', 'rough-rule');

  const resultsCard = originalResultStep.querySelector('#results');
  originalResultStep.remove();

  // Build the three-step sequence around the real questionnaire:
  // 1) audience evidence, 2) offer + decision context, 3) provider/work evidence.
  originalStep2.dataset.step = '3';
  originalStep2.classList.remove('active');
  originalStep2.querySelector('.eyebrow').textContent = 'Part 3';
  originalStep2.querySelector('.section-heading h2').textContent = 'Tell us about your work.';
  originalStep2.querySelector('.section-heading p').innerHTML = '<span id="step3-bridge">Now tell us what matters in how you do the work. We’ll use that alongside what you’ve already shared about your audience and their decision.</span>';

  const step3Back = originalStep2.querySelector('[data-back]');
  if (step3Back) step3Back.dataset.back = '2';

  const oldStep2Error = originalStep2.querySelector('#step2-error');
  if (oldStep2Error) oldStep2Error.id = 'step3-error';

  const submitButton = originalStep2.querySelector('#submit-review') || originalStep2.querySelector('button[type="submit"]');
  if (submitButton) submitButton.textContent = 'Review My Audience';

  const step2 = document.createElement('section');
  step2.className = 'step';
  step2.dataset.step = '2';
  step2.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Part 2</p>
      <h2>Tell us about your offer.</h2>
      <p id="step2-bridge">
        You’ve already shared useful signals about the people you serve. Now tell us what you offer and what shapes their decision.
      </p>
    </div>
    <div id="offer-step-slot"></div>
    <div id="audience-decision-questions"></div>
    <div class="error" id="step2-error">Please complete each question before continuing.</div>
    <div class="actions">
      <button class="button secondary" type="button" data-back="1">Back</button>
      <button class="button" type="button" data-next="3">Next: Your Work</button>
    </div>
  `;

  form.insertBefore(step2, originalStep2);

  // Move offer fields out of Step 1 so the experience begins with the audience.
  const offerInput = document.getElementById('offer');
  const offerField = offerInput?.closest('.field');
  const offerType = document.getElementById('offer-type-question');
  const offerSlot = step2.querySelector('#offer-step-slot');
  if (offerField) offerSlot.appendChild(offerField);
  if (offerType) offerSlot.appendChild(offerType);

  // Keep the first two audience questions on Step 1 and move the deeper
  // decision questions into Step 2.
  const audienceQuestions = [...document.querySelectorAll('#audience-questions .question')];
  const decisionContainer = step2.querySelector('#audience-decision-questions');
  audienceQuestions.slice(2).forEach(question => decisionContainer.appendChild(question));

  const step1Next = step1.querySelector('[data-next]');
  if (step1Next) step1Next.textContent = 'Next: Your Offer';

  // Replace the simple bars with a sticky visual progress navigator.
  const progress = oldProgress || document.createElement('div');
  progress.className = 'review-progress';
  progress.setAttribute('aria-label', 'Audience Review progress');
  progress.innerHTML = `
    <div class="progress-step" data-progress-step="1">
      <img class="progress-icon progress-icon-step1" src="../branding/oob-NO_LIDcrop.png" alt="">
      <div class="progress-copy"><span>Step 1</span><strong>Audience</strong></div>
    </div>
    <div class="progress-connector" aria-hidden="true"></div>
    <div class="progress-step" data-progress-step="2">
      <img class="progress-icon progress-icon-step2" src="../branding/Mark-black.svg" alt="">
      <div class="progress-copy"><span>Step 2</span><strong>Your offer</strong></div>
    </div>
    <div class="progress-connector" aria-hidden="true"></div>
    <div class="progress-step" data-progress-step="3">
      <img class="progress-icon progress-icon-step3" src="../branding/oob-BOX.png" alt="">
      <div class="progress-copy"><span>Step 3</span><strong>Your work</strong></div>
    </div>
  `;
  form.prepend(progress);

  const steps = [...form.querySelectorAll('.step')];
  const stage = document.createElement('div');
  stage.id = 'form-stage';
  const firstStep = steps[0];
  form.insertBefore(stage, firstStep);
  steps.forEach(step => stage.appendChild(step));

  steps.forEach(step => step.classList.remove('active', 'is-active'));
  step1.classList.add('is-active');

  const processing = document.createElement('div');
  processing.className = 'review-processing';
  processing.setAttribute('aria-live', 'polite');
  processing.innerHTML = `
    <div class="review-processing-inner">
      <div class="review-loader" aria-hidden="true">
        <div class="review-loader-line"></div>
        <div class="review-loader-line"></div>
        <div class="review-loader-line"></div>
      </div>
      <p class="review-processing-label">WE ARE REVIEWING YOUR INFO</p>
    </div>
  `;
  document.body.appendChild(processing);

  const resultsStage = document.createElement('section');
  resultsStage.className = 'results-stage';
  resultsStage.setAttribute('aria-label', 'Audience review results');

  const resultsPanel = document.createElement('div');
  resultsPanel.className = 'results-panel';
  resultsPanel.appendChild(resultsCard);

  const resultsActions = document.createElement('div');
  resultsActions.className = 'results-actions';
  resultsActions.innerHTML = '<button class="button" type="button" id="edit-review">Edit Answers</button>';

  resultsStage.appendChild(resultsPanel);
  resultsStage.appendChild(resultsActions);
  document.body.appendChild(resultsStage);

  let currentStep = 1;
  let transitioning = false;

  function selected(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);
  }

  function first(values, fallback = '') {
    return values.find(value => value && value !== "I'm not sure") || fallback;
  }

  function naturalList(values, limit = 2) {
    const clean = values.filter(value => value && value !== "I'm not sure").slice(0, limit);
    if (!clean.length) return '';
    if (clean.length === 1) return clean[0];
    return `${clean[0]} and ${clean[1]}`;
  }

  function lowerLead(value) {
    if (!value) return '';
    return value
      .replace(/^They['’]re\s+/i, '')
      .replace(/^They\s+/i, '')
      .replace(/^Something\s+/i, 'something ')
      .replace(/^Someone\s+/i, 'someone ')
      .replace(/^The\s+/i, 'the ')
      .replace(/^A\s+/i, 'a ');
  }

  function updateStep2Bridge() {
    const values = naturalList(selected('audience_values'));
    const trigger = lowerLead(first(selected('audience_trigger')));
    const bridge = document.getElementById('step2-bridge');
    if (!bridge) return;

    if (values && trigger) {
      bridge.textContent = `You’ve already identified that ${values} matter to the people you serve, especially when ${trigger}. That’s useful context. Now tell us what you offer and what shapes their decision.`;
    } else if (values) {
      bridge.textContent = `You’ve already identified that ${values} matter to the people you serve. That gives us something meaningful to work with. Now tell us what you offer and what shapes their decision.`;
    } else {
      bridge.textContent = 'You’ve already shared useful signals about the people you serve. Now tell us what you offer and what shapes their decision.';
    }
  }

  function updateStep3Bridge() {
    const values = naturalList(selected('audience_values'));
    const emotion = lowerLead(first(selected('audience_emotions')));
    const offer = document.getElementById('offer')?.value.trim();
    const bridge = document.getElementById('step3-bridge');
    if (!bridge) return;

    if (offer && values && emotion) {
      bridge.textContent = `You’ve described an audience that values ${values} and may be feeling ${emotion} as they consider ${offer}. Now tell us what matters in how you do the work so we can look for the genuine connection between what they need and what you provide.`;
    } else if (offer && values) {
      bridge.textContent = `You’ve described what matters to your audience and how ${offer} fits into their decision. Now tell us what matters in how you do the work so we can look for the genuine overlap.`;
    } else {
      bridge.textContent = 'Now tell us what matters in how you do the work. We’ll use that alongside what you’ve already shared about your audience and their decision.';
    }
  }

  function setProgress(stepNumber) {
    progress.querySelectorAll('.progress-step').forEach(item => {
      const number = Number(item.dataset.progressStep);
      item.classList.toggle('is-current', number === stepNumber);
      item.classList.toggle('is-past', number < stepNumber);
      item.classList.toggle('is-future', number > stepNumber);
      if (number === stepNumber) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
  }

  function setTheme(stepNumber) {
    document.body.dataset.reviewStep = String(stepNumber);
    setProgress(stepNumber);
  }

  function getStep(number) {
    return stage.querySelector(`.step[data-step="${number}"]`);
  }

  function questionSelected(name) {
    return Boolean(document.querySelector(`input[name="${name}"]:checked`));
  }

  function fieldContainerFor(name) {
    const input = document.querySelector(`[name="${name}"]`);
    return input?.closest('.question, .field') || input;
  }

  function clearInlineErrors() {
    stage.querySelectorAll('.inline-validation-error').forEach(error => error.remove());
    stage.querySelectorAll('.has-validation-error').forEach(element => element.classList.remove('has-validation-error'));
    stage.querySelectorAll('[aria-invalid="true"]').forEach(element => {
      element.removeAttribute('aria-invalid');
      element.removeAttribute('aria-describedby');
    });
  }

  function showMissingField(target, message) {
    if (!target) return false;
    clearInlineErrors();
    const container = target.matches?.('.question, .field') ? target : target.closest?.('.question, .field') || target;
    container.classList.add('has-validation-error');

    const error = document.createElement('div');
    error.className = 'inline-validation-error';
    error.setAttribute('role', 'alert');
    error.textContent = message;
    const errorId = `validation-${Date.now()}`;
    error.id = errorId;
    container.appendChild(error);

    const focusTarget = container.querySelector('input:not([type="hidden"]), button, textarea, select, [tabindex]') || container;
    if (!focusTarget.hasAttribute('tabindex') && focusTarget === container) focusTarget.setAttribute('tabindex', '-1');
    focusTarget.setAttribute('aria-invalid', 'true');
    focusTarget.setAttribute('aria-describedby', errorId);

    window.setTimeout(() => {
      container.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => focusTarget.focus({ preventScroll: true }), 260);
    }, 20);
    return false;
  }

  function validateExperienceStep(stepNumber) {
    clearInlineErrors();

    if (stepNumber === 1) {
      if (!questionSelected('audience_values')) return showMissingField(fieldContainerFor('audience_values'), 'Select what matters most to the people you serve.');
      if (!questionSelected('audience_trigger')) return showMissingField(fieldContainerFor('audience_trigger'), 'Select what is usually happening when people begin looking.');
      return true;
    }

    if (stepNumber === 2) {
      const offer = document.getElementById('offer');
      if (!offer?.value.trim()) return showMissingField(offer?.closest('.field'), 'Tell us what product or service you want us to review.');
      if (!questionSelected('offer_type')) return showMissingField(fieldContainerFor('offer_type'), 'Choose the option that best describes what you offer.');
      if (!questionSelected('audience_emotions')) return showMissingField(fieldContainerFor('audience_emotions'), 'Select what your audience is likely feeling at this point.');
      if (!questionSelected('audience_needs')) return showMissingField(fieldContainerFor('audience_needs'), 'Select what they seem to need most before deciding.');
      if (!questionSelected('audience_hesitation')) return showMissingField(fieldContainerFor('audience_hesitation'), 'Select what tends to create hesitation.');
      if (!questionSelected('audience_outcome')) return showMissingField(fieldContainerFor('audience_outcome'), 'Select what they hope will be different afterward.');
      return true;
    }

    if (!questionSelected('business_values')) return showMissingField(fieldContainerFor('business_values'), 'Select what matters most to you in how you provide the work.');
    return true;
  }

  function transitionToStep(nextStep, direction = 'forward') {
    if (transitioning || nextStep === currentStep) return;

    const current = getStep(currentStep);
    const next = getStep(nextStep);
    if (!current || !next) return;

    if (nextStep === 2) updateStep2Bridge();
    if (nextStep === 3) updateStep3Bridge();

    transitioning = true;
    setTheme(nextStep);

    const currentHeight = current.offsetHeight;
    stage.style.height = `${currentHeight}px`;

    next.style.display = 'block';
    next.classList.add('is-animating', direction === 'forward' ? 'enter-right' : 'enter-left');
    const nextHeight = next.offsetHeight;

    // Force the entering position to paint before both panels move.
    next.getBoundingClientRect();

    requestAnimationFrame(() => {
      stage.style.height = `${nextHeight}px`;
      current.classList.remove('is-active');
      current.classList.add('is-animating', direction === 'forward' ? 'exit-left' : 'exit-right');
      next.classList.remove('enter-right', 'enter-left');
      next.classList.add('at-rest');
    });

    window.setTimeout(() => {
      current.className = 'step';
      next.className = 'step is-active';
      current.style.display = '';
      next.style.display = '';
      stage.style.height = '';
      currentStep = nextStep;
      transitioning = false;
    }, MOTION_MS + 80);
  }

  document.addEventListener('change', event => {
    const container = event.target.closest?.('.question, .field');
    if (container?.classList.contains('has-validation-error')) clearInlineErrors();
  }, true);

  document.addEventListener('input', event => {
    const container = event.target.closest?.('.question, .field');
    if (container?.classList.contains('has-validation-error') && event.target.value.trim()) clearInlineErrors();
  }, true);

  document.addEventListener('click', event => {
    const nextButton = event.target.closest('[data-next]');
    const backButton = event.target.closest('[data-back]');

    if (nextButton && form.contains(nextButton)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const next = Number(nextButton.dataset.next);
      if (!validateExperienceStep(currentStep)) return;
      transitionToStep(next, 'forward');
      return;
    }

    if (backButton && form.contains(backButton)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      clearInlineErrors();
      transitionToStep(Number(backButton.dataset.back), 'back');
    }
  }, true);

  function buildPayload() {
    return {
      schemaVersion: '4.0',
      reviewType: 'audience_behavioral_analysis',
      offer: {
        name: document.getElementById('offer').value.trim(),
        type: selectedValues('offer_type')[0] || null,
        website: document.getElementById('website').value.trim() || null
      },
      audienceEvidence: {
        values: selectedValues('audience_values'),
        triggerContext: selectedValues('audience_trigger'),
        emotionalState: selectedValues('audience_emotions'),
        decisionNeeds: selectedValues('audience_needs'),
        resistanceSignals: selectedValues('audience_hesitation'),
        desiredMovement: selectedValues('audience_outcome')
      },
      businessEvidence: {
        providerValues: selectedValues('business_values'),
        intendedMessage: selectedValues('business_message')
      },
      createdAt: new Date().toISOString()
    };
  }

  async function runReview() {
    if (!validateExperienceStep(3)) return;

    if (submitButton) submitButton.disabled = true;

    document.body.classList.add('is-processing');
    processing.classList.remove('is-complete');
    processing.classList.add('is-visible');

    await new Promise(resolve => window.setTimeout(resolve, 360));

    const payload = buildPayload();

    try {
      payload.analysis = await requestAudienceAnalysis(payload);
    } catch (error) {
      console.error('External audience analysis failed. Using local fallback.', error);
      payload.analysis = buildLocalAudienceAnalysis(payload);
      payload.analysis.audienceIntelligence.externalAnalysisError = String(error.message || error);
    }

    window.audienceReviewPayload = payload;
    window.audienceIntelligence = payload.analysis.audienceIntelligence;

    renderResults(payload);

    processing.classList.add('is-complete');
    await new Promise(resolve => window.setTimeout(resolve, 390));

    document.body.classList.remove('is-processing');
    document.body.classList.add('is-results');
    resultsStage.classList.add('is-visible');
    processing.classList.remove('is-visible');

    if (submitButton) submitButton.disabled = false;
  }

  document.addEventListener('submit', event => {
    if (event.target !== form) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    runReview();
  }, true);

  document.getElementById('edit-review').addEventListener('click', () => {
    resultsStage.classList.remove('is-visible');
    document.body.classList.remove('is-results');
    setTheme(3);
    currentStep = 3;
    window.setTimeout(() => {
      page.style.opacity = '';
      page.style.transform = '';
    }, 20);
  });

  setTheme(1);
})();
