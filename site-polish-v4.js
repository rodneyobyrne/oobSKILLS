(() => {
  /* Image hierarchy is authored directly in HTML. This only removes stale legacy pose markup. */
  document.querySelectorAll('.content-hero__art').forEach((art) => {
    art.remove();
    document.querySelector('.content-hero__inner')?.classList.remove('has-ai-art');
  });

  /* AI Fit Check: preserve the existing sticky decision note exactly as-is and
     add the human invitation inside that same content block. */
  const fitForm = document.querySelector('[data-fit-form]');
  if (fitForm) {
    const supportLink = document.querySelector('[data-fit-support-link]');
    const setPracticalAiLink = () => {
      if (!supportLink) return;
      supportLink.href = '/practical-ai/';
      supportLink.innerHTML = 'Find more Practical AI Tool <span aria-hidden="true">→</span>';
    };

    /* The page's own result logic updates this href during submit. Register this
       after it so the persistent browse-more link wins without changing scoring. */
    setPracticalAiLink();
    fitForm.addEventListener('submit', setPracticalAiLink);

    /* Result transition: the page calculates and positions the result normally,
       then a short white wash masks that jump while the existing oob loader runs. */
    const fitResult = document.querySelector('[data-fit-result]');
    const fitValidation = document.querySelector('[data-fit-validation]');
    const reduceResultMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const loaderSrc = '/branding/oob-box-loader-white.svg?v=20260903-fit-transition';
    const loaderPreload = new Image();
    loaderPreload.src = loaderSrc;

    const resultWash = document.createElement('div');
    resultWash.hidden = true;
    resultWash.setAttribute('aria-hidden', 'true');
    Object.assign(resultWash.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '10000',
      display: 'grid',
      placeItems: 'center',
      background: '#fff',
      opacity: '0',
      pointerEvents: 'none',
      transition: 'opacity 280ms cubic-bezier(.2,.78,.22,1)'
    });

    const loaderSlot = document.createElement('div');
    Object.assign(loaderSlot.style, {
      width: 'min(210px, 42vw)',
      opacity: '0',
      transition: 'opacity 160ms ease'
    });
    resultWash.append(loaderSlot);
    document.body.append(resultWash);

    let transitionTimers = [];
    const clearTransitionTimers = () => {
      transitionTimers.forEach((timer) => window.clearTimeout(timer));
      transitionTimers = [];
    };

    const runResultTransition = () => {
      if (reduceResultMotion.matches) return;

      clearTransitionTimers();
      loaderSlot.replaceChildren();
      loaderSlot.style.opacity = '0';
      resultWash.style.transition = 'none';
      resultWash.style.opacity = '0';
      resultWash.style.pointerEvents = 'auto';
      resultWash.hidden = false;

      /* Force the reset frame so repeat submissions restart the wash cleanly. */
      resultWash.getBoundingClientRect();
      resultWash.style.transition = 'opacity 280ms cubic-bezier(.2,.78,.22,1)';
      window.requestAnimationFrame(() => {
        resultWash.style.opacity = '1';
      });

      transitionTimers.push(window.setTimeout(() => {
        const loader = document.createElement('img');
        loader.src = loaderSrc;
        loader.alt = '';
        loader.setAttribute('aria-hidden', 'true');
        loader.style.display = 'block';
        loader.style.width = '100%';
        loader.style.height = 'auto';
        loaderSlot.replaceChildren(loader);
        loaderSlot.style.opacity = '1';

        transitionTimers.push(window.setTimeout(() => {
          loaderSlot.style.opacity = '0';
          resultWash.style.opacity = '0';

          transitionTimers.push(window.setTimeout(() => {
            resultWash.hidden = true;
            resultWash.style.pointerEvents = 'none';
            loaderSlot.replaceChildren();
          }, 300));
        }, 1500));
      }, 280));
    };

    fitForm.addEventListener('submit', () => {
      /* Wait until the page's own submit handler has either exposed validation
         or generated the result. Invalid submissions remain immediate. */
      queueMicrotask(() => {
        setPracticalAiLink();
        if (!fitResult || fitResult.hidden) return;
        if (fitValidation && !fitValidation.hidden) return;
        runResultTransition();
      });
    });

    const decisionNote = document.querySelector('.fit-check-section .decision-note');
    if (decisionNote && !decisionNote.querySelector('[data-fit-human-invite]')) {
      const eyebrow = document.createElement('p');
      eyebrow.className = 'meta fit-human-eyebrow';
      eyebrow.dataset.fitHumanInvite = 'true';
      eyebrow.textContent = 'Talk it through';

      const heading = document.createElement('h3');
      heading.className = 'fit-human-heading';
      heading.textContent = 'Sit with a real human.';

      const philosophy = document.createElement('p');
      philosophy.className = 'fit-human-philosophy';
      philosophy.textContent = 'oobCREATIVE helps people clarify what they do, communicate it clearly, and build practical systems that make the work easier to carry forward.';

      const invite = document.createElement('p');
      invite.className = 'fit-human-invite';
      invite.textContent = 'Bring the question you’re working through. We’ll sit with it together for 30 minutes—free.';

      const link = document.createElement('a');
      link.className = 'button button--blue fit-human-link';
      link.href = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3xFuWW4Hc02uVylPRSR0Yy2VRTdB0KiHxafLVqOWQs5zrRdHDtEE0ZWqF6b9m4niDk0QLlI9gJ?gv=true';
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Schedule a free 30-minute conversation';

      decisionNote.append(eyebrow, heading, philosophy, invite, link);
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
