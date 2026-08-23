/* Legacy loader kept only so a raw/local checkout does not animate the old SVG.
   The GitHub Pages build writes the PNG <img> directly into index.html. */
(() => {
  const hero = document.querySelector('[data-oob-hero-svg]');
  if (!hero) return;

  const image = document.createElement('img');
  image.className = 'hero-art__image';
  image.src = '/images/ai-relationship/oob-ai-hero.png';
  image.alt = 'A confused business leader meets with a cheerful AI agent that presents a complicated process as easy.';
  image.width = 1200;
  image.height = 800;
  image.decoding = 'async';
  image.fetchPriority = 'high';
  hero.replaceWith(image);
})();
