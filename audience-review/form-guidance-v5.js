(() => {
  const form = document.getElementById('audience-form');
  const offerInput = document.getElementById('offer');
  if (!form || !offerInput) return;

  const selected = name => [...document.querySelectorAll(`input[name="${name}"]:checked`)]
    .map(input => input.value)
    .filter(value => value && value !== "I'm not sure" && value !== 'Something else');

  function setHelp(questionId, text) {
    const help = document.querySelector(`[data-question="${questionId}"] .question-help`);
    if (help && text) help.textContent = text;
  }

  function domainModel() {
    const title = offerInput.value.trim();
    if (title.length < 3 || typeof window.buildAudienceDomainModel !== 'function') return null;
    return window.buildAudienceDomainModel({ offer: { name: title } });
  }

  function updateGuidance() {
    const title = offerInput.value.trim();
    const domain = domainModel();
    const values = selected('audience_values');

    setHelp(
      'audience_trigger',
      values.length
        ? 'Now tell us when those priorities become important. This helps us distinguish a general preference from something that becomes more important in a specific decision situation.'
        : 'Select up to 4.'
    );

    setHelp(
      'offer_type',
      title
        ? `Choose the closest fit for ${title}. This helps us interpret how the customer evaluates the decision; it does not limit the analysis.`
        : 'Choose one.'
    );

    if (domain && domain.family !== 'general') {
      setHelp('audience_emotions', `For ${title}, think about the moment they first realize they may need this kind of help—not how they feel after the work is complete.`);
      setHelp('audience_needs', `Think about what would help them move from interest to a confident decision. In this field, the customer may not be able to independently judge every technical choice before hiring.`);
      setHelp('audience_hesitation', `Think about what could make someone delay, compare, or question whether ${title} is necessary, useful, or the right level of solution.`);
      setHelp('audience_outcome', `Think about what they need to be able to know, do, feel, or decide once the ${title} work is finished.`);
    } else {
      setHelp('audience_emotions', 'Think about the moment they first realize they may need this kind of help. Select up to 4.');
      setHelp('audience_needs', 'Think about what would help them move from interest to a confident decision. Select up to 4.');
      setHelp('audience_hesitation', 'Think about what could make them delay, compare, or question the choice. Select up to 4.');
      setHelp('audience_outcome', 'Think about what they need to be different once the work is finished. Select up to 4.');
    }

    setHelp(
      'business_values',
      'Choose up to 4. We’ll test these against the customer concerns already identified and show where they create a credible reason to work with you.'
    );

    setHelp(
      'business_message',
      'Optional. Choose up to 2. We’ll compare this with the decision patterns already emerging rather than assume it is what customers most need to hear.'
    );
  }

  let timer = null;
  form.addEventListener('change', updateGuidance);
  offerInput.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(updateGuidance, 220);
  });
  offerInput.addEventListener('blur', updateGuidance);

  const observer = new MutationObserver(mutations => {
    if (mutations.some(mutation => mutation.attributeName === 'data-review-step')) updateGuidance();
  });
  observer.observe(document.body, { attributes: true });

  updateGuidance();
})();
