(() => {
  const controls = [...document.querySelectorAll('.voice-play[data-audio]')];
  if (!controls.length) return;

  let activeAudio = null;
  let activeControl = null;

  const idleLabel = (control) => control.closest('[lang="es"]') ? 'Reproducir' : 'Play';
  const pauseLabel = (control) => control.closest('[lang="es"]') ? 'Pausar' : 'Pause';

  const setIdle = (control) => {
    control.setAttribute('aria-pressed', 'false');
    control.querySelector('.voice-play__text').textContent = idleLabel(control);
  };

  const setPlaying = (control) => {
    control.setAttribute('aria-pressed', 'true');
    control.querySelector('.voice-play__text').textContent = pauseLabel(control);
  };

  controls.forEach((control) => {
    const audio = document.getElementById(control.dataset.audio);
    if (!audio) return;

    setIdle(control);

    control.addEventListener('click', async () => {
      if (activeAudio === audio && !audio.paused) {
        audio.pause();
        return;
      }

      if (activeAudio && activeAudio !== audio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      }

      try {
        await audio.play();
      } catch {
        setIdle(control);
      }
    });

    audio.addEventListener('play', () => {
      if (activeControl && activeControl !== control) setIdle(activeControl);
      activeAudio = audio;
      activeControl = control;
      setPlaying(control);
    });

    audio.addEventListener('pause', () => setIdle(control));
    audio.addEventListener('ended', () => {
      audio.currentTime = 0;
      setIdle(control);
      if (activeAudio === audio) {
        activeAudio = null;
        activeControl = null;
      }
    });
  });
})();
