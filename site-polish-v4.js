(() => {
  const SPRITE = '/images/ai-character/poses.png';
  const CELL = 720;
  const SPRITE_WIDTH = 5760;

  function makeSpriteSvg(cellIndex, className, label) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', className);
    svg.setAttribute('viewBox', `0 0 ${CELL} ${CELL}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', label);

    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('href', SPRITE);
    image.setAttribute('x', String(-CELL * cellIndex));
    image.setAttribute('y', '0');
    image.setAttribute('width', String(SPRITE_WIDTH));
    image.setAttribute('height', String(CELL));
    image.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    svg.append(image);
    return svg;
  }

  const path = window.location.pathname;

  if (path === '/' || path === '/index.html') {
    const cardCells = {
      opportunity: 0,
      friction: 1,
      team: 2,
      build: 3,
      control: 4
    };

    document.querySelectorAll('.review-option').forEach((option) => {
      const key = option.dataset.review;
      if (!(key in cardCells)) return;
      const existing = option.querySelector('.review-option__art');
      if (existing) existing.remove();
      const text = option.querySelector('span:last-of-type');
      const art = makeSpriteSvg(
        cardCells[key],
        'review-option__art',
        `The oobCREATIVE AI character illustrating ${text?.textContent?.trim() || key}.`
      );
      if (text) option.insertBefore(art, text);
      else option.prepend(art);
    });
  }

  const heroCells = {
    '/practical-ai/': 5,
    '/tools/ai-fit-check/': 6,
    '/tools/human-review-checklist/': 7,
    '/tools/ai-pilot-starter/': 5,
    '/assessments/ai-workday-review/': 6,
    '/services/responsible-ai-implementation/': 5,
    '/services/local-ai-systems/': 7,
    '/services/ai-receptionist-small-business/': 7
  };

  if (path in heroCells) {
    const current = document.querySelector('.content-hero__art');
    if (current) {
      const replacement = makeSpriteSvg(
        heroCells[path],
        current.className || 'content-hero__art',
        'The established oobCREATIVE AI character representing practical AI support with visible human ownership.'
      );
      current.replaceWith(replacement);
    }
  }
})();
