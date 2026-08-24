(() => {
  const path = window.location.pathname;

  if (path === '/' || path === '/index.html') {
    const heroImage = document.querySelector('.hero-art__image');
    if (heroImage) {
      heroImage.src = '/images/ai-character/homepage-hero.png';
      heroImage.width = 1400;
      heroImage.height = 744;
      heroImage.alt = 'A business owner sorts through a confusing workload while the oobCREATIVE AI character points toward a short, human-reviewed checklist.';
    }

    const heading = document.querySelector('#review-question');
    if (heading) heading.textContent = 'Which problem feels most familiar right now?';

    const reviewGroup = document.querySelector('.review-options');
    if (reviewGroup) reviewGroup.setAttribute('aria-label', 'Choose the problem that feels most familiar right now');

    const headingWrap = document.querySelector('.review-panel__heading');
    if (headingWrap && !headingWrap.querySelector('.review-panel__prompt')) {
      const prompt = document.createElement('p');
      prompt.className = 'review-panel__prompt';
      prompt.textContent = 'Choose the one that sounds most like what is getting in your way. We’ll show you a useful first move.';
      headingWrap.append(prompt);
    }

    const labels = {
      opportunity: 'Find what’s useful.',
      friction: 'Make work easier.',
      team: 'Set better boundaries.',
      build: 'Build what felt out of reach.',
      control: 'Keep more control.'
    };

    document.querySelectorAll('.review-option').forEach((option) => {
      const textSpan = option.querySelector('span:last-of-type');
      if (textSpan && labels[option.dataset.review]) textSpan.textContent = labels[option.dataset.review];

      if (!option.querySelector('.review-option__outline')) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'review-option__outline');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('aria-hidden', 'true');
        const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        outline.setAttribute('pathLength', '100');
        outline.setAttribute('d', 'M2.5 3.5 C18 1.5 31 3.2 47 2.4 C63 4 79 1.6 97 3.8 C98.6 20 97 35 98 51 C97 68 99 83 96.5 97 C79 98 63 96 48 97.8 C32 96 17 98.5 3.2 96 C1.6 80 3.2 65 2.4 50 C3.4 34 1.6 19 2.5 3.5 Z');
        svg.append(outline);
        option.append(svg);
      }
    });

    const useNow = document.querySelector('#use-now-heading')?.closest('section');
    if (useNow && !useNow.querySelector('.free-tool-note')) {
      const sideNote = useNow.querySelector('.section-side-note');
      const grid = useNow.querySelector('.content-grid');
      if (sideNote && grid) {
        const note = document.createElement('div');
        note.className = 'free-tool-note';
        const text = document.createElement('p');
        text.textContent = sideNote.textContent.trim();
        const link = document.createElement('a');
        link.className = 'text-link';
        link.href = '/free-tools/';
        link.innerHTML = 'Browse all free tools <span aria-hidden="true">→</span>';
        note.append(text, link);
        grid.after(note);
        sideNote.remove();
      }
    }
  }

  const aiHeroPoses = {
    '/practical-ai/': 'pointing',
    '/tools/ai-fit-check/': 'thinking',
    '/tools/human-review-checklist/': 'waving',
    '/tools/ai-pilot-starter/': 'pointing',
    '/assessments/ai-workday-review/': 'thinking',
    '/services/responsible-ai-implementation/': 'pointing',
    '/services/local-ai-systems/': 'waving',
    '/services/ai-receptionist-small-business/': 'waving'
  };

  const pose = aiHeroPoses[path];
  if (pose) {
    const inner = document.querySelector('.content-hero__inner');
    if (inner && !inner.querySelector('.content-hero__art')) {
      inner.classList.add('has-ai-art');
      const art = document.createElement('div');
      art.className = `content-hero__art content-hero__art--${pose}`;
      art.setAttribute('role', 'img');
      art.setAttribute('aria-label', 'The established oobCREATIVE AI character, representing practical AI support with visible human ownership.');
      const aside = inner.querySelector('.content-hero__aside');
      if (aside) inner.insertBefore(art, aside);
      else inner.append(art);
    }
  }
})();
