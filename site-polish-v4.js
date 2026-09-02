(() => {
  /* Image hierarchy is authored directly in HTML. This only removes stale legacy pose markup. */
  document.querySelectorAll('.content-hero__art').forEach((art) => {
    art.remove();
    document.querySelector('.content-hero__inner')?.classList.remove('has-ai-art');
  });

  const cards = [...document.querySelectorAll('.review-path-card')];
  if (!cards.length) return;

  /* Build a visual-only reveal from the already-crawlable supporting paragraph.
     This avoids duplicating the public content in source HTML. */
  for (const card of cards) {
    const front = card.querySelector('.review-path-card__front');
    const source = card.querySelector('.review-path-card__panel > p:not(.eyebrow):not(.review-path-card__hint)');
    if (!front || !source || front.querySelector('.review-path-card__reveal')) continue;

    const reveal = document.createElement('div');
    reveal.className = 'review-path-card__reveal';
    reveal.setAttribute('aria-hidden', 'true');

    const message = document.createElement('p');
    message.textContent = source.textContent.trim();
    reveal.append(message);
    front.append(reveal);
  }

  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0;

  function clearScrollState() {
    cards.forEach((card) => card.classList.remove('is-scroll-active'));
  }

  function updateScrollState() {
    frame = 0;

    /* Desktop/fine-pointer devices use hover/focus instead of scroll state. */
    if (fineHover.matches) {
      clearScrollState();
      return;
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const focusY = viewportHeight * 0.47;
    const zoneTop = viewportHeight * 0.24;
    const zoneBottom = viewportHeight * 0.76;
    let active = null;
    let nearest = Number.POSITIVE_INFINITY;

    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      if (rect.bottom < zoneTop || rect.top > zoneBottom) continue;

      const cardCenter = rect.top + rect.height / 2;
      const distance = Math.abs(cardCenter - focusY);
      if (distance < nearest) {
        nearest = distance;
        active = card;
      }
    }

    for (const card of cards) {
      card.classList.toggle('is-scroll-active', card === active);
    }
  }

  function requestScrollState() {
    if (frame) return;
    frame = window.requestAnimationFrame(updateScrollState);
  }

  window.addEventListener('scroll', requestScrollState, { passive: true });
  window.addEventListener('resize', requestScrollState, { passive: true });
  fineHover.addEventListener?.('change', requestScrollState);

  requestScrollState();
})();
