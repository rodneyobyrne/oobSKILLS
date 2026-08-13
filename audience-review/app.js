(() => {
  const loadCSS = href => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  loadCSS('./experience.css?v=3');
  loadCSS('./flow-v2.css?v=1');

  const core = document.createElement('script');
  core.src = './app-core.js?v=3';
  core.async = false;
  core.onload = () => {
    const flow = document.createElement('script');
    flow.src = './flow-v2.js?v=1';
    flow.async = false;
    document.body.appendChild(flow);
  };

  document.body.appendChild(core);
})();
