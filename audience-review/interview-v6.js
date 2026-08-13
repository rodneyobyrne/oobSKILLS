(() => {
  const form = document.getElementById('audience-form');
  const offerInput = document.getElementById('offer');
  if (!form || !offerInput) return;

  const QUESTION_CONFIG = {
    audience_values: {
      title: relationship => `Which of these sounds most like what matters to ${relationship.audiencePlural}?`,
      help: 'Choose the statements you recognize most strongly. These are intentionally limited to patterns that meaningfully change the communication strategy.',
      labels: {
        'Trust': 'They need to trust the person or recommendation before much else matters.',
        'Reliability': 'They want to know the process or result will be dependable.',
        'Control': 'They want guidance, but they still want to feel in control of the decision.',
        'Being understood': 'They want to feel understood rather than treated like a generic case.',
        'Avoiding unnecessary cost': 'They care about not paying for more than they actually need.',
        'Opportunity or improvement': 'They are motivated by progress and what could be better afterward.',
        'Convenience': 'They want the decision and process to require as little extra effort as possible.',
        'Protecting people they care about': 'The decision is partly about protecting or helping someone they care about.',
        "I'm not sure": 'I do not see a clear pattern yet.'
      }
    },
    audience_trigger: {
      title: relationship => `What most often pushes ${relationship.audiencePlural} from “maybe” into actually looking for help?`,
      help: 'Choose the situations that most reliably create movement. We use these to distinguish prevention, problem-solving, progress, comparison, and social-influence patterns.',
      labels: {
        'Something has gone wrong': 'Something has gone wrong and they want the problem resolved.',
        'They want to prevent something from going wrong': 'They are trying to prevent a mistake, loss, or future problem.',
        'They have an immediate need': 'The need has become immediate and they want a practical next step.',
        "They're making an important decision": 'They are making a decision that feels important enough to get help with.',
        "They're comparing alternatives": 'They are actively comparing options and trying to understand the differences.',
        'Someone recommended it': 'Someone they trust has recommended this kind of help.',
        "Something in their life or business has changed": 'A change has made the old approach less workable.',
        'They want to improve themselves or their situation': 'They are actively trying to make progress or create something better.',
        "They're supporting someone else": 'They are making the decision partly on behalf of someone else.',
        "I'm not sure": 'I do not see a clear pattern yet.'
      }
    },
    audience_emotions: {
      title: relationship => `When ${relationship.audiencePlural} first reach that point, which state do you recognize most often?`,
      help: 'Choose the states you genuinely observe. These help distinguish uncertainty, risk, frustration, reactance, vulnerability, and progress-oriented patterns.',
      labels: {
        'Uncertain': 'They are uncertain and want to feel more confident before choosing.',
        'Worried': 'They are worried about what could go wrong or what the decision might affect.',
        'Frustrated': 'They are frustrated and want the problem to stop taking up attention.',
        'Overwhelmed': 'They feel overwhelmed by the number of choices, details, or things to manage.',
        'Skeptical': 'They are skeptical and do not want to accept claims at face value.',
        'Pressured': 'They already feel pressured and are sensitive to anyone pushing the decision harder.',
        'Vulnerable': 'The situation feels personal, exposed, or unusually consequential.',
        'Hopeful': 'They are hopeful that the right choice could create meaningful progress.',
        'Motivated': 'They are ready to act if they can see a credible path forward.',
        "I'm not sure": 'I do not see a clear pattern yet.'
      }
    },
    audience_needs: {
      title: relationship => `What most often helps ${relationship.audiencePlural} move from interest to a decision they feel good about?`,
      help: 'Choose the decision support they seem to need—not what you would prefer to tell them.',
      labels: {
        "Confidence they're not making a mistake": 'They need confidence that they are not making the wrong choice.',
        'Proof that it works': 'They want evidence or examples they can judge for themselves.',
        'Expert guidance': 'They want an expert to help interpret choices they cannot easily evaluate alone.',
        'Clear choices': 'They need the options reduced to a few understandable differences.',
        'Control over the decision': 'They want guidance while keeping ownership of the final choice.',
        'A clear price': 'They want cost and what changes that cost to be easy to understand.',
        'Someone to make it easier': 'They want someone to reduce the effort, coordination, or complexity involved.',
        'Agreement from other people involved': 'Other people need to understand or agree before the decision can move.',
        'A personal connection': 'They need to feel that the person helping them actually understands their situation.',
        "I'm not sure": 'I do not see a clear pattern yet.'
      }
    },
    audience_hesitation: {
      title: relationship => `Which of these most often makes ${relationship.audiencePlural} slow down, compare longer, or pull away?`,
      help: 'Choose the friction you actually see. These options are designed to separate value, trust, choice overload, status quo, autonomy, and coordination barriers.',
      labels: {
        'Price': 'The price feels difficult to justify or compare.',
        'Fear of making the wrong choice': 'They are worried they will regret choosing the wrong option or level of help.',
        'Lack of trust': 'They are not yet sure they trust the provider, recommendation, or process.',
        'Too much information': 'There is too much information or too many details to sort through easily.',
        "They don't understand the differences between options": 'The choices look similar enough that they cannot tell what fits them.',
        "They don't want to feel pressured": 'Pressure makes them pull back or protect control of the decision.',
        'Changing feels difficult': 'Staying with the current situation feels easier than making a change.',
        'The decision involves too many people': 'Too many people need to agree, approve, or coordinate.',
        "They keep putting it off": 'They keep postponing the first step even when the need is real.',
        "I'm not sure": 'I do not see a clear pattern yet.'
      }
    },
    audience_outcome: {
      title: relationship => `When this goes well, what do ${relationship.audiencePlural} most want to be different afterward?`,
      help: 'Choose the outcome they seem to value—not simply the deliverable you provide.',
      labels: {
        'I want to feel confident': 'They want to feel confident that they understood and made a sound decision.',
        'I want to feel safe': 'They want to feel safer or less exposed to a meaningful risk.',
        'I want greater control': 'They want more control over what happens next.',
        'I want less stress': 'They want the situation to take up less emotional or mental energy.',
        'I want to feel understood': 'They want to feel recognized and understood in their specific situation.',
        'I want something I can depend on': 'They want a result or relationship they can rely on.',
        'I want to save time': 'They want the process to require less time, effort, or coordination.',
        'I want to save money': 'They want to avoid waste and feel the cost was justified.',
        'I want to make progress': 'They want visible progress toward something that matters to them.',
        'I want to help someone else': 'They want the result to help or protect someone else.',
        "I'm not sure": 'I do not see a clear pattern yet.'
      }
    }
  };

  function relationshipModel() {
    const title = offerInput.value.trim();
    if (typeof window.buildAudienceDomainModel !== 'function') {
      return { audienceSingular: 'customer', audiencePlural: 'customers', providerRole: 'provider', id: 'service_client' };
    }
    const domain = window.buildAudienceDomainModel({ offer: { name: title || 'service' } });
    return domain?.relationshipModel || { audienceSingular: 'customer', audiencePlural: 'customers', providerRole: 'provider', id: 'service_client' };
  }

  function applyQuestionConfig(questionId, config, relationship) {
    const node = document.querySelector(`[data-question="${questionId}"]`);
    if (!node) return;
    const title = node.querySelector('.question-title');
    const help = node.querySelector('.question-help');
    if (title) title.textContent = config.title(relationship);
    if (help) help.textContent = config.help;

    node.querySelectorAll('.option').forEach(option => {
      const input = option.querySelector('input');
      const label = option.querySelector('label');
      if (!input || !label) return;
      const display = config.labels[input.value];
      if (!display) {
        option.remove();
        return;
      }
      label.textContent = display;
    });
  }

  function relationshipLead(relationship) {
    switch (relationship.id) {
      case 'education_student':
        return 'Teaching is a shared-progress relationship. Students may rely on you to help judge the right starting point, but their confidence, effort, goals, and ability to use what they learn all shape the outcome.';
      case 'physician_patient':
        return 'The physician–patient relationship carries high expertise and authority asymmetry. That makes clarity, informed choice, realistic expectations, privacy, and respect for patient agency especially important.';
      case 'couples_counseling':
        return 'Couples counseling is not a simple one-buyer relationship. Different partners may arrive with different goals, interpretations, readiness, or concerns, while the counselor holds professional authority and responsibility for a process that must make room for more than one person.';
      case 'therapy_client':
        return 'The therapist–client relationship can involve meaningful vulnerability and authority. Fit, boundaries, expectations, confidentiality, and preserving the client’s agency can matter as much as understanding the service itself.';
      case 'caregiver_family':
        return 'Care decisions often involve different people choosing, paying, participating, and receiving the service. Trust grows when responsibility, communication, individual attention, and what happens when circumstances change are easy to understand.';
      default:
        return `This is not only a transaction. The ${relationship.providerRole}–${relationship.audienceSingular} relationship changes what people need to understand, trust, control, and participate in before the decision feels workable.`;
    }
  }

  function updateRelationshipLanguage() {
    const relationship = relationshipModel();
    const step2Heading = document.querySelector('.step[data-step="2"] .section-heading h2');
    const step2Bridge = document.getElementById('step2-bridge');
    const progress = document.querySelector('[data-progress-step="2"] .progress-copy strong');

    if (step2Heading) step2Heading.textContent = `Help us understand what you already know about ${relationship.audiencePlural}.`;
    if (progress) progress.textContent = relationship.id === 'service_client' ? 'Your customers' : `Your ${relationship.audiencePlural}`;
    if (step2Bridge) {
      step2Bridge.textContent = `${relationshipLead(relationship)} We will start from those high-probability relationship patterns, then use what you actually observe to confirm, refine, or contradict them.`;
    }

    Object.entries(QUESTION_CONFIG).forEach(([id, config]) => applyQuestionConfig(id, config, relationship));
  }

  let timer = null;
  offerInput.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(updateRelationshipLanguage, 240);
  });
  offerInput.addEventListener('blur', updateRelationshipLanguage);
  form.addEventListener('change', () => window.setTimeout(updateRelationshipLanguage, 0));

  const observer = new MutationObserver(mutations => {
    if (mutations.some(mutation => mutation.attributeName === 'data-review-step')) {
      window.setTimeout(updateRelationshipLanguage, 0);
    }
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-review-step'] });

  updateRelationshipLanguage();
})();
