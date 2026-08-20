(() => {
  const form = document.getElementById('audience-form');
  const offerInput = document.getElementById('offer');
  const websiteInput = document.getElementById('website');
  const step2 = document.querySelector('.step[data-step="2"]');

  if (!form || !offerInput || !step2) return;

  let cachedSignature = '';
  let cachedContext = null;
  let activeRequest = null;

  const esc = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const asList = value => Array.isArray(value) ? value.filter(Boolean) : [];
  const selectedOne = name => document.querySelector(`input[name="${name}"]:checked`)?.value || null;
  const firstUseful = (...values) => values.find(value => typeof value === 'string' && value.trim())?.trim() || '';

  function buildPreviewPayload() {
    return {
      schemaVersion: '4.0',
      reviewType: 'audience_behavioral_analysis',
      analysisStage: 'pre_interview_context',
      offer: {
        name: offerInput.value.trim(),
        type: selectedOne('offer_type'),
        website: websiteInput?.value.trim() || null
      },
      audienceEvidence: {
        values: [],
        triggerContext: [],
        emotionalState: [],
        decisionNeeds: [],
        resistanceSignals: [],
        desiredMovement: []
      },
      businessEvidence: {
        providerValues: [],
        intendedMessage: []
      },
      createdAt: new Date().toISOString()
    };
  }

  function signatureFor(payload) {
    return JSON.stringify(payload.offer);
  }

  function fallbackAnalysis(payload, error = null) {
    const local = typeof window.buildLocalAudienceAnalysis === 'function'
      ? window.buildLocalAudienceAnalysis(payload)
      : null;

    if (local) {
      if (error) {
        local.audienceIntelligence = local.audienceIntelligence || {};
        local.audienceIntelligence.previewAnalysisError = String(error.message || error);
      }
      return local;
    }

    const domainModel = typeof window.buildAudienceDomainModel === 'function'
      ? window.buildAudienceDomainModel(payload)
      : { normalizedTitle: payload.offer.name, family: 'general' };

    return {
      status: 'complete',
      source: 'local_step1_context_v8',
      generatedAt: new Date().toISOString(),
      humanReport: { domainModel },
      audienceIntelligence: { domainModel }
    };
  }

  function websiteEvidenceWasUsed(payload, analysis, domain) {
    if (!payload.offer.website) return false;
    const intelligence = analysis?.audienceIntelligence || {};
    const basis = [
      domain?.evidenceBasis,
      domain?.inferenceLevel,
      domain?.nicheContext?.evidenceBasis,
      intelligence?.providerEvidence?.evidenceBasis,
      intelligence?.observedEvidence?.evidenceBasis
    ].filter(Boolean).join(' ');

    if (/website evidence|public page evidence|retrieved website|retrieved public|public evidence/i.test(basis)) return true;
    if (intelligence?.providerEvidence?.website?.retrieved === true) return true;
    if (intelligence?.observedEvidence?.website?.retrieved === true) return true;
    return false;
  }

  function buildContext(payload, analysis) {
    const intelligence = analysis?.audienceIntelligence || {};
    const report = analysis?.humanReport || {};
    const domainModel = intelligence.domainModel || report.domainModel || (
      typeof window.buildAudienceDomainModel === 'function' ? window.buildAudienceDomainModel(payload) : {}
    );
    const relationshipModel = intelligence.relationshipModel || report.relationshipModel || domainModel.relationshipModel || null;

    const mirror = report.nicheMirror || (
      typeof window.buildAudienceNicheMirror === 'function'
        ? window.buildAudienceNicheMirror(payload, analysis)
        : null
    ) || {
      title: 'FIND YOUR NICHE',
      principle: 'Finding your niche is not about putting yourself in a smaller box. It is about finding where you are unusually useful.',
      opening: `People looking for ${payload.offer.name} may use the same words for very different problems. You already know they are not all the same.`,
      worldLine: '',
      audienceVariations: asList(domainModel.nicheContext?.meaningfulAudienceDifferences).slice(0, 3),
      situations: asList(domainModel.nicheContext?.likelyAudienceSituations).slice(0, 3),
      unusuallyUsefulWhere: asList(domainModel.nicheContext?.unusuallyUsefulWhere).slice(0, 3),
      close: 'This worksheet helps us connect what you do especially well with the people and problems that have the strongest reason to value it.'
    };

    const audienceLabel = firstUseful(
      mirror.audienceLabel,
      relationshipModel?.audiencePlural,
      domainModel?.likelyBuyers?.[0],
      'the people you serve'
    );

    const context = {
      version: '8.0',
      offer: { ...payload.offer },
      generatedAt: analysis?.generatedAt || new Date().toISOString(),
      source: analysis?.source || 'local_niche_context_v8',
      websiteEvidenceUsed: websiteEvidenceWasUsed(payload, analysis, domainModel),
      domainModel,
      relationshipModel,
      nicheContext: intelligence.nicheContext || domainModel.nicheContext || null,
      nicheMirror: { ...mirror, audienceLabel }
    };

    context.workingRead = {
      audienceLabel,
      providerRole: firstUseful(relationshipModel?.providerRole, payload.offer.name, 'provider'),
      customerNeed: firstUseful(domainModel.customerNeed, mirror.worldLine, 'a useful result and enough clarity to judge fit'),
      situations: asList(mirror.situations).slice(0, 3),
      resistanceQuestions: asList(domainModel.resistance).slice(0, 3),
      decisionRoles: asList(relationshipModel?.decisionRoles).slice(0, 3)
    };

    return context;
  }

  function evidenceNote(context) {
    if (context.websiteEvidenceUsed) {
      return 'This starting point combines the work you entered with evidence retrieved from the website you supplied. Your answers should still correct anything the outside view misses.';
    }
    if (context.offer.website) {
      return 'We have your website address, but this browser-only version does not claim the public site was retrieved unless the analysis service confirms it. This starting point currently leans on the work identity and high-probability field patterns.';
    }
    return 'This starting point comes from high-probability patterns around the work. Your experience is the part that decides whether those patterns actually fit you.';
  }

  function renderItems(items, fallback) {
    const values = items.length ? items : [fallback];
    return values.map(item => `<li>${esc(item)}</li>`).join('');
  }

  function renderWorkingRead(context) {
    let panel = document.getElementById('step2-working-read');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'step2-working-read';
      panel.className = 'working-read niche-working-read';
      const heading = step2.querySelector('.section-heading');
      heading?.insertAdjacentElement('afterend', panel);
    }

    const mirror = context.nicheMirror;
    const variations = asList(mirror.audienceVariations).slice(0, 3);
    const situations = asList(mirror.situations).slice(0, 3);
    const useful = asList(mirror.unusuallyUsefulWhere).slice(0, 3);

    panel.innerHTML = `
      <div class="working-read-head niche-working-read-head">
        <p class="working-read-kicker">${esc(mirror.title || 'FIND YOUR NICHE')}</p>
        <h3>${esc(mirror.principle || 'Finding your niche is not about putting yourself in a smaller box. It is about finding where you are unusually useful.')}</h3>
        <p class="niche-opening">${esc(mirror.opening || '')}</p>
        ${mirror.worldLine ? `<p class="niche-world-line">${esc(mirror.worldLine)}</p>` : ''}
      </div>

      <div class="niche-assumption-block">
        <p class="working-read-label">You already know they are not all the same</p>
        <div class="working-read-grid niche-variation-grid">
          ${variations.map(item => `<article class="working-read-part"><p>${esc(item)}</p></article>`).join('')}
        </div>
      </div>

      <div class="niche-context-columns">
        <article class="niche-context-column">
          <span class="working-read-label">They may show up when</span>
          <ul>${renderItems(situations, 'They know something needs to change but have not yet decided what kind of help fits.')}</ul>
        </article>
        <article class="niche-context-column">
          <span class="working-read-label">You may be unusually useful when</span>
          <ul>${renderItems(useful, 'your particular judgment, style, or experience makes this problem easier to understand and solve')}</ul>
        </article>
      </div>

      <p class="working-read-correction niche-transition-copy">${esc(mirror.close || '')}</p>
      <p class="niche-user-role"><strong>Do not try to agree with the analysis.</strong> Tell us what you actually recognize from doing the work. That is how the niche gets sharper.</p>
      <p class="working-read-evidence">${esc(evidenceNote(context))}</p>
    `;
  }

  async function prepareAudienceStep2Context() {
    const payload = buildPreviewPayload();
    const signature = signatureFor(payload);

    if (cachedContext && cachedSignature === signature) {
      renderWorkingRead(cachedContext);
      window.audienceStep1Context = cachedContext;
      return cachedContext;
    }

    if (activeRequest && activeRequest.signature === signature) return activeRequest.promise;

    const promise = (async () => {
      let analysis;
      try {
        analysis = typeof window.requestAudienceAnalysis === 'function'
          ? await window.requestAudienceAnalysis(payload)
          : fallbackAnalysis(payload);
      } catch (error) {
        console.error('Step 1 niche context analysis failed. Using local context.', error);
        analysis = fallbackAnalysis(payload, error);
      }

      const context = buildContext(payload, analysis);
      cachedSignature = signature;
      cachedContext = context;
      window.audienceStep1Context = context;
      renderWorkingRead(context);
      document.dispatchEvent(new CustomEvent('audience:step1-context-ready', { detail: context }));
      return context;
    })();

    activeRequest = { signature, promise };
    try {
      return await promise;
    } finally {
      if (activeRequest?.promise === promise) activeRequest = null;
    }
  }

  function invalidate() {
    cachedSignature = '';
    cachedContext = null;
    window.audienceStep1Context = null;
  }

  offerInput.addEventListener('input', invalidate);
  websiteInput?.addEventListener('input', invalidate);
  form.addEventListener('change', event => {
    if (event.target?.name === 'offer_type') invalidate();
  });

  window.prepareAudienceStep2Context = prepareAudienceStep2Context;
})();
