/* Legacy loader kept only so a raw/local checkout does not animate the old SVG.
   The GitHub Pages build writes the WebP <img> directly into index.html. */
(() => {
  const hero = document.querySelector('[data-oob-hero-svg]');
  if (!hero) return;

  const image = document.createElement('img');
  image.className = 'hero-art__image';
  image.src = '/images/ai-character/poses/robot-confident.webp';
  image.alt = 'The oobCREATIVE robot stands beside the homepage introduction.';
  image.width = 305;
  image.height = 526;
  image.decoding = 'async';
  image.fetchPriority = 'high';
  hero.replaceWith(image);
})();
