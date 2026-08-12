(() => {
  function loadStylesheet(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  loadStylesheet('./experience.css?v=1');
  loadStylesheet('./validation.css?v=1');

  function loadScript(src, onload) {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = onload;
    document.body.appendChild(script);
  }

  loadScript('./app-core.js?v=1', () => {
    loadScript('./validation.js?v=1', () => {
      loadScript('./experience.js?v=1');
    });
  });
})();
