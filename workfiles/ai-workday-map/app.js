(() => {
  const form = document.querySelector('[data-workflow-map-form]');
  const result = document.querySelector('[data-workflow-map-result]');
  if (!form || !result) return;

  const status = document.querySelector('[data-draft-status]');
  const resultStatus = document.querySelector('[data-result-status]');
  const pathList = document.querySelector('[data-workflow-path]');
  const verdict = document.querySelector('[data-workflow-verdict]');
  const verdictKicker = document.querySelector('[data-verdict-kicker]');
  const verdictTitle = document.querySelector('[data-verdict-title]');
  const verdictCopy = document.querySelector('[data-verdict-copy]');
  const brief = document.querySelector('[data-workflow-brief]');
  const resultGrid = document.querySelector('[data-result-grid]');
  const copyButton = document.querySelector('[data-copy-result]');
  const downloadButton = document.querySelector('[data-download-result]');
  const clearButton = document.querySelector('[data-clear-draft]');
  let latestMarkdown = '';

  const labels = {
    pilotOutcome: {
      worked: 'It worked reliably with normal human review',
      partial: 'A bounded part worked, but not the whole task',
      correction: 'It required frequent correction or supervision',
      stop: 'The pilot exposed a risk or failure that should stop expansion'
    },
    cadence: {
      daily: 'Daily or more often',
      weekly: 'Several times a week',
      monthly: 'Several times a month',
      occasional: 'Occasionally'
    },
    reviewCadence: {
      two_weeks: 'After two weeks',
      month: 'After one month',
      quarter: 'After one quarter',
      change: 'Whenever the tool, source, policy or responsibility changes'
    }
  };

  const value = (name) => form.elements[name]?.value?.trim?.() || form.elements[name]?.value || '';

  function serialize() {
    const data = {};
    Array.from(form.elements).forEach((field) => {
      if (!field.name || ['submit', 'button'].includes(field.type)) return;
      data[field.name] = field.value;
    });
    return data;
  }

  function addPathStep(title, text) {
    const item = document.createElement('li');
    const wrap = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = title;
    const copy = document.createElement('span');
    copy.textContent = text;
    wrap.append(strong, copy);
    item.append(wrap);
    pathList.append(item);
  }

  function addResultCard(title, text) {
    const card = document.createElement('article');
    card.className = 'workflow-result-card';
    const heading = document.createElement('h3');
    heading.textContent = title;
    const copy = document.createElement('p');
    copy.textContent = text;
    card.append(heading, copy);
    resultGrid.append(card);
  }

  function resultState(outcome) {
    if (outcome === 'stop') {
      return {
        state: 'stop',
        kicker: 'Stop before expansion',
        title: 'Do not put this pilot into regular operations yet.',
        copy: 'The pilot exposed a risk or failure that deserves correction before the workflow becomes routine. Keep the useful learning, but do not normalize the failing step.'
      };
    }
    if (outcome === 'correction') {
      return {
        state: 'revise',
        kicker: 'Revise before routine use',
        title: 'The workflow needs a tighter boundary before it becomes normal work.',
        copy: 'Frequent correction usually means the AI-supported step is still too broad, the source material is weak, or the review standard is not explicit enough.'
      };
    }
    if (outcome === 'partial') {
      return {
        state: 'revise',
        kicker: 'Operationalize only what worked',
        title: 'Keep the successful portion and leave the rest outside the workflow.',
        copy: 'A partial success can still be useful. Document only the bounded step that worked reliably and keep the remaining judgment or exception handling with people.'
      };
    }
    return {
      state: 'ready',
      kicker: 'Ready to document',
      title: 'This pilot is ready to become a working operating workflow.',
      copy: 'The next move is not more experimentation. Make the trigger, approved inputs, review point, owner, exception path and measurement visible so the team can repeat the result consistently.'
    };
  }

  function buildMarkdown(data, state) {
    const title = data.workflowName || data.task || 'AI Workflow Map';
    const outcome = labels.pilotOutcome[data.pilotOutcome] || data.pilotOutcome;
    const cadence = labels.cadence[data.cadence] || data.cadence;
    const reviewCadence = labels.reviewCadence[data.reviewCadence] || data.reviewCadence;
    return `# ${title}\n\nCreated with oobCREATIVE Map Your AI Workflow.\n\n## Operationalization decision\n\n**${state.title}**\n\n${state.copy}\n\nPilot outcome: ${outcome}\n\n## Operating sequence\n\n1. **Trigger** — ${data.trigger}\n2. **Approved inputs / source of truth** — ${data.sources}\n3. **AI-supported step** — ${data.aiStep}\n4. **Human review** — ${data.reviewer} checks the result against: ${data.reviewStandard}\n5. **Destination / record** — ${data.destination}\n6. **Exception path** — Stop or hand off when: ${data.exception}\n7. **Owner** — ${data.owner}\n\n## What the pilot taught us\n\n**What worked**\n${data.worked}\n\n**What still needed correction or judgment**\n${data.corrections || 'No additional correction was recorded.'}\n\n## Operating cadence\n\n- Frequency: ${cadence}\n- Measure: ${data.measure}\n- Recheck this workflow: ${reviewCadence}\n- Tool or assistant used: ${data.tool || 'Not specified'}\n\n## Working instruction\n\nWhen ${data.trigger}, use only ${data.sources} to ${data.aiStep}. ${data.reviewer} reviews the result against ${data.reviewStandard} before ${data.destination}. Stop and hand the work to ${data.owner} when ${data.exception}. Measure ${data.measure} and review this workflow ${reviewCadence.toLowerCase()}.\n`;
  }

  form.addEventListener('input', () => {
    if (status) status.textContent = 'Answers stay on this page while it is open.';
    if (!result.hidden) result.hidden = true;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = serialize();
    const state = resultState(data.pilotOutcome);
    verdict.dataset.state = state.state;
    verdictKicker.textContent = state.kicker;
    verdictTitle.textContent = state.title;
    verdictCopy.textContent = state.copy;

    pathList.replaceChildren();
    addPathStep('Trigger', data.trigger);
    addPathStep('Approved inputs', data.sources);
    addPathStep('AI-supported step', data.aiStep);
    addPathStep('Human review', `${data.reviewer} checks against: ${data.reviewStandard}`);
    addPathStep('Destination', data.destination);
    addPathStep('Exception path', data.exception);
    addPathStep('Owner', data.owner);

    const reviewCadence = labels.reviewCadence[data.reviewCadence] || data.reviewCadence;
    resultGrid.replaceChildren();
    addResultCard('What worked', data.worked);
    addResultCard('What stays human', data.corrections || data.reviewStandard);
    addResultCard('Success measure', data.measure);
    addResultCard('Recheck point', reviewCadence);

    const instruction = `When ${data.trigger}, use only ${data.sources} to ${data.aiStep}. ${data.reviewer} reviews the result against ${data.reviewStandard} before ${data.destination}. Stop and hand the work to ${data.owner} when ${data.exception}. Measure ${data.measure} and review this workflow ${reviewCadence.toLowerCase()}.`;
    brief.textContent = instruction;
    latestMarkdown = buildMarkdown(data, state);

    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });

  copyButton?.addEventListener('click', async () => {
    if (!latestMarkdown) return;
    try {
      await navigator.clipboard.writeText(latestMarkdown);
      resultStatus.textContent = 'Workflow map copied.';
    } catch {
      resultStatus.textContent = 'Copy was blocked by this browser. Use the download instead.';
    }
  });

  downloadButton?.addEventListener('click', () => {
    if (!latestMarkdown) return;
    const blob = new Blob([latestMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const name = (value('workflowName') || value('task') || 'ai-workflow-map').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    link.href = url;
    link.download = `${name || 'ai-workflow-map'}.md`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    resultStatus.textContent = 'Workflow map downloaded.';
  });

  clearButton?.addEventListener('click', () => {
    form.reset();
    result.hidden = true;
    latestMarkdown = '';
    if (status) status.textContent = 'Answers cleared.';
    form.querySelector('input,select,textarea')?.focus();
  });
})();
