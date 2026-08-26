/* Legacy loader kept only so a raw/local checkout does not animate the old SVG.
   The GitHub Pages build writes the WebP <img> directly into index.html. */
(() => {
  const hero = document.querySelector('[data-oob-hero-svg]');
  if (!hero) return;

  const image = document.createElement('img');
  image.className = 'hero-art__image';
  image.src = '/images/ai-relationship/ai-workflow-map.webp';
  image.alt = 'A business owner and AI assistant map a workflow together, making steps, handoffs and decisions visible.';
  image.width = 1122;
  image.height = 1402;
  image.decoding = 'async';
  image.fetchPriority = 'high';
  hero.replaceWith(image);
})();
