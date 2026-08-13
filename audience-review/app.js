(() => {
  const form = document.getElementById('audience-form');
  const primaryQuestions = document.getElementById('audience-primary-questions');
  const decisionQuestions = document.getElementById('audience-decision-questions');

  if (!form || !primaryQuestions || !decisionQuestions) return;

  const layout = document.createElement('link');
  layout.rel = 'stylesheet';
  layout.href = './layout-v3.css?v=1';
  document.head.appendChild(layout);

  const languageStyles = document.createElement('link');
  languageStyles.rel = 'stylesheet';
  languageStyles.href = './form-language-v5.css?v=1';
  document.head.appendChild(languageStyles);

  /*
    app-core.js remains the owner of question definitions and generation.
    This temporary render target sends each generated audience question directly
    into its authoritative static step, preserving the analysis contract while
    avoiding any post-render DOM reparenting.
  */
  const audienceRenderTarget = document.createElement('div');
  audienceRenderTarget.id = 'audience-questions';
  audienceRenderTarget.hidden = true;

  const primaryQuestionIds = new Set(['audience_values', 'audience_trigger']);
  audienceRenderTarget.appendChild = node => {
    const target = primaryQuestionIds.has(node?.dataset?.question)
      ? primaryQuestions
      : decisionQuestions;
    return target.appendChild(node);
  };

  form.appendChild(audienceRenderTarget);

  const core = document.createElement('script');
  core.src = './app-core.js?v=4';
  core.async = false;
  core.onload = () => {
    audienceRenderTarget.remove();

    const analysis = document.createElement('script');
    analysis.src = './analysis-v5.js?v=1';
    analysis.async = false;
    analysis.onload = () => {
      const flow = document.createElement('script');
      flow.src = './flow-v2.js?v=2';
      flow.async = false;
      flow.onload = () => {
        const language = document.createElement('script');
        language.src = './form-language-v5.js?v=1';
        language.async = false;
        language.onload = () => {
          const focus = document.createElement('script');
          focus.src = './focus-v3.js?v=1';
          focus.async = false;
          document.body.appendChild(focus);
        };
        document.body.appendChild(language);
      };
      document.body.appendChild(flow);
    };
    document.body.appendChild(analysis);
  };
  core.onerror = () => audienceRenderTarget.remove();

  document.body.appendChild(core);
})();
