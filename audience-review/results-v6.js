(() => {
  const previousRenderResults = window.renderResults;

  const esc = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function formatCopy(text) {
    return String(text || '')
      .trim()
      .split(/\n{2,}/)
      .filter(Boolean)
      .map(paragraph => `<p>${esc(paragraph).replaceAll('\n', '<br>')}</p>`)
      .join('');
  }

  function listItems(items = [], className = 'builder-option') {
    return items.filter(Boolean).map(item => `<p class="${className}">${esc(item)}</p>`).join('');
  }

  function firstUseful(...values) {
    return values.find(value => typeof value === 'string' && value.trim())?.trim() || '';
  }

  function renderResultsV6(payload) {
    const results = document.getElementById('results');
    const report = payload?.analysis?.humanReport;

    if (!results || !report?.opening || !report?.communicationRule) {
      if (typeof previousRenderResults === 'function') previousRenderResults(payload);
      return;
    }

    const offerName = report.offerName || payload.offer?.name || 'Your work';
    const resistance = report.opening.resistanceQuestions || [];
    const situations = report.leadWithProblem?.situations || [];
    const risk = report.decisionRisk || {};
    const moves = risk.moves || [];
    const visibility = report.valueVisibility || {};
    const posts = report.publicAdvice?.posts || [];
    const primaryPost = report.publishNow?.copy || posts[0] || '';
    const additionalPosts = posts.filter(post => post && post !== primaryPost).slice(0, 3);
    const messageParts = report.messageParts || {};
    const situationPieces = messageParts.recognizableSituations?.length ? messageParts.recognizableSituations : situations.slice(0, 4);
    const advicePieces = messageParts.usefulAdvice?.length ? messageParts.usefulAdvice : (risk.examples || []).slice(0, 4);
    const simplifyPieces = messageParts.simplerDecision?.length
      ? messageParts.simplerDecision
      : [visibility.use, report.opening.opportunity].filter(Boolean).slice(0, 4);

    const intelligence = payload?.analysis?.audienceIntelligence || {};
    const domain = report.domainModel || intelligence.domainModel || {};
    const relationship = report.relationshipModel || intelligence.relationshipModel || domain.relationshipModel || {};
    const audienceLabel = firstUseful(relationship.audiencePlural, domain.likelyBuyers?.[0], 'the people you serve');
    const customerNeed = firstUseful(domain.customerNeed, domain.commonJobsToBeDone?.[0], report.opening.lead);
    const trigger = firstUseful(domain.triggerSituations?.[0], domain.situations?.[0], situations[0]);
    const privateQuestion = firstUseful(domain.commonTrustQuestions?.[0], domain.resistance?.[0], resistance[0]);
    const hasSnapshot = Boolean(customerNeed || trigger || privateQuestion);

    results.innerHTML = `
      <header class="results-v6-header">
        <div>
          <p class="results-v6-kicker">Audience communication review</p>
          <h3>${esc(offerName)}</h3>
        </div>
        <p class="results-v6-thesis">${esc(report.opening.lead)}</p>
      </header>

      ${hasSnapshot ? `
        <section class="audience-snapshot" aria-label="Refined audience picture">
          <article class="audience-snapshot-card">
            <span class="audience-snapshot-label">Who this appears to be about</span>
            <h4>${esc(audienceLabel)}</h4>
            ${customerNeed ? `<p>${esc(customerNeed)}</p>` : ''}
          </article>
          <article class="audience-snapshot-card">
            <span class="audience-snapshot-label">When the conversation often starts</span>
            <h4>The recognizable situation</h4>
            ${trigger ? `<p>${esc(trigger)}</p>` : ''}
          </article>
          <article class="audience-snapshot-card">
            <span class="audience-snapshot-label">What may already be in their head</span>
            <h4>The decision underneath the transaction</h4>
            ${privateQuestion ? `<p class="audience-snapshot-question">${esc(privateQuestion)}</p>` : ''}
          </article>
        </section>
      ` : ''}

      ${primaryPost ? `
        <section class="publish-now" aria-label="Publish-ready communication example">
          <div class="publish-now-meta">
            <p class="publish-now-label">YOU CAN POST THIS NOW</p>
            <p class="publish-now-note">Finished outward-facing communication</p>
          </div>
          <div class="publish-now-copy">${formatCopy(primaryPost)}</div>
        </section>
      ` : ''}

      <section class="results-v6-section">
        <div class="results-v6-section-heading">
          <p class="results-v6-section-label">Why this works</p>
          <h4>The message starts with the decision already happening in their head.</h4>
        </div>
        <div class="results-v6-body">
          <p>${esc(report.opening.capabilityContrast || '')}</p>
          ${resistance.length ? `
            <p><strong>The questions underneath the decision are more likely to sound like this:</strong></p>
            <div class="resistance-grid">
              ${resistance.map(item => `<p class="resistance-question">${esc(item)}</p>`).join('')}
            </div>
          ` : ''}
        </div>
      </section>

      <section class="results-v6-section">
        <div class="results-v6-section-heading">
          <p class="results-v6-section-label">Build another version</p>
          <h4>Keep the structure. Swap the parts.</h4>
        </div>
        <div class="builder-grid">
          <article class="builder-part">
            <p class="builder-step">01 · Recognizable situation</p>
            <h5>Start where they already are.</h5>
            <div class="builder-options">${listItems(situationPieces.slice(0, 4))}</div>
          </article>
          <article class="builder-part">
            <p class="builder-step">02 · Useful advice</p>
            <h5>Give them something before asking for anything.</h5>
            <div class="builder-options">${listItems(advicePieces.slice(0, 4))}</div>
          </article>
          <article class="builder-part">
            <p class="builder-step">03 · Simpler decision</p>
            <h5>Show how you reduce uncertainty.</h5>
            <div class="builder-options">${listItems(simplifyPieces.slice(0, 4))}</div>
          </article>
        </div>
      </section>

      ${additionalPosts.length ? `
        <section class="results-v6-section">
          <div class="results-v6-section-heading">
            <p class="results-v6-section-label">More ready-to-use copy</p>
            <h4>Complete examples, clearly separated from the explanation.</h4>
          </div>
          <div class="copy-examples">
            ${additionalPosts.map((post, index) => `
              <article class="copy-example">
                <div class="copy-example-head">
                  <span class="copy-example-label">COPY / PASTE EXAMPLE</span>
                  <span class="copy-example-number">${String(index + 2).padStart(2, '0')}</span>
                </div>
                <div class="copy-example-body">${formatCopy(post)}</div>
              </article>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <section class="results-v6-section">
        <div class="results-v6-section-heading">
          <p class="results-v6-section-label">Make your values visible</p>
          <h4>${esc(risk.title || visibility.title || 'Turn your standards into something people can recognize.')}</h4>
        </div>
        <div class="results-v6-body">
          ${risk.intro ? `<p>${esc(risk.intro)}</p>` : ''}
          ${moves.length ? `
            <div class="value-moves">
              ${moves.map(move => `
                <div class="value-move">
                  <strong>${esc(move.value)}</strong>
                  <p>Help the person ${esc(move.benefit)}. Make it visible by ${esc(move.proof)}.</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${(visibility.avoid || visibility.use) ? `
            <div class="compare-language">
              <div class="compare-side is-generic">
                <span class="compare-label">Avoid generic</span>
                <p>${esc(visibility.avoid || '')}</p>
              </div>
              <div class="compare-side is-use">
                <span class="compare-label">Move toward</span>
                <p>${esc(visibility.use || '')}</p>
              </div>
            </div>
          ` : ''}
        </div>
      </section>

      <section class="communication-rule">
        <p class="results-v6-section-label">Your communication rule</p>
        <h4>${esc(report.communicationRule.pattern)}</h4>
        <p>${esc(report.communicationRule.guidance)}</p>
        <blockquote>${esc(report.communicationRule.desiredThought)}</blockquote>
        <p><strong>${esc(report.communicationRule.valuesClosing)}</strong></p>
      </section>

      <p class="results-v6-privacy">This review uses high-probability patterns about the field, relationship dynamics, behavioral decision patterns, and the survey evidence you provided. It is intended to improve communication, not diagnose individuals, stereotype an audience, or assume every person will respond in the same way.</p>

      <aside class="results-v6-next-step">
        <p class="results-v6-section-label">Optional human support</p>
        <h4>Use the review first. Add help where the message or experience is still stuck.</h4>
        <p>This result is yours to use without a consultation. If you want support applying it to an offer, website or customer journey, choose a defined service path after you know what needs to change.</p>
        <a class="button secondary" href="/services/">See ways to work together</a>
      </aside>
    `;
  }

  window.renderResults = renderResultsV6;
})();
