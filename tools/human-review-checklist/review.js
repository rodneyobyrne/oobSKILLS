(function () {
  'use strict';

  const STORAGE_KEY = 'oob-human-review-draft-v1';
  const questions = [
    { name: 'sources', title: 'Source information was appropriate to use', critical: true, action: 'Confirm that every input was permitted for the tool and environment used.' },
    { name: 'facts', title: 'Important factual claims were verified', critical: true, action: 'Check names, dates, numbers, quotations, citations and technical claims against reliable sources.' },
    { name: 'evidence', title: 'The result does not invent evidence', critical: false, action: 'Remove or clearly label any example, outcome or detail that is not supported by evidence.' },
    { name: 'limits', title: 'Uncertainty and limitations remain visible', critical: false, action: 'Label inferences, incomplete information and material limitations before the work is used.' },
    { name: 'dignity', title: 'People retain dignity and agency', critical: false, action: 'Revise language or representation that creates pressure, removes context or exploits vulnerability.' },
    { name: 'fairness', title: 'Different people and outcomes were considered', critical: false, action: 'Check assumptions, exclusions, accessibility barriers and unequal consequences with someone close to the context.' },
    { name: 'voice', title: 'The voice is accurate', critical: false, action: 'Remove generic confidence, inflated promises and language the person or organization would not defend.' },
    { name: 'owner', title: 'A capable person owns the final result', critical: true, action: 'Name an approver with enough context, authority and subject knowledge to recognize a plausible but wrong result.' },
    { name: 'disclosure', title: 'Disclosure and consent expectations were checked', critical: true, action: 'Check the relevant policy, agreement and reasonable expectations of the people affected.' },
    { name: 'correctable', title: 'The result can be corrected, withdrawn or stopped', critical: true, action: 'Define who can correct or stop the work and how affected people will be reached if the result is wrong.' }
  ];

  const labels = { yes: 'Confirmed', attention: 'Needs attention', unsure: 'Not sure' };

  function evaluate(answers) {
    const gaps = questions.filter((question) => answers[question.name] !== 'yes');
    const criticalGaps = gaps.filter((question) => question.critical);
    const uncertain = gaps.filter((question) => answers[question.name] === 'unsure');

    if (criticalGaps.length) {
      return {
        verdict: 'pause',
        kicker: 'Pause for the right review',
        title: 'Do not ask someone to rely on this work yet.',
        summary: 'A source, fact, ownership, consent or correction safeguard still needs a clear answer. Pausing protects the people affected and the credibility of the person responsible.',
        gaps,
        actions: criticalGaps.map((question) => question.action).slice(0, 4)
      };
    }

    if (gaps.length) {
      return {
        verdict: 'revise',
        kicker: 'Revise before use',
        title: 'The direction may be sound, but the work still needs human attention.',
        summary: `${gaps.length} ${gaps.length === 1 ? 'check needs' : 'checks need'} attention before this is ready. Address the named gaps, then review the work again rather than treating this result as permanent approval.`,
        gaps,
        actions: gaps.map((question) => question.action).slice(0, 4)
      };
    }

    return {
      verdict: 'ready',
      kicker: 'Ready for responsible use',
      title: 'The human responsibility is clear enough to move forward.',
      summary: 'All ten checks were confirmed for this version of the work. Keep the named owner involved, preserve the supporting sources and review again if the content, audience, data or consequence changes.',
      gaps: [],
      actions: [
        'Record who approved this version and when.',
        'Keep the supporting sources with the work so another person can understand the decision.',
        'Review again if the work, audience, input data or consequence changes.'
      ]
    };
  }

  function safeStorage(action, value) {
    try {
      if (action === 'get') return window.localStorage.getItem(STORAGE_KEY);
      if (action === 'set') window.localStorage.setItem(STORAGE_KEY, value);
      if (action === 'remove') window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
    return null;
  }

  function initialize() {
    const form = document.querySelector('[data-review-form]');
    if (!form) return;

    const questionElements = Array.from(form.querySelectorAll('[data-question]'));
    const progress = document.querySelector('[data-progress]');
    const progressBar = document.querySelector('[data-progress-bar]');
    const progressCount = document.querySelector('[data-progress-count]');
    const errorSummary = document.querySelector('[data-error-summary]');
    const errorCopy = document.querySelector('[data-error-copy]');
    const resultWrap = document.querySelector('[data-result-wrap]');
    const result = document.querySelector('[data-result]');
    const resultKicker = document.querySelector('[data-result-kicker]');
    const resultTitle = document.querySelector('[data-result-title]');
    const resultSummary = document.querySelector('[data-result-summary]');
    const resultActions = document.querySelector('[data-result-actions]');
    const resultChecks = document.querySelector('[data-result-checks]');
    const draftStatus = document.querySelector('[data-draft-status]');
    const toolFeedback = document.querySelector('[data-tool-feedback]');
    const nextKicker = document.querySelector('[data-next-kicker]');
    const nextTitle = document.querySelector('[data-next-title]');
    const nextCopy = document.querySelector('[data-next-copy]');
    const nextPrimary = document.querySelector('[data-next-primary]');
    const nextSecondary = document.querySelector('[data-next-secondary]');
    const reduceMotion = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : { matches: false };
    let currentSummary = '';

    errorSummary.id = errorSummary.id || 'review-error-summary';

    function addDescription(element, id) {
      const ids = new Set((element.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
      ids.add(id);
      element.setAttribute('aria-describedby', Array.from(ids).join(' '));
    }

    function removeDescription(element, id) {
      const ids = (element.getAttribute('aria-describedby') || '').split(/\s+/).filter((item) => item && item !== id);
      if (ids.length) element.setAttribute('aria-describedby', ids.join(' '));
      else element.removeAttribute('aria-describedby');
    }

    function answersFromForm() {
      const data = new FormData(form);
      return Object.fromEntries(questions.map((question) => [question.name, data.get(question.name)]));
    }

    function completedCount() {
      const answers = answersFromForm();
      return questions.filter((question) => answers[question.name]).length;
    }

    function updateProgress() {
      const count = completedCount();
      progress.setAttribute('aria-valuenow', String(count));
      progressBar.style.width = `${count * 10}%`;
      progressCount.textContent = `${count} of 10`;
    }

    function saveDraft() {
      const draft = Object.fromEntries(new FormData(form));
      safeStorage('set', JSON.stringify(draft));
      draftStatus.textContent = completedCount() ? 'Draft saved in this browser.' : 'Your progress stays in this browser.';
    }

    function restoreDraft() {
      const stored = safeStorage('get');
      if (!stored) return;
      try {
        const draft = JSON.parse(stored);
        Object.entries(draft).forEach(([name, value]) => {
          const fields = form.elements.namedItem(name);
          if (!fields) return;
          if (fields instanceof RadioNodeList) {
            const input = Array.from(fields).find((field) => field.value === value);
            if (input) input.checked = true;
          } else {
            fields.value = value;
          }
        });
        if (completedCount()) draftStatus.textContent = 'Your saved draft was restored in this browser.';
      } catch (error) {
        return;
      }
    }

    function clearMissingStates() {
      questionElements.forEach((element) => {
        element.classList.remove('is-missing');
        element.removeAttribute('aria-invalid');
        element.querySelectorAll('input').forEach((input) => {
          input.removeAttribute('aria-invalid');
          removeDescription(input, errorSummary.id);
        });
      });
      errorSummary.hidden = true;
    }

    function formatSummary(decision, answers) {
      const workLabel = form.elements.workLabel.value.trim() || 'Untitled AI-assisted work';
      const workType = form.elements.workType.value || 'Not specified';
      const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date());
      const lines = [
        '# Human Review Summary', '',
        `**Work:** ${workLabel}`,
        `**Type:** ${workType}`,
        `**Reviewed:** ${date}`,
        `**Decision:** ${decision.kicker}`, '',
        decision.summary, '',
        '## Review checks', ''
      ];
      questions.forEach((question) => lines.push(`- **${labels[answers[question.name]]}:** ${question.title}`));
      lines.push('', '## Next actions', '');
      decision.actions.forEach((action) => lines.push(`1. ${action}`));
      lines.push('', 'This checklist supports practical communication and workflow decisions. It is not legal, compliance, clinical, security or other professional advice.');
      return lines.join('\n');
    }

    function renderDecision(decision, answers) {
      result.dataset.verdict = decision.verdict;
      resultKicker.textContent = decision.kicker;
      resultTitle.textContent = decision.title;
      resultSummary.textContent = decision.summary;
      resultActions.replaceChildren(...decision.actions.map((action) => {
        const item = document.createElement('li');
        item.textContent = action;
        return item;
      }));

      const displayed = decision.gaps.length ? decision.gaps : questions;
      const checks = document.createElement('div');
      checks.className = 'result-checks';
      displayed.forEach((question) => {
        const item = document.createElement('div');
        const answer = answers[question.name];
        item.className = `result-check result-check--${answer}`;
        const title = document.createElement('strong');
        title.textContent = labels[answer];
        const copy = document.createElement('span');
        copy.textContent = question.title;
        item.append(title, copy);
        checks.append(item);
      });
      resultChecks.replaceChildren(checks);
      currentSummary = formatSummary(decision, answers);
      if (decision.verdict === 'ready') {
        nextKicker.textContent = 'Make responsible review repeatable';
        nextTitle.textContent = 'Carry this standard into the next piece of work.';
        nextCopy.textContent = 'Use the AI Fit Check before adding another AI-supported task, or explore a team workflow when review should be consistent across more than one person.';
        nextPrimary.textContent = 'Check another task for AI fit';
        nextPrimary.href = '/tools/ai-fit-check/';
        nextSecondary.innerHTML = 'Explore responsible AI implementation <span aria-hidden="true">→</span>';
        nextSecondary.href = '/services/responsible-ai-implementation/';
      } else if (decision.verdict === 'revise') {
        nextKicker.textContent = 'If the same gaps keep returning';
        nextTitle.textContent = 'Build review into the way your team works.';
        nextCopy.textContent = 'oobCREATIVE can help turn scattered AI use into a bounded workflow with clear ownership, review standards and practical staff guidance.';
        nextPrimary.textContent = 'Explore responsible AI implementation';
        nextPrimary.href = '/services/responsible-ai-implementation/';
        nextSecondary.innerHTML = 'Check whether AI fits the task <span aria-hidden="true">→</span>';
        nextSecondary.href = '/tools/ai-fit-check/';
      } else {
        nextKicker.textContent = 'A pause can be a responsible decision';
        nextTitle.textContent = 'Clarify the task before choosing more technology.';
        nextCopy.textContent = 'Use the free AI Fit Check to reconsider this task, or explore structured support when ownership, policy and review need to be established across a team.';
        nextPrimary.textContent = 'Use the AI Fit Check';
        nextPrimary.href = '/tools/ai-fit-check/';
        nextSecondary.innerHTML = 'Explore responsible AI implementation <span aria-hidden="true">→</span>';
        nextSecondary.href = '/services/responsible-ai-implementation/';
      }
      resultWrap.hidden = false;
      result.focus({ preventScroll: true });
      result.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    }

    form.addEventListener('input', (event) => {
      const question = event.target.closest('[data-question]');
      if (question) {
        question.classList.remove('is-missing');
        question.removeAttribute('aria-invalid');
        question.querySelectorAll('input').forEach((input) => {
          input.removeAttribute('aria-invalid');
          removeDescription(input, errorSummary.id);
        });
      }
      if (!errorSummary.hidden) errorSummary.hidden = true;
      if (!resultWrap.hidden) {
        resultWrap.hidden = true;
        currentSummary = '';
        toolFeedback.textContent = '';
      }
      updateProgress();
      saveDraft();
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      clearMissingStates();
      const answers = answersFromForm();
      const missing = questionElements.filter((element) => !answers[element.querySelector('input').name]);
      if (missing.length) {
        missing.forEach((element) => {
          element.classList.add('is-missing');
          element.setAttribute('aria-invalid', 'true');
          const firstInput = element.querySelector('input');
          firstInput.setAttribute('aria-invalid', 'true');
          addDescription(firstInput, errorSummary.id);
        });
        errorCopy.textContent = `Answer the ${missing.length} highlighted ${missing.length === 1 ? 'question' : 'questions'} before asking for a review decision.`;
        errorSummary.hidden = false;
        const firstMissingInput = missing[0].querySelector('input');
        firstMissingInput.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
        firstMissingInput.focus({ preventScroll: true });
        return;
      }
      renderDecision(evaluate(answers), answers);
    });

    document.querySelector('[data-edit-review]').addEventListener('click', () => {
      form.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      form.querySelector('input, select').focus({ preventScroll: true });
    });

    document.querySelector('[data-clear-draft]').addEventListener('click', () => {
      form.reset();
      safeStorage('remove');
      clearMissingStates();
      resultWrap.hidden = true;
      currentSummary = '';
      updateProgress();
      draftStatus.textContent = 'Saved answers cleared from this browser.';
      form.querySelector('input, select').focus();
    });

    document.querySelector('[data-print-result]').addEventListener('click', () => window.print());

    document.querySelector('[data-copy-result]').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(currentSummary);
        toolFeedback.textContent = 'Summary copied to your clipboard.';
      } catch (error) {
        toolFeedback.textContent = 'Copy was not available in this browser. Download the summary instead.';
      }
    });

    document.querySelector('[data-download-result]').addEventListener('click', () => {
      const blob = new Blob([currentSummary], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `human-review-summary-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toolFeedback.textContent = 'Summary downloaded.';
    });

    restoreDraft();
    updateProgress();
  }

  window.HumanReview = { evaluate, questions };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
}());
