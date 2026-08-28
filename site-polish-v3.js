(() => {
  const path = window.location.pathname;

  if (path === '/' || path === '/index.html') {
    const reviewGroup = document.querySelector('.review-options');
    if (reviewGroup) reviewGroup.setAttribute('aria-label', 'Choose the AI, workflow, customer-contact, website, idea or founder-capacity problem that best matches your current need');

    const headingWrap = document.querySelector('.review-panel__heading');
    if (headingWrap && !headingWrap.querySelector('.review-panel__prompt')) {
      const prompt = document.createElement('p');
      prompt.className = 'review-panel__prompt';
      prompt.textContent = 'Choose the situation closest to what is happening now. Each option points to a practical diagnostic before implementation.';
      headingWrap.append(prompt);
    }

    /* Card outlines now come from branding/components.css so the live homepage,
       /branding reference and later sitewide rollout all use the same line math. */

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
})();
