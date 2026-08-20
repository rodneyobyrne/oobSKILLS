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

  const resultsStyles = document.createElement('link');
  resultsStyles.rel = 'stylesheet';
  resultsStyles.href = './results-v6.css?v=1';
  document.head.appendChild(resultsStyles);

  const resultsAlignmentStyles = document.createElement('link');
  resultsAlignmentStyles.rel = 'stylesheet';
  resultsAlignmentStyles.href = './results-v7.css?v=1';
  document.head.appendChild(resultsAlignmentStyles);

  const core = document.createElement('script');
  core.src = './app-core.js?v=4';
  core.async = false;
  core.onload = () => {
    const analysis = document.createElement('script');
    analysis.src = './analysis-v5.js?v=2';
    analysis.async = false;
    analysis.onload = () => {
      const relationship = document.createElement('script');
      relationship.src = './relationship-v6.js?v=1';
      relationship.async = false;
      relationship.onload = () => {
        const results = document.createElement('script');
        results.src = './results-v6.js?v=2';
        results.async = false;
        results.onload = () => {
          const websiteField = document.createElement('script');
          websiteField.src = './website-field-v1.js?v=1';
          websiteField.async = false;
          websiteField.onload = () => {
            const flow = document.createElement('script');
            flow.src = './flow-v3.js?v=2';
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
                  const interview = document.createElement('script');
                  interview.src = './interview-v6.js?v=1';
                  interview.async = false;
                  interview.onload = () => {
                    const focus = document.createElement('script');
                    focus.src = './focus-v3.js?v=1';
                    focus.async = false;
                    document.body.appendChild(focus);
                  };
                  document.body.appendChild(interview);
                };
                document.body.appendChild(guidance);
              };
              document.body.appendChild(language);
            };
            document.body.appendChild(flow);
          };
          document.body.appendChild(websiteField);
        };
        document.body.appendChild(results);
      };
      document.body.appendChild(relationship);
    };
    document.body.appendChild(analysis);
  };

  document.body.appendChild(core);
})();
