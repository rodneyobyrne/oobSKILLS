(() => {
  const previousRenderResults = window.renderResults;
  if (typeof previousRenderResults !== 'function') return;

  const esc = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const asList = value => Array.isArray(value) ? value.filter(Boolean) : [];

  function renderNicheResult(payload) {
    previousRenderResults(payload);

    const results = document.getElementById('results');
    const report = payload?.analysis?.humanReport || {};
    const intelligence = payload?.analysis?.audienceIntelligence || {};
    const domain = report.domainModel || intelligence.domainModel || {};
    const niche = intelligence.nicheContext || domain.nicheContext || payload?.preInterviewContext?.domainModel?.nicheContext || null;
    const mirror = report.nicheMirror || window.audienceStep1Context?.nicheMirror || null;
    if (!results || !niche) return;

    const headerKicker = results.querySelector('.results-v6-kicker');
    if (headerKicker) headerKicker.textContent = 'Your niche map';

    const thesis = results.querySelector('.results-v6-thesis');
    if (thesis && mirror?.principle) thesis.textContent = mirror.principle;

    const existing = results.querySelector('.niche-map-v8');
    if (existing) existing.remove();

    const dimensions = asList(niche.dimensions).slice(0, 5);
    const variations = asList(niche.meaningfulAudienceDifferences).slice(0, 4);
    const useful = asList(niche.unusuallyUsefulWhere).slice(0, 4);

    const section = document.createElement('section');
    section.className = 'niche-map-v8';
    section.setAttribute('aria-label', 'Niche map');
    section.innerHTML = `
      <div class="niche-map-v8-heading">
        <p class="results-v6-section-label">Where the pattern starts to get interesting</p>
        <h4>Your niche is the overlap, not a smaller category.</h4>
        <p>${esc(mirror?.close || 'Look for the overlap between the work you do especially well, the work you want more of, and the people or problems that have the strongest reason to value those differences.')}</p>
      </div>
      <div class="niche-map-v8-grid">
        <article>
          <span class="audience-snapshot-label">The worlds your work crosses</span>
          <div class="niche-tags">
            ${dimensions.map(item => `<span>${esc(item.label || item.id)}</span>`).join('')}
          </div>
        </article>
        <article>
          <span class="audience-snapshot-label">Your audience is not one thing</span>
          <ul>${variations.map(item => `<li>${esc(item)}</li>`).join('')}</ul>
        </article>
        <article>
          <span class="audience-snapshot-label">Where your differences may matter most</span>
          <ul>${useful.map(item => `<li>${esc(item)}</li>`).join('')}</ul>
        </article>
      </div>
    `;

    const header = results.querySelector('.results-v6-header');
    if (header) header.insertAdjacentElement('afterend', section);
    else results.prepend(section);
  }

  window.renderResults = renderNicheResult;
})();
