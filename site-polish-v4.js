(() => {
  const path = window.location.pathname;

  /*
   * Front-end image hierarchy:
   * 1. Heroes: detailed scene PNGs with enough room to read the situation.
   * 2. H2 lockups: simple solo oob AI robot pose PNGs only.
   * 3. Five homepage choice tiles: experience/situation illustrations, not robot poses.
   * Generic robot poses are never promoted into page heroes.
   */

  const experienceImages = {
    opportunity: '/images/ai-relationship-v2/opportunity.png',
    friction: '/images/ai-relationship-v2/friction.png',
    team: '/images/ai-relationship-v2/team.png',
    build: '/images/ai-relationship-v2/build.png',
    control: '/images/ai-relationship-v2/control.png'
  };

  const poseImages = {
    pointing: '/images/ai-character/poses/pointing.png',
    thinking: '/images/ai-character/poses/thinking.png',
    waving: '/images/ai-character/poses/waving.png'
  };

  function poseForHeading(text = '') {
    const normalized = text.toLowerCase();
    if (/question|measure|decision|clarity|understand|review/.test(normalized)) return 'thinking';
    if (/call|customer|human|together|support/.test(normalized)) return 'waving';
    return 'pointing';
  }

  document.querySelectorAll('.section-lockup').forEach((lockup) => {
    const image = lockup.querySelector('.section-lockup__art img');
    const heading = lockup.querySelector('h2');
    if (!image || !heading) return;

    const pose = poseForHeading(heading.textContent || '');
    image.src = poseImages[pose];
    image.width = 720;
    image.height = 720;
    image.alt = '';
    image.loading = lockup.classList.contains('section-lockup--compact') ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.dataset.visualRole = 'headline-pose';
  });

  if (path === '/' || path === '/index.html') {
    document.querySelectorAll('.review-option').forEach((option) => {
      const key = option.dataset.review;
      const src = experienceImages[key];
      if (!src) return;

      option.querySelector('.review-option__art')?.remove();
      const text = option.querySelector('span:last-of-type');
      const image = document.createElement('img');
      image.className = 'review-option__art';
      image.src = src;
      image.width = 1254;
      image.height = 1254;
      image.loading = 'eager';
      image.decoding = 'async';
      image.alt = `Illustrated business situation for ${text?.textContent?.trim() || key}.`;
      image.dataset.visualRole = 'experience';

      if (text) option.insertBefore(image, text);
      else option.prepend(image);
    });
  }

  /* Remove any stale generic pose that may have been injected by an older cached script. */
  document.querySelectorAll('.content-hero__art').forEach((art) => {
    const src = art.getAttribute('src') || '';
    if (src.includes('/images/ai-character/poses/') || art.className.includes('content-hero__art--')) {
      art.remove();
      document.querySelector('.content-hero__inner')?.classList.remove('has-ai-art');
    }
  });
})();
