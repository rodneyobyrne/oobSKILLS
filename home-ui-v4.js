(() => {
  const gallery = document.querySelector('[data-review-carousel]');
  if (!gallery) return;

  const navigation = gallery.querySelector('.review-options');
  const options = [...gallery.querySelectorAll('.review-option')];
  const response = document.querySelector('[data-review-response]');
  if (!navigation || !options.length || !response) return;

  /* The old previous/next carousel controls are intentionally retired. */
  gallery.querySelector('.review-carousel__controls')?.remove();

  const stage = document.createElement('section');
  stage.className = 'review-stage oob-drawn-box';
  stage.id = 'review-active-panel';
  stage.setAttribute('role', 'tabpanel');
  stage.setAttribute('aria-live', 'polite');

  const visual = document.createElement('figure');
  visual.className = 'review-stage__visual';
  visual.setAttribute('aria-hidden', 'true');

  const stageImage = document.createElement('img');
  stageImage.className = 'review-stage__image';
  stageImage.alt = '';
  stageImage.decoding = 'async';
  stageImage.draggable = false;
  visual.appendChild(stageImage);

  const content = document.createElement('div');
  content.className = 'review-stage__content';
  content.appendChild(response);

  stage.append(visual, content);
  gallery.insertBefore(stage, navigation);
  gallery.classList.add('is-gallery-ready');

  navigation.setAttribute('role', 'tablist');
  navigation.setAttribute('aria-label', 'Choose the situation that feels closest');

  function optionLabel(option) {
    return option.querySelector('span:last-child')?.textContent.trim() || 'Choose this situation';
  }

  function activate(index) {
    const option = options[index];
    if (!option) return;

    const sourceImage = option.querySelector('.review-option__art');
    options.forEach((item, itemIndex) => {
      const selected = itemIndex === index;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
      item.setAttribute('aria-pressed', selected ? 'true' : 'false');
      item.tabIndex = selected ? 0 : -1;
    });

    if (sourceImage) {
      stageImage.src = sourceImage.currentSrc || sourceImage.getAttribute('src') || '';
      stageImage.classList.toggle('review-stage__image--pose', sourceImage.classList.contains('review-option__art--pose'));
    }

    stage.setAttribute('aria-labelledby', option.id);
  }

  function moveFrom(index, key) {
    const desktopRail = window.matchMedia('(min-width: 981px)').matches;
    const compactGrid = window.matchMedia('(max-width: 380px)').matches;
    let nextIndex = index;

    if (key === 'Home') nextIndex = 0;
    if (key === 'End') nextIndex = options.length - 1;

    if (desktopRail) {
      if (key === 'ArrowDown' || key === 'ArrowRight') nextIndex = Math.min(options.length - 1, index + 1);
      if (key === 'ArrowUp' || key === 'ArrowLeft') nextIndex = Math.max(0, index - 1);
    } else if (compactGrid) {
      if (key === 'ArrowRight') nextIndex = Math.min(options.length - 1, index + 1);
      if (key === 'ArrowLeft') nextIndex = Math.max(0, index - 1);
      if (key === 'ArrowDown') nextIndex = Math.min(options.length - 1, index + 3);
      if (key === 'ArrowUp') nextIndex = Math.max(0, index - 3);
    } else {
      if (key === 'ArrowRight' || key === 'ArrowDown') nextIndex = Math.min(options.length - 1, index + 1);
      if (key === 'ArrowLeft' || key === 'ArrowUp') nextIndex = Math.max(0, index - 1);
    }

    return nextIndex;
  }

  options.forEach((option, index) => {
    option.id = option.id || `review-tab-${index + 1}`;
    option.setAttribute('role', 'tab');
    option.setAttribute('aria-controls', stage.id);
    option.setAttribute('aria-label', optionLabel(option));
    option.setAttribute('aria-selected', 'false');
    option.tabIndex = -1;

    option.addEventListener('click', () => activate(index));
    option.addEventListener('keydown', (event) => {
      const nextIndex = moveFrom(index, event.key);
      if (nextIndex === index && !['Home', 'End'].includes(event.key)) return;
      if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

      event.preventDefault();
      options[nextIndex].focus();
      options[nextIndex].click();
    });
  });

  /* The existing inline response map remains the single source for each
     diagnostic title/copy/link. Triggering the first option synchronizes that
     content with the new active image and selected thumbnail on load. */
  options[0].click();
})();
