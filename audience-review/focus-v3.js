(() => {
  const form = document.getElementById('audience-form');
  const stage = document.getElementById('form-stage');
  if (!form || !stage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let focusTimer;

  function moveToStepStart(stepNumber) {
    const step = stage.querySelector(`.step[data-step="${stepNumber}"]`);
    const heading = step?.querySelector('.section-heading h2');
    if (!step || !heading) return;

    window.clearTimeout(focusTimer);

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement && form.contains(activeElement)) {
      activeElement.blur();
    }

    const formTop = form.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: Math.max(0, formTop),
      behavior: reduceMotion ? 'auto' : 'smooth'
    });

    focusTimer = window.setTimeout(() => {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 720);
  }

  const observer = new MutationObserver(records => {
    const changed = records.some(record => record.attributeName === 'data-review-step');
    if (!changed) return;

    const stepNumber = Number(document.body.dataset.reviewStep);
    if (stepNumber >= 1 && stepNumber <= 3) moveToStepStart(stepNumber);
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-review-step']
  });
})();
