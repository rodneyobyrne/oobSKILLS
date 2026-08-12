(() => {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = './experience.css?v=2';
  document.head.appendChild(css);

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
