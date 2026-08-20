(() => {
  const offerInput = document.getElementById('offer');
  const step2 = document.querySelector('.step[data-step="2"]');
  if (!step2) return;

  function applyNicheLanguage() {
    const heading = step2.querySelector('.section-heading h2');
    const bridge = document.getElementById('step2-bridge');
    const progress = document.querySelector('[data-progress-step="2"] .progress-copy strong');
    const nextFromStep1 = document.querySelector('.step[data-step="1"] [data-next="2"]');

    if (heading) heading.textContent = 'Find your niche.';
    if (progress) progress.textContent = 'Find your niche';
    if (nextFromStep1 && !nextFromStep1.classList.contains('is-preparing-context')) {
      nextFromStep1.textContent = 'Next: Find Your Niche';
    }

    if (bridge) {
      const title = offerInput?.value.trim();
      bridge.textContent = title
        ? `You already know the people who come looking for ${title} are not all the same. We have started with what can be reasonably inferred from the work. Now use what you have learned by actually doing it to sharpen the picture.`
        : 'You already know the people you serve are not all the same. We will start with what can be reasonably inferred from the work, then use your experience to sharpen the picture.';
    }
  }

  let timer = null;
  offerInput?.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(applyNicheLanguage, 260);
  });
  offerInput?.addEventListener('blur', applyNicheLanguage);
  document.addEventListener('audience:step1-context-ready', applyNicheLanguage);

  const observer = new MutationObserver(mutations => {
    if (mutations.some(mutation => mutation.attributeName === 'data-review-step')) {
      window.setTimeout(applyNicheLanguage, 0);
    }
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-review-step'] });

  applyNicheLanguage();
})();
