(() => {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = './experience.css?v=1';
  document.head.appendChild(css);

  const core = document.createElement('script');
  core.src = './app-core.js?v=1';
  core.async = false;
  core.onload = () => {
    const experience = document.createElement('script');
    experience.src = './experience.js?v=1';
    experience.async = false;
    document.body.appendChild(experience);
  };
  document.body.appendChild(core);
})();
