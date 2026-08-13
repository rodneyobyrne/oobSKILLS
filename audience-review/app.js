(() => {
  const form = document.getElementById('audience-form');
  const audienceQuestions = document.getElementById('audience-questions');

  if (!form || !audienceQuestions) return;

  const layout = document.createElement('link');
  layout.rel = 'stylesheet';
  layout.href = './layout-v3.css?v=1';
  document.head.appendChild(layout);

  const languageStyles = document.createElement('link');
  languageStyles.rel = 'stylesheet';
  languageStyles.href = './form-language-v5.css?v=3';
  document.head.appendChild(languageStyles);

  const core = document.createElement('script');
  core.src = './app-core.js?v=4';
  core.async = false;
  core.onload = () => {
    const analysis = document.createElement('script');
    analysis.src = './analysis-v5.js?v=2';
    analysis.async = false;
    analysis.onload = () => {
      const flow = document.createElement('script');
      flow.src = './flow-v3.js?v=1';
      flow.async = false;
      flow.onload = () => {
        const language = document.createElement('script');
        language.src = './form-language-v5.js?v=4';
        language.async = false;
        language.onload = () => {
          const guidance = document.createElement('script');
          guidance.src = './form-guidance-v5.js?v=4';
          guidance.async = false;
          guidance.onload = () => {
            const focus = document.createElement('script');
            focus.src = './focus-v3.js?v=1';
            focus.async = false;
            document.body.appendChild(focus);
          };
          document.body.appendChild(guidance);
        };
        document.body.appendChild(language);
      };
      document.body.appendChild(flow);
    };
    document.body.appendChild(analysis);
  };

  document.body.appendChild(core);
})();
