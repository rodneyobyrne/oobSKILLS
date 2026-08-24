(() => {
  const path = window.location.pathname;

  const cardImages = {
    opportunity: '/images/ai-character/cards/opportunity.png',
    friction: '/images/ai-character/cards/friction.png',
    team: '/images/ai-character/cards/team.png',
    build: '/images/ai-character/cards/build.png',
    control: '/images/ai-character/cards/control.png'
  };

  if (path === '/' || path === '/index.html') {
    const heroImage = document.querySelector('.hero-art__image');
    if (heroImage) {
      heroImage.src = '/images/ai-character/homepage-hero.png';
      heroImage.width = 1400;
      heroImage.height = 744;
    }

    document.querySelectorAll('.review-option').forEach((option) => {
      const key = option.dataset.review;
      const src = cardImages[key];
      if (!src) return;

      option.querySelector('.review-option__art')?.remove();
      const text = option.querySelector('span:last-of-type');
      const image = document.createElement('img');
      image.className = 'review-option__art';
      image.src = src;
      image.width = 720;
      image.height = 720;
      image.loading = 'eager';
      image.decoding = 'async';
      image.alt = `The oobCREATIVE AI character illustrating ${text?.textContent?.trim() || key}.`;

      if (text) option.insertBefore(image, text);
      else option.prepend(image);
    });
  }

  const heroImages = {
    '/practical-ai/': '/images/ai-character/poses/pointing.png',
    '/tools/ai-fit-check/': '/images/ai-character/poses/thinking.png',
    '/tools/human-review-checklist/': '/images/ai-character/poses/waving.png',
    '/tools/ai-pilot-starter/': '/images/ai-character/poses/pointing.png',
    '/assessments/ai-workday-review/': '/images/ai-character/poses/thinking.png',
    '/services/responsible-ai-implementation/': '/images/ai-character/poses/pointing.png',
    '/services/local-ai-systems/': '/images/ai-character/poses/waving.png',
    '/services/ai-receptionist-small-business/': '/images/ai-character/poses/waving.png'
  };

  const heroSrc = heroImages[path];
  if (heroSrc) {
    const current = document.querySelector('.content-hero__art');
    if (current) {
      const image = document.createElement('img');
      image.className = current.className || 'content-hero__art';
      image.src = heroSrc;
      image.width = 720;
      image.height = 720;
      image.loading = 'eager';
      image.decoding = 'async';
      image.alt = 'The established oobCREATIVE AI character representing practical AI support with visible human ownership.';
      current.replaceWith(image);
    }
  }
})();
