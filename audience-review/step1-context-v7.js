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

  const selectedOne = name => document.querySelector(`input[name="${name}"]:checked`)?.value || null;
  const asList = value => Array.isArray(value) ? value.filter(Boolean) : [];
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

    const domain = typeof window.buildAudienceDomainModel === 'function'
      ? window.buildAudienceDomainModel(payload)
      : {
          normalizedTitle: payload.offer.name,
          family: 'general',
          customerNeed: 'a clearer path to a useful decision',
          situations: [],
          resistance: []
        };

    return {
      source: 'local_step1_context',
      generatedAt: new Date().toISOString(),
      humanReport: { domainModel: domain, relationshipModel: domain.relationshipModel || null },
      audienceIntelligence: { domainModel: domain, relationshipModel: domain.relationshipModel || null }
    };
  }

  function websiteEvidenceWasUsed(payload, analysis, domain) {
    if (!payload.offer.website) return false;
    const intelligence = analysis?.audienceIntelligence || {};
    const basis = [
      domain?.evidenceBasis,
      domain?.inferenceLevel,
      intelligence?.providerEvidence?.evidenceBasis,
      intelligence?.observedEvidence?.evidenceBasis
    ].filter(Boolean).join(' ');

    if (/website|public page|public evidence/i.test(basis)) return true;
    if (intelligence?.providerEvidence?.website || intelligence?.observedEvidence?.website) return true;
    return false;
  }

  function buildContext(payload, analysis) {
    const intelligence = analysis?.audienceIntelligence || {};
    const report = analysis?.humanReport || {};
    const domain = intelligence.domainModel || report.domainModel || (
      typeof window.buildAudienceDomainModel === 'function' ? window.buildAudienceDomainModel(payload) : {}
    );
    const relationship = intelligence.relationshipModel || report.relationshipModel || domain.relationshipModel || (
      typeof window.buildAudienceRelationshipModel === 'function' ? window.buildAudienceRelationshipModel(payload) : {}
    );

    const situations = asList(domain.triggerSituations).length
      ? asList(domain.triggerSituations)
      : asList(domain.situations).length
        ? asList(domain.situations)
        : asList(report.leadWithProblem?.situations);

    const resistanceQuestions = asList(domain.commonTrustQuestions).length
      ? asList(domain.commonTrustQuestions)
      : asList(domain.resistance).length
        ? asList(domain.resistance)
        : asList(report.opening?.resistanceQuestions);

    const decisionRoles = asList(relationship.decisionRoles).length
      ? asList(relationship.decisionRoles)
      : asList(domain.likelyBuyers);

    const audienceLabel = firstUseful(relationship.audiencePlural, domain.likelyBuyers?.[0], 'people considering this kind of work');
    const providerRole = firstUseful(relationship.providerRole, payload.offer.name, 'provider');
    const customerNeed = firstUseful(
      domain.customerNeed,
      domain.commonJobsToBeDone?.[0],
      report.opening?.lead,
      'a useful result and enough clarity to decide whether the next step fits'
    );

    return {
      offer: { ...payload.offer },
      generatedAt: analysis?.generatedAt || new Date().toISOString(),
      source: analysis?.source || 'local_step1_context',
      websiteEvidenceUsed: websiteEvidenceWasUsed(payload, analysis, domain),
      domainModel: domain,
      relationshipModel: relationship,
      workingRead: {
        audienceLabel,
        providerRole,
        customerNeed,
        situations: situations.slice(0, 3),
        resistanceQuestions: resistanceQuestions.slice(0, 3),
        decisionRoles: decisionRoles.slice(0, 3)
      }
    };
  }

  function evidenceNote(context) {
    if (context.websiteEvidenceUsed) {
      return 'This working read combines broader field patterns with evidence the analysis service could retrieve from the website you supplied.';
    }
    if (context.offer.website) {
      return 'We have your website address. This first read is based on the professional and relationship context we can verify here; it does not claim the website itself was successfully retrieved.';
    }
    return 'This first read comes from high-probability patterns around the work and the relationship involved. Your answers should confirm, refine, or contradict it.';
  }

  function renderList(items, fallback) {
    const values = items.length ? items : [fallback];
    return `<ul>${values.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
  }

  function renderWorkingRead(context) {
    let panel = document.getElementById('step2-working-read');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'step2-working-read';
      panel.className = 'working-read';
      const heading = step2.querySelector('.section-heading');
      heading?.insertAdjacentElement('afterend', panel);
    }

    const read = context.workingRead;
    panel.innerHTML = `
      <div class="working-read-head">
        <p class="working-read-kicker">Our working read</p>
        <h3>Before you answer, here is what may already be happening.</h3>
        <p>For <strong>${esc(context.offer.name)}</strong>, ${esc(read.audienceLabel)} are often looking for ${esc(read.customerNeed)}. We are using that as a starting point, not assuming it describes every person you serve.</p>
      </div>
      <div class="working-read-grid">
        <article class="working-read-part">
          <span class="working-read-label">The situation may sound like</span>
          ${renderList(read.situations, 'They know something needs to change, but may not yet know what kind of help or solution fits.')}
        </article>
        <article class="working-read-part">
          <span class="working-read-label">Questions already in the room</span>
          ${renderList(read.resistanceQuestions, 'Is this the right fit for what I actually need?')}
        </article>
        <article class="working-read-part">
          <span class="working-read-label">The decision may involve</span>
          ${renderList(read.decisionRoles, `the ${read.audienceLabel} deciding whether this ${read.providerRole} relationship feels useful and trustworthy`)}
        </article>
      </div>
      <p class="working-read-correction"><strong>Your job now is not to agree with us.</strong> Choose what you actually recognize. If this first read misses something important, your answers should change the model.</p>
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
        console.error('Step 1 audience context analysis failed. Using local context.', error);
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
