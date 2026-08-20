(() => {
  const CONTRACT_VERSION = '8.0';
  const previousDomainBuilder = window.buildAudienceDomainModel;
  const previousLocalBuilder = window.buildLocalAudienceAnalysis;
  const previousRequestBuilder = window.buildLLMAnalysisRequest;

  const DIMENSIONS = [
    {
      id: 'pet_care',
      label: 'pet care',
      match: /\b(dog|pet|canine|feline|daycare|boarding|groom|walker|walking|sitter|sitting)\b/i,
      world: 'care, routine, trust, behavior, and the responsibility of looking after an animal someone knows intimately',
      situations: [
        'They need dependable care while work, travel, or life pulls them somewhere else.',
        'Their dog has a personality, routine, energy level, or need that makes generic care feel like a bad fit.',
        'They are less worried about finding any available person than finding someone who will notice the things they notice.'
      ],
      differences: [
        'Some owners mainly need reliable coverage and easy logistics.',
        'Some care most about exercise, routine, socialization, or behavior.',
        'Some are looking for the person they trust with the particular little weirdo filling most of their camera roll.'
      ],
      usefulWhere: [
        'individual attention matters more than a one-size-fits-all routine',
        'the owner wants someone who notices small changes and communicates them',
        'the dog or household needs a style of care that not every provider enjoys or does equally well'
      ]
    },
    {
      id: 'technology_systems',
      label: 'technology and systems',
      match: /\b(technology|tech|software|systems?|automation|developer|development|programmer|it\b|information technology|workflow|platform|data|digital)\b/i,
      world: 'technology choices, workflows, systems, implementation, reliability, and the gap between what a tool can do and whether it is actually useful',
      situations: [
        'They have technology already, but the workflow around it still feels harder than it should.',
        'They know something needs to be automated or connected but are not yet sure what the right technical answer is.',
        'They are trying to decide whether the problem really needs more technology or a clearer way to use what they already have.'
      ],
      differences: [
        'Some clients want a new system built.',
        'Some need the systems they already own to work together.',
        'Some think they have a technology problem when the real friction is process, ownership, communication, or adoption.'
      ],
      usefulWhere: [
        'technical complexity needs to become an understandable business decision',
        'the right answer may be a simpler system rather than another tool',
        'implementation has to work for the people expected to use it, not only on a diagram'
      ]
    },
    {
      id: 'ai_human',
      label: 'AI and human adoption',
      match: /\b(ai|artificial intelligence|llm|language model|agent|agents|machine learning|human[- ]centered|human centered|human-first|human first|made human)\b/i,
      world: 'AI capability, human judgment, adoption, trust, workflow change, and deciding where automation helps without removing the person from the decision',
      situations: [
        'They feel pressure to use AI but have not yet translated that pressure into a useful business problem.',
        'They have experimented with AI and now need to make it reliable, understandable, or worth using repeatedly.',
        'They are trying to automate work without automating away the judgment, voice, trust, or human relationship that makes the work valuable.'
      ],
      differences: [
        'Some clients want AI everywhere because they are afraid of falling behind.',
        'Some are skeptical and need a practical reason before changing anything.',
        'Some need help deciding what should be automated and what should stay deliberately human.'
      ],
      usefulWhere: [
        'AI needs to solve a recognizable human or operational problem',
        'people need to understand why a new AI workflow deserves their trust and attention',
        'automation must preserve judgment, agency, voice, or relationship quality'
      ]
    },
    {
      id: 'communication_strategy',
      label: 'strategic communication',
      match: /\b(communication|communications|messaging|message|narrative|content|marketing|brand|branding|positioning|public relations|pr\b)\b/i,
      world: 'meaning, language, audience interpretation, trust, positioning, and helping people understand what matters without making them decode the organization first',
      situations: [
        'They know what they mean internally but cannot get customers, staff, partners, or the public to hear the same thing.',
        'The message has accumulated enough language that the important part is getting harder to see.',
        'Different teams are describing the same work in different ways and the inconsistency is starting to cost attention or trust.'
      ],
      differences: [
        'Some clients need sharper words.',
        'Some need a clearer strategy before another round of copy will help.',
        'Some need the organization itself to agree on what it is trying to say before the audience ever sees it.'
      ],
      usefulWhere: [
        'complex ideas need to become language a real audience recognizes',
        'the message must connect organizational intent with what the audience is actually deciding',
        'clarity requires choosing what not to say as carefully as what to say'
      ]
    },
    {
      id: 'design_experience',
      label: 'design and experience',
      match: /\b(design|designer|creative|ux\b|user experience|visual|interface|information architecture|experience design)\b/i,
      world: 'making information, choices, interactions, and ideas easier to see, understand, use, and act on',
      situations: [
        'They have the pieces but the experience still makes people work too hard to understand what to do.',
        'They need a visual or interaction structure that makes the important thing obvious without overexplaining it.',
        'The current design technically works but no longer reflects the quality, clarity, or confidence of the work behind it.'
      ],
      differences: [
        'Some clients need stronger visual execution.',
        'Some need the information reorganized before visual polish will matter.',
        'Some need someone who can connect strategy, language, and experience instead of treating design as decoration.'
      ],
      usefulWhere: [
        'information needs hierarchy before it needs polish',
        'the experience has to support a real decision rather than simply look finished',
        'strategy and execution need to stay connected through the whole experience'
      ]
    },
    {
      id: 'advisory_consulting',
      label: 'consulting and advisory work',
      match: /\b(consultant|consulting|advisor|adviser|strategist|strategy|coach|fractional|specialist)\b/i,
      world: 'expert judgment, diagnosis, tradeoffs, recommendations, and helping someone make a better decision without taking the decision away from them',
      situations: [
        'They know the situation matters enough that generic advice is no longer useful.',
        'They need an outside perspective because the people closest to the problem are also buried inside it.',
        'They are looking for someone who can recognize the important pattern quickly and help them decide what deserves attention first.'
      ],
      differences: [
        'Some clients want an answer.',
        'Some actually need a better way to frame the problem before any answer will be useful.',
        'Some need an expert who can stay involved through implementation rather than hand over a recommendation and disappear.'
      ],
      usefulWhere: [
        'the problem crosses categories and no single canned solution fits',
        'the client needs judgment more than another list of best practices',
        'an outside perspective can expose a pattern the organization has stopped seeing'
      ]
    },
    {
      id: 'care_relationships',
      label: 'care and relationship work',
      match: /\b(care|caregiver|counsel|counseling|therapy|therapist|health|wellness|patient|family|childcare|elder)\b/i,
      world: 'trust, vulnerability, responsibility, fit, expectations, and a relationship where the quality of attention can matter as much as the stated service',
      situations: [
        'They are choosing help in a situation where fit and trust matter before the result can be known.',
        'They may not have the professional language to describe exactly what kind of help they need.',
        'They are paying attention to how the provider listens and explains, not only to credentials or features.'
      ],
      differences: [
        'Some people want expertise and structure immediately.',
        'Some need time, explanation, or reassurance before the next step feels workable.',
        'Some are choosing partly for another person, which changes what trust and proof need to look like.'
      ],
      usefulWhere: [
        'people need to feel recognized rather than processed',
        'professional expertise needs to increase understanding and agency',
        'fit, expectations, and communication are part of the value rather than administrative details'
      ]
    },
    {
      id: 'education_learning',
      label: 'education and learning',
      match: /\b(teacher|teaching|tutor|training|trainer|instructor|education|educator|course|workshop|mentor|learning)\b/i,
      world: 'progress, confidence, skill-building, feedback, practice, and finding the right starting point for a learner rather than forcing everyone through the same path',
      situations: [
        'They know what they want to be able to do but are unsure where to begin.',
        'They have tried before and need a different explanation, pace, or kind of feedback.',
        'They are comparing programs that look similar on paper but may feel very different in practice.'
      ],
      differences: [
        'Some learners want structure and accountability.',
        'Some need confidence and a lower-friction starting point.',
        'Some care less about completing a curriculum than being able to use the skill in a particular real-world situation.'
      ],
      usefulWhere: [
        'the learner needs a starting point that fits what they already know',
        'feedback and explanation matter more than access to information alone',
        'the goal is usable progress rather than simply completing content'
      ]
    },
    {
      id: 'trades_service',
      label: 'hands-on service and repair',
      match: /\b(repair|mechanic|plumber|electrician|hvac|contractor|maintenance|handyman|installer|installation|service technician)\b/i,
      world: 'diagnosis, practical judgment, cost, timing, trust, and helping someone understand what needs attention now versus what can wait',
      situations: [
        'Something is not working and they need a trustworthy next step more than a technical lecture.',
        'They are comparing recommendations and cannot easily tell why one is more expensive or extensive than another.',
        'They want the problem solved without feeling like uncertainty is being used to sell them more work.'
      ],
      differences: [
        'Some customers need the fastest workable fix.',
        'Some care most about long-term reliability.',
        'Some need help deciding what is necessary now, what is optional, and what can reasonably wait.'
      ],
      usefulWhere: [
        'technical judgment needs to become an understandable recommendation',
        'trust grows by explaining what the customer may not need',
        'the provider can separate urgency from pressure'
      ]
    }
  ];

  const unique = values => [...new Set((values || []).filter(Boolean))];
  const asArray = value => Array.isArray(value) ? value : [];
  const cleanText = value => typeof value === 'string' ? value.trim() : '';

  function natural(values) {
    const items = unique(values);
    if (!items.length) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
  }

  function matchedDimensions(title) {
    const raw = cleanText(title);
    return DIMENSIONS.filter(item => item.match.test(raw));
  }

  function genericDimension(title) {
    return {
      id: 'general_professional',
      label: 'professional work',
      world: `the real situations, tradeoffs, relationships, and judgment surrounding ${title || 'this work'}`,
      situations: [
        'They know they need help, but may not yet know what level or kind of help fits.',
        'They are comparing options that look similar until the differences are explained in the context of their situation.',
        'They want enough clarity to feel that the recommendation fits rather than being pushed toward a standard package.'
      ],
      differences: [
        'Some people mainly value speed or convenience.',
        'Some care most about confidence, trust, or reducing the chance of a wrong choice.',
        'Some need a provider whose particular way of thinking or working fits the problem better than a generic alternative.'
      ],
      usefulWhere: [
        'your judgment changes the recommendation',
        'your way of working makes a difficult decision easier to understand',
        'a particular kind of customer or problem benefits more from your strengths than from a one-size-fits-all solution'
      ]
    };
  }

  function buildNicheDomain(payload) {
    const base = typeof previousDomainBuilder === 'function'
      ? previousDomainBuilder(payload)
      : { normalizedTitle: payload?.offer?.name || 'Your work', family: 'general' };

    const raw = cleanText(payload?.offer?.name) || base.normalizedTitle || 'Your work';
    const dimensions = matchedDimensions(raw);
    const active = dimensions.length ? dimensions : [genericDimension(raw)];
    const primary = active[0];

    const combinedSituations = unique(active.flatMap(item => item.situations));
    const combinedDifferences = unique(active.flatMap(item => item.differences));
    const combinedUsefulWhere = unique(active.flatMap(item => item.usefulWhere));
    const worlds = unique(active.map(item => item.world));

    const nicheContext = {
      version: CONTRACT_VERSION,
      dimensions: active.map(item => ({ id: item.id, label: item.label, world: item.world })),
      worlds,
      likelyAudienceSituations: combinedSituations.slice(0, 6),
      meaningfulAudienceDifferences: combinedDifferences.slice(0, 6),
      unusuallyUsefulWhere: combinedUsefulWhere.slice(0, 6),
      workingPrinciple: 'Your niche is not a smaller box. It is where your particular strengths become unusually useful to particular people and problems.',
      confidence: dimensions.length > 1 ? 'high for multi-domain interpretation; provider-specific fit remains a hypothesis' : dimensions.length === 1 ? 'moderate-high for field pattern; provider-specific fit remains a hypothesis' : 'moderate general fallback',
      evidenceBasis: payload?.offer?.website ? 'entered work identity plus website supplied for external verification when available' : 'entered work identity and high-probability field patterns'
    };

    return {
      ...base,
      normalizedTitle: raw,
      primaryFamily: base.family || primary.id,
      relatedDimensions: active.map(item => item.id),
      inferenceLevel: dimensions.length > 1 ? 'multi-domain high-probability working model' : (base.inferenceLevel || 'high-probability working model'),
      customerNeed: base.customerNeed || `help inside ${natural(active.map(item => item.label))}`,
      situations: unique([...combinedSituations, ...asArray(base.situations)]).slice(0, 6),
      resistance: unique([...(asArray(base.resistance)), ...combinedDifferences.map(item => `Will this fit someone whose situation is more like this: ${item.replace(/\.$/, '')}?`)]).slice(0, 6),
      examples: unique([...(asArray(base.examples)), ...combinedUsefulWhere.map(item => `Show where ${item}.`)]).slice(0, 6),
      nicheContext
    };
  }

  function buildLocalMirror(payload, analysis = null) {
    const domain = analysis?.audienceIntelligence?.domainModel || analysis?.humanReport?.domainModel || buildNicheDomain(payload);
    const niche = domain.nicheContext || buildNicheDomain(payload).nicheContext;
    const dimensions = asArray(niche.dimensions);
    const ids = dimensions.map(item => item.id);
    const audiencePlural = analysis?.audienceIntelligence?.relationshipModel?.audiencePlural
      || analysis?.humanReport?.relationshipModel?.audiencePlural
      || domain.relationshipModel?.audiencePlural
      || 'customers';

    let opening;
    if (ids.includes('pet_care')) {
      opening = 'Taking care of dogs can be A LOT. One dog wants the windows down. Another seems pretty sure they should be driving. Their owners are not all the same either.';
    } else if (ids.includes('technology_systems') && (ids.includes('communication_strategy') || ids.includes('ai_human'))) {
      opening = 'Technology has a funny habit of making simple things complicated. People are even better at it.';
    } else if (ids.includes('communication_strategy')) {
      opening = 'People can hear the same words and walk away with completely different ideas about what they mean. That is usually where communication work gets interesting.';
    } else if (ids.includes('advisory_consulting')) {
      opening = 'Two clients can ask for the same kind of help and still need very different things from the person sitting across the table.';
    } else if (ids.includes('care_relationships')) {
      opening = 'People rarely choose care from a checklist alone. The same service can feel completely different depending on the person, the situation, and who they trust with it.';
    } else {
      opening = `People looking for ${payload?.offer?.name || 'this kind of work'} may use the same words for very different problems. You already know they are not all the same.`;
    }

    const workWorlds = dimensions.map(item => item.label);
    const worldLine = workWorlds.length > 1
      ? `Your work crosses ${natural(workWorlds)}. That overlap matters because the people arriving there are not all solving the same problem.`
      : `Working in ${workWorlds[0] || payload?.offer?.name || 'this field'}, you have probably already noticed that similar-looking requests can require very different judgment.`;

    return {
      title: 'FIND YOUR NICHE',
      principle: 'Finding your niche is not about putting yourself in a smaller box. It is about finding where you are unusually useful.',
      opening,
      worldLine,
      audienceLabel: audiencePlural,
      audienceVariations: asArray(niche.meaningfulAudienceDifferences).slice(0, 3),
      situations: asArray(niche.likelyAudienceSituations).slice(0, 3),
      unusuallyUsefulWhere: asArray(niche.unusuallyUsefulWhere).slice(0, 3),
      close: 'This worksheet helps us connect the work you are especially good at and actually want more of with the people and problems that have the strongest reason to value those differences.'
    };
  }

  function buildLocalV8(payload) {
    const legacy = typeof previousLocalBuilder === 'function'
      ? previousLocalBuilder(payload)
      : { status: 'complete', source: 'local', generatedAt: new Date().toISOString(), humanReport: {}, audienceIntelligence: {} };

    const domainModel = buildNicheDomain(payload);
    const relationshipModel = legacy?.audienceIntelligence?.relationshipModel || legacy?.humanReport?.relationshipModel || domainModel.relationshipModel || null;
    const humanReport = { ...(legacy.humanReport || {}), domainModel };
    const audienceIntelligence = {
      ...(legacy.audienceIntelligence || {}),
      domainModel,
      nicheContext: domainModel.nicheContext,
      relationshipModel
    };
    const staged = { ...legacy, humanReport, audienceIntelligence };
    humanReport.nicheMirror = buildLocalMirror(payload, staged);

    return {
      ...legacy,
      source: 'local_niche_context_v8',
      humanReport,
      audienceIntelligence
    };
  }

  function buildRequestV8(payload) {
    const base = typeof previousRequestBuilder === 'function'
      ? previousRequestBuilder(payload)
      : { payload, instructions: [] };
    const domain = buildNicheDomain(payload);
    const preInterview = payload?.analysisStage === 'pre_interview_context';

    return {
      ...base,
      contractVersion: CONTRACT_VERSION,
      task: preInterview ? 'pre_interview_niche_context_synthesis' : 'audience_niche_communication_playbook',
      instructions: [
        'NICHE MODEL — Do not collapse a compound professional identity into the first recognizable occupation. Interpret every materially relevant domain in the entered work identity and the overlap between them.',
        'Treat niche as the overlap between distinctive strengths, preferred work, recurring problems the provider understands unusually well, and people for whom those differences are unusually useful. Niche is not merely a demographic segment or a smaller service category.',
        'Before asking the provider to describe the audience, generate high-probability assumptions about the world of the work: recognizable customer situations, meaningful differences among customers/problems, and places where different provider strengths would matter disproportionately.',
        'Mirror the work back in natural colleague-level language. Demonstrate recognition without claiming certainty. The user should feel that the system understands the kind of work and the variation inside it before asking them to do more analysis.',
        'When multiple domains are present, explicitly synthesize the overlap. Example: technology consulting + strategic communication + human-centered AI should not become generic consulting; it should recognize technology, communication, adoption, systems, human judgment, and the situations where those concerns collide.',
        'When a website is supplied and the analysis environment can retrieve it, inspect the actual public page. Separate observed website evidence from general field knowledge and from inference. Never claim the site was read if retrieval failed.',
        'For the pre-interview result, return a nicheMirror written for the user. It should be vivid enough to create recognition, restrained enough to preserve agency, and should include plausible variation among customers rather than a generic list of values.',
        'The nicheMirror may use a light metaphor or observation that belongs naturally to the field. Do not force brand wordplay. The box metaphor is reserved for the niche principle: finding a niche is not about putting yourself in a smaller box; it is about finding where you are unusually useful.',
        'Do not use fear, urgency, diagnostic language, personality typing, or claims that every customer behaves the same way.',
        ...(base.instructions || [])
      ],
      requiredNicheContext: {
        dimensions: [{ id: 'string', label: 'string', world: 'string' }],
        likelyAudienceSituations: ['string'],
        meaningfulAudienceDifferences: ['string'],
        unusuallyUsefulWhere: ['string'],
        confidence: 'string',
        evidenceBasis: 'string'
      },
      requiredHumanReport: {
        ...(base.requiredHumanReport || {}),
        nicheMirror: {
          title: 'FIND YOUR NICHE',
          principle: 'string',
          opening: 'string',
          worldLine: 'string',
          audienceLabel: 'string',
          audienceVariations: ['string'],
          situations: ['string'],
          unusuallyUsefulWhere: ['string'],
          close: 'string'
        }
      },
      payload: {
        ...payload,
        inferredNicheContext: domain.nicheContext
      }
    };
  }

  async function requestV8(payload) {
    const analysisRequest = buildRequestV8(payload);
    window.audienceAnalysisRequest = analysisRequest;

    if (typeof window.oobAudienceAnalyzer === 'function') {
      const result = await window.oobAudienceAnalyzer(analysisRequest);
      if (result?.humanReport && result?.audienceIntelligence) return result;
    }

    if (window.OOB_AUDIENCE_ANALYSIS_ENDPOINT) {
      const response = await fetch(window.OOB_AUDIENCE_ANALYSIS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisRequest)
      });
      if (!response.ok) throw new Error(`Audience analysis request failed: ${response.status}`);
      const result = await response.json();
      if (!result?.humanReport || !result?.audienceIntelligence) {
        throw new Error('Audience analysis response does not match niche context contract.');
      }
      return result;
    }

    return buildLocalV8(payload);
  }

  window.buildAudienceDomainModel = buildNicheDomain;
  window.buildAudienceNicheMirror = buildLocalMirror;
  window.buildLocalAudienceAnalysis = buildLocalV8;
  window.buildLLMAnalysisRequest = buildRequestV8;
  window.requestAudienceAnalysis = requestV8;
})();
