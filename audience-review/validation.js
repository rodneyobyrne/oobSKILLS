(() => {
  const form = document.getElementById('audience-form');
  if (!form) return;

  const rules = {
    1: [
      { type: 'text', id: 'offer', message: 'Please tell us what product or service you want us to review.' },
      { type: 'choice', name: 'offer_type', message: 'Please choose the option that best describes what you offer.' },
      { type: 'choice', name: 'audience_values', message: 'Please choose what matters most to this audience.' },
      { type: 'choice', name: 'audience_trigger', message: 'Please choose what is usually happening when they become interested.' }
    ],
    2: [
      { type: 'choice', name: 'audience_emotions', message: 'Please choose what this audience is most likely feeling.' },
      { type: 'choice', name: 'audience_needs', message: 'Please choose what they seem to need most before deciding.' },
      { type: 'choice', name: 'audience_hesitation', message: 'Please choose what may make them hesitate or pull away.' },
      { type: 'choice', name: 'audience_outcome', message: 'Please choose what they hope will be different afterward.' }
    ],
    3: [
      { type: 'choice', name: 'business_values', message: 'Please choose what matters most to you about how you provide this product or service.' }
    ]
  };

  function targetFor(rule) {
    if (rule.type === 'text') return document.getElementById(rule.id);
    return document.querySelector(`input[name="${rule.name}"]`);
  }

  function containerFor(rule) {
    if (rule.type === 'text') return targetFor(rule)?.closest('.field');
    return document.querySelector(`[data-question="${rule.name}"]`) || targetFor(rule)?.closest('.field');
  }

  function isValid(rule) {
    if (rule.type === 'text') return Boolean(targetFor(rule)?.value.trim());
    return Boolean(document.querySelector(`input[name="${rule.name}"]:checked`));
  }

  function errorId(rule) {
    return `field-error-${rule.id || rule.name}`;
  }

  function clearError(rule) {
    const container = containerFor(rule);
    if (!container) return;

    container.classList.remove('has-error');
    container.querySelector(`#${CSS.escape(errorId(rule))}`)?.remove();

    const target = targetFor(rule);
    if (target?.getAttribute('aria-describedby') === errorId(rule)) {
      target.removeAttribute('aria-describedby');
    }
  }

  function showError(rule) {
    const container = containerFor(rule);
    const target = targetFor(rule);
    if (!container || !target) return;

    clearError(rule);
    container.classList.add('has-error');

    const error = document.createElement('div');
    error.className = 'field-error';
    error.id = errorId(rule);
    error.setAttribute('role', 'alert');
    error.textContent = rule.message;

    if (rule.type === 'choice') {
      const help = container.querySelector('.question-help');
      const options = container.querySelector('.options');
      if (help && help.nextSibling) container.insertBefore(error, help.nextSibling);
      else if (options) container.insertBefore(error, options);
      else container.appendChild(error);
    } else {
      target.insertAdjacentElement('afterend', error);
    }

    target.setAttribute('aria-describedby', error.id);
    target.setAttribute('aria-invalid', 'true');

    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => {
      try {
        target.focus({ preventScroll: true });
      } catch {
        target.focus();
      }
    }, 260);
  }

  function clearValidRule(rule) {
    if (!isValid(rule)) return false;
    clearError(rule);
    const target = targetFor(rule);
    target?.removeAttribute('aria-invalid');
    return true;
  }

  function firstInvalid(stepNumber) {
    const stepRules = rules[stepNumber] || [];
    let invalid = null;

    stepRules.forEach(rule => {
      if (isValid(rule)) {
        clearValidRule(rule);
      } else if (!invalid) {
        invalid = rule;
      }
    });

    return invalid;
  }

  function stopForInvalid(event, stepNumber) {
    const invalid = firstInvalid(stepNumber);
    if (!invalid) return false;

    event.preventDefault();
    event.stopImmediatePropagation();
    showError(invalid);
    return true;
  }

  document.addEventListener('click', event => {
    const nextButton = event.target.closest('[data-next]');
    if (!nextButton || !form.contains(nextButton)) return;

    const step = Number(nextButton.closest('.step')?.dataset.step || 1);
    stopForInvalid(event, step);
  }, true);

  document.addEventListener('submit', event => {
    if (event.target !== form) return;
    stopForInvalid(event, 3);
  }, true);

  form.addEventListener('input', event => {
    const target = event.target;
    const rule = Object.values(rules).flat().find(item =>
      item.type === 'text' ? item.id === target.id : item.name === target.name
    );
    if (rule) clearValidRule(rule);
  });

  form.addEventListener('change', event => {
    const target = event.target;
    const rule = Object.values(rules).flat().find(item =>
      item.type === 'text' ? item.id === target.id : item.name === target.name
    );
    if (rule) clearValidRule(rule);
  });
})();
