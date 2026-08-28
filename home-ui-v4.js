(() => {
  const carousel = document.querySelector('[data-review-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('.review-options');
  const previous = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  const status = carousel.querySelector('[data-carousel-status]');
  if (!track || !previous || !next) return;

  function cardStep() {
    const card = track.querySelector('.review-option');
    if (!card) return track.clientWidth * .85;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function updateState() {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const left = track.scrollLeft;
    previous.disabled = left <= 4;
    next.disabled = left >= maxScroll - 4;

    if (status) {
      const cards = [...track.querySelectorAll('.review-option')];
      const trackLeft = track.getBoundingClientRect().left;
      const activeIndex = cards.reduce((best, card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().left - trackLeft);
        return distance < best.distance ? { index, distance } : best;
      }, { index: 0, distance: Infinity }).index;
      status.textContent = `${activeIndex + 1} of ${cards.length}`;
    }
  }

  function move(direction) {
    track.scrollBy({ left: cardStep() * direction, behavior: 'smooth' });
  }

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', () => requestAnimationFrame(updateState), { passive: true });
  window.addEventListener('resize', updateState, { passive: true });

  track.querySelectorAll('.review-option').forEach((card) => {
    card.addEventListener('focus', () => {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    });
  });

  updateState();
})();
