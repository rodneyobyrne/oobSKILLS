(() => {
  const MOTION_MS = 460;
  const step1 = document.querySelector('.step[data-step="1"]');
  const originalStep2 = document.querySelector('.step[data-step="2"]');
  const originalResultStep = document.querySelector('.step[data-step="3"]');
  const form = document.getElementById('audience-form');
  const page = document.querySelector('.page');
  const progress = document.querySelector('.progress');

  if (!step1 || !originalStep2 || !originalResultStep || !form || !page || !progress) return;

  document.querySelector('.rule')?.classList.replace('rule', 'rough-rule');

  const resultsCard = originalResultStep.querySelector('#results');
  originalResultStep.remove();

  originalStep2.dataset.step = '3';
  originalStep2.classList.remove('active');
  originalStep2.querySelector('.eyebrow').textContent = 'Part 3';
  originalStep2.querySelector('.section-heading h2').textContent = 'Now tell us what matters to you.';
  originalStep2.querySelector('.section-heading p').textContent = 'This helps us find the genuine overlap between how you want to do the work and what your audience needs in order to make a confident decision.';

  const step3Back = originalStep2.querySelector('[data-back]');
  if (step3Back) step3Back.dataset.back = '2';

  const oldStep2Error = originalStep2.querySelector('#step2-error');
  if (oldStep2Error) oldStep2Error.id = 'step3-error';

  const step2 = document.createElement('section');
  step2.className = 'step';
  step2.dataset.step = '2';
  step2.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Part 2</p>
      <h2>What shapes the decision?</h2>
      <p>
        These questions help us understand the emotional state around the choice,
        what people need before they act, and what may create unnecessary hesitation.
      </p>
    </div>
    <div id="audience-decision-questions"></div>
    <div class="error" id="step2-error">Please complete each question before continuing.</div>
    <div class="actions">
      <button class="button secondary" type="button" data-back="1">Back</button>
      <button class="button" type="button" data-next="3">Next: About Your Work</button>
    </div>
  `;

  form.insertBefore(step2, originalStep2);

  const audienceQuestions = [...document.querySelectorAll('#audience-questions .question')];
  const decisionContainer = step2.querySelector('#audience-decision-questions');
  audienceQuestions.slice(2).forEach(question => decisionContainer.appendChild(question));

  const step1Next = step1.querySelector('[data-next]');
  if (step1Next) step1Next.textContent = 'Next: The Decision';

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

  function setProgress(stepNumber) {
    [1, 2, 3].forEach(number => {
      const bar = document.getElementById(`progress-${number}`);
      if (!bar) return;
      bar.classList.remove('active', 'is-complete', 'is-current', 'is-future', 'step-1', 'step-2', 'step-3');
      if (number < stepNumber) bar.classList.add('is-complete');
      else if (number === stepNumber) bar.classList.add('is-current', `step-${number}`);
      else bar.classList.add('is-future');
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

  function showError(id, visible) {
    document.getElementById(id)?.classList.toggle('visible', visible);
  }

  function validateExperienceStep(stepNumber) {
    if (stepNumber === 1) {
      const valid = Boolean(document.getElementById('offer').value.trim()) &&
        questionSelected('offer_type') &&
        questionSelected('audience_values') &&
        questionSelected('audience_trigger');
      showError('step1-error', !valid);
      return valid;
    }

    if (stepNumber === 2) {
      const valid = [
        'audience_emotions',
        'audience_needs',
        'audience_hesitation',
        'audience_outcome'
      ].every(questionSelected);
      showError('step2-error', !valid);
      return valid;
    }

    const valid = typeof validateStepTwo === 'function'
      ? validateStepTwo()
      : questionSelected('business_values');
    showError('step3-error', !valid);
    return valid;
  }

  function transitionToStep(nextStep, direction = 'forward') {
    if (transitioning || nextStep === currentStep) return;

    const current = getStep(currentStep);
    const next = getStep(nextStep);
    if (!current || !next) return;

    transitioning = true;
    setTheme(nextStep);

    const currentHeight = current.offsetHeight;
    stage.style.height = `${currentHeight}px`;

    next.classList.add('is-animating', direction === 'forward' ? 'enter-right' : 'enter-left');
    next.style.display = 'block';
    const nextHeight = next.offsetHeight;

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
      stage.style.height = '';
      currentStep = nextStep;
      transitioning = false;
    }, MOTION_MS + 30);
  }

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

    const submitButton = document.getElementById('submit-review');
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
    window.setTimeout(() => {
      page.style.opacity = '';
      page.style.transform = '';
    }, 20);
  });

  setTheme(1);
})();
