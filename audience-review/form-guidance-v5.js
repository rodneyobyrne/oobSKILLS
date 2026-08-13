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
    const audienceValues = selected('audience_values');
    const decisionNeeds = selected('audience_needs');
    const hesitation = selected('audience_hesitation');

    setHelp(
      'offer_type',
      title
        ? `Choose the closest fit for ${title}. This helps us understand how customers are likely to evaluate the decision; it does not limit the analysis.`
        : 'Choose the closest fit. This gives us a starting point for understanding how people buy this kind of work.'
    );

    if (domain && domain.family !== 'general') {
      setHelp('audience_values', `Thinking specifically about people who hire, approve, recommend, use, or benefit from ${title}, what seems to matter most to them? Select up to 5.`);
      setHelp('audience_trigger', `When does the need for ${title} become real enough that they start looking, comparing, or asking for help? Select up to 4.`);
      setHelp('audience_emotions', `Think about the moment they first realize they may need ${title}—before they understand every option or technical detail. Select up to 4.`);
      setHelp('audience_needs', 'What seems to help them move from “I may need this” to a confident decision? Customers may not be able to independently judge every professional or technical choice before hiring. Select up to 4.');
      setHelp('audience_hesitation', `What tends to make them delay, compare, or question whether ${title} is necessary, useful, worth the cost, or the right level of solution? Select up to 4.`);
      setHelp('audience_outcome', `Once the ${title} work is complete, what do they most need to be able to know, do, feel, decide, protect, or improve? Select up to 4.`);
    } else {
      setHelp('audience_values', 'Thinking about the people who actually make or influence the decision, what seems to matter most to them? Select up to 5.');
      setHelp('audience_trigger', 'When does the need become real enough that they start looking, comparing, or asking for help? Select up to 4.');
      setHelp('audience_emotions', 'Think about the moment they first realize they may need this kind of help. Select up to 4.');
      setHelp('audience_needs', 'What helps them move from interest to a confident decision? Select up to 4.');
      setHelp('audience_hesitation', 'What tends to make them delay, compare, or question the choice? Select up to 4.');
      setHelp('audience_outcome', 'What do they need to be different once the work is finished? Select up to 4.');
    }

    const customerSignal = [...decisionNeeds, ...hesitation].filter(Boolean).slice(0, 2);
    setHelp(
      'business_values',
      customerSignal.length
        ? 'Choose up to 4. We’ll test these against the customer concerns already emerging—not assume every value is equally relevant to this decision.'
        : 'Choose up to 4. We’ll connect these standards back to what your customers appear to need from the decision.'
    );

    setHelp(
      'business_message',
      audienceValues.length
        ? 'Optional. Choose up to 2. We’ll compare this with what your customer answers suggest they most need to hear, understand, or see proved.'
        : 'Optional. Choose up to 2. We’ll compare this with the customer decision patterns that emerge from the review.'
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
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-review-step'] });

  updateGuidance();
})();
