(() => {
  /* Image hierarchy is authored directly in HTML. This only removes stale legacy pose markup. */
  document.querySelectorAll('.content-hero__art').forEach((art) => {
    art.remove();
    document.querySelector('.content-hero__inner')?.classList.remove('has-ai-art');
  });

  /* AI Fit Check: keep the generated result focused on the recommendation itself.
     The broader human invitation belongs in the persistent right rail, below the
     practical limitation note, rather than in the result output. */
  const fitForm = document.querySelector('[data-fit-form]');
  if (fitForm) {
    document.querySelector('.fit-result-plan')?.remove();

    const decisionNote = document.querySelector('.fit-check-section .decision-note');
    if (decisionNote && !document.querySelector('.fit-side-rail')) {
      const rail = document.createElement('div');
      rail.className = 'fit-side-rail';
      decisionNote.replaceWith(rail);
      rail.append(decisionNote);

      const cta = document.createElement('section');
      cta.className = 'fit-human-cta';
      cta.setAttribute('aria-labelledby', 'fit-human-cta-title');
      cta.innerHTML = `
        <p class="meta">Talk it through</p>
        <h3 id="fit-human-cta-title">Sit with a real human.</h3>
        <p>oobCREATIVE helps people clarify what they do, communicate it clearly, and build practical systems that make the work easier to carry forward.</p>
        <p class="fit-human-cta__invite">Bring the question you're working through. We’ll sit with it together for 30 minutes—free.</p>
        <a class="button button--blue" href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3xFuWW4Hc02uVylPRSR0Yy2VRTdB0KiHxafLVqOWQs5zrRdHDtEE0ZWqF6b9m4niDk0QLlI9gJ?gv=true" target="_blank" rel="noopener">Schedule a free 30-minute conversation</a>`;
      rail.append(cta);
    }
  }

  const cards = [...document.querySelectorAll('.review-path-card')];
  if (!cards.length) return;

  /* Build a visual-only reveal from the already-crawlable supporting paragraph.
     The reveal belongs only to the middle text panel: the illustration above
     and the useful-first-move CTA strip below remain visible at all times. */
  for (const card of cards) {
    const panel = card.querySelector('.review-path-card__panel');
    const source = card.querySelector('.review-path-card__panel > p:not(.eyebrow):not(.review-path-card__hint)');
    if (!panel || !source || panel.querySelector('.review-path-card__reveal')) continue;

    /* Make the text panel the positioning/clipping context for its reveal. */
    panel.style.position = 'relative';
    panel.style.overflow = 'hidden';
    panel.style.isolation = 'isolate';

    const reveal = document.createElement('div');
    reveal.className = 'review-path-card__reveal';
    reveal.setAttribute('aria-hidden', 'true');

    const message = document.createElement('p');
    message.textContent = source.textContent.trim();
    reveal.append(message);
    panel.append(reveal);
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
