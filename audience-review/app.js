(() => {
  const core = document.createElement('script');
  core.src = './app-core.js?v=4';
  core.async = false;
  core.onload = () => {
    const flow = document.createElement('script');
    flow.src = './flow-v2.js?v=2';
    flow.async = false;
    document.body.appendChild(flow);
  };

  document.body.appendChild(core);
})();
