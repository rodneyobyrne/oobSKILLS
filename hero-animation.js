(() => {
  const hero = document.querySelector('[data-oob-hero-svg]');
  if (!hero) return;

  let hasPlayed = false;

  const playHero = () => {
    if (hasPlayed || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const doc = hero.contentDocument;
    if (!doc) return;

    const art = doc.querySelector('#art');
    const thought = doc.querySelector('#thought-text');
    const speech = doc.querySelector('#speech-text');
    const thoughtPaths = [...doc.querySelectorAll('#thought-text .write')];
    const speechPaths = [...doc.querySelectorAll('#speech-text .write')];

    if (!art || !thoughtPaths.length || !speechPaths.length) return;
    hasPlayed = true;

    art.style.animation = 'none';
    if (thought) thought.style.animation = 'none';
    if (speech) speech.style.animation = 'none';

    [...thoughtPaths, ...speechPaths].forEach((path) => {
      path.style.animation = 'none';
      path.style.strokeDashoffset = '1';
    });

    void hero.offsetWidth;

    window.setTimeout(() => {
      art.style.animation = 'wiggle 3.2s ease-in-out .25s infinite';

      thoughtPaths.forEach((path, index) => {
        const delay = .65 + (index * .11);
        path.style.animation = `writeOn .72s cubic-bezier(.2,.75,.25,1) ${delay.toFixed(2)}s forwards`;
      });

      speechPaths.forEach((path, index) => {
        const delay = 2.15 + (index * .12);
        path.style.animation = `writeOn .72s cubic-bezier(.2,.75,.25,1) ${delay.toFixed(2)}s forwards`;
      });

      if (thought) thought.style.animation = 'bubbleWiggle 2.7s ease-in-out 2.2s infinite';
      if (speech) speech.style.animation = 'bubbleWiggle 3s ease-in-out 4.65s infinite reverse';
    }, 320);
  };

  hero.addEventListener('load', playHero, { once: true });

  if (hero.contentDocument?.documentElement) {
    window.setTimeout(playHero, 120);
  }
})();
