(() => {
  const CONTRACT_VERSION = '6.0';
  const MARKETING_PSYCHOLOGY_SOURCE = {
    repository: 'coreyhaines31/marketingskills',
    skill: 'marketing-psychology',
    version: '2.0.0',
    commit: 'ff8cccced801966ce7129c3a18baeb7a027d4e54'
  };

  const originalDomain = window.buildAudienceDomainModel;
  const originalPlaybook = window.buildAudiencePlaybook;
  const originalLocal = window.buildLocalAudienceAnalysis;
  const originalRequestBuilder = window.buildLLMAnalysisRequest;

  const RELATIONSHIP_PROFILES = [
    {
      id: 'couples_counseling',
      match: /\b(marriage|marital|couples?|relationship|family)\b.*\b(counsel|therap|psychotherap)|\b(counsel|therap|psychotherap)\b.*\b(marriage|marital|couples?|relationship|family)\b/i,
      providerRole: 'counselor',
      audienceSingular: 'client',
      audiencePlural: 'couples, partners, and families',
      relationshipLabel: 'counselor ↔ couple / partners / family',
      decisionRoles: ['one or more partners may initiate contact', 'multiple people may participate in the service', 'the payer, initiator, and participant may not be the same person'],
      dynamics: {
        expertiseAsymmetry: 'meaningful professional expertise asymmetry, while lived experience remains with the clients',
        authorityAsymmetry: 'professional authority can carry weight, so recommendations should preserve each participant’s agency',
        vulnerability: 'high emotional exposure and potentially different interpretations of the same problem',
        sharedResponsibility: 'progress usually depends on participation from more than one person rather than a result being delivered passively',
        duration: 'often an ongoing relationship rather than a single transaction',
        multiStakeholder: 'high; different participants may have different goals, concerns, readiness, or definitions of success',
        trustRequirement: 'high; neutrality, confidentiality, boundaries, expectations, and being understood can strongly affect willingness to engage',
        agencyRequirement: 'high; communication should not imply that one partner is the problem or that the provider will decide for the relationship'
      }
    },
    {
      id: 'physician_patient',
      match: /\b(physician|doctor|medical doctor|primary care|family medicine|internist|pediatrician|surgeon|specialist)\b/i,
      providerRole: 'physician',
      audienceSingular: 'patient',
      audiencePlural: 'patients',
      relationshipLabel: 'physician ↔ patient',
      decisionRoles: ['the patient usually receives the service', 'caregivers or family members may influence or support decisions', 'insurance or referral systems may affect access without replacing patient agency'],
      dynamics: {
        expertiseAsymmetry: 'high clinical expertise asymmetry',
        authorityAsymmetry: 'high; medical authority can strongly influence interpretation and choice',
        vulnerability: 'often elevated because health concerns can involve uncertainty, privacy, pain, fear, or consequential decisions',
        sharedResponsibility: 'shared; the physician contributes clinical judgment while the patient contributes goals, history, preferences, and informed choice',
        duration: 'may range from one encounter to a long-term care relationship',
        multiStakeholder: 'variable; caregivers, family, specialists, insurers, or referring clinicians may be involved',
        trustRequirement: 'high; competence, clarity, privacy, scope, and realistic expectations matter',
        agencyRequirement: 'very high; communication should support informed choice and never use vulnerability or authority as leverage'
      }
    },
    {
      id: 'education_student',
      match: /\b(teacher|tutor|instructor|educator|professor|lesson|school|course|workshop|training|trainer|mentor)\b/i,
      providerRole: 'teacher',
      audienceSingular: 'student',
      audiencePlural: 'students',
      relationshipLabel: 'teacher ↔ student',
      decisionRoles: ['the learner may choose and use the service', 'a parent, employer, school, or organization may sometimes pay or approve', 'the learner and buyer may be different people'],
      dynamics: {
        expertiseAsymmetry: 'meaningful expertise asymmetry, especially around sequencing, feedback, and judging the right starting point',
        authorityAsymmetry: 'moderate; the teacher guides but should not make the learner feel incapable of participating in the decision',
        vulnerability: 'variable; confidence, prior difficulty, performance, or fear of falling behind can increase emotional exposure',
        sharedResponsibility: 'high; learning depends on both instruction and learner participation or practice',
        duration: 'often repeated over time, allowing trust and expectations to compound',
        multiStakeholder: 'sometimes; parents, schools, employers, or credentialing bodies can influence the decision',
        trustRequirement: 'fit, pace, useful feedback, practical transfer, and visible progress are often central',
        agencyRequirement: 'high; the student should understand the path and retain ownership of learning goals and choices'
      }
    },
    {
      id: 'therapy_client',
      match: /\b(therapist|counselor|psychologist|psychotherapist|mental health)\b/i,
      providerRole: 'therapist',
      audienceSingular: 'client',
      audiencePlural: 'clients',
      relationshipLabel: 'therapist ↔ client',
      decisionRoles: ['the client usually participates directly', 'family, referral sources, or payers may influence access without replacing the client relationship'],
      dynamics: {
        expertiseAsymmetry: 'meaningful professional expertise asymmetry',
        authorityAsymmetry: 'meaningful; professional language and recommendations can carry unusual weight',
        vulnerability: 'often high because the relationship can involve private, emotionally exposed, or personally consequential material',
        sharedResponsibility: 'high; the process depends on professional skill and client participation',
        duration: 'often ongoing',
        multiStakeholder: 'variable depending on age, referral, family participation, or payer context',
        trustRequirement: 'high; fit, confidentiality, boundaries, expectations, and being treated as a person matter',
        agencyRequirement: 'very high; communication must preserve autonomy and avoid exploiting distress or uncertainty'
      }
    },
    {
      id: 'legal_client',
      match: /\b(attorney|lawyer|legal counsel|law firm)\b/i,
      providerRole: 'attorney',
      audienceSingular: 'client',
      audiencePlural: 'clients',
      relationshipLabel: 'attorney ↔ client',
      decisionRoles: ['the client usually chooses and receives advice', 'other family or business stakeholders may influence the decision'],
      dynamics: {
        expertiseAsymmetry: 'high legal expertise asymmetry',
        authorityAsymmetry: 'meaningful; the client may rely heavily on professional interpretation',
        vulnerability: 'often elevated because legal decisions can be consequential and unfamiliar',
        sharedResponsibility: 'shared; the attorney advises while the client retains consequential choices',
        duration: 'often tied to a matter, but may become an ongoing advisory relationship',
        multiStakeholder: 'variable; family, partners, boards, counterparties, or other professionals may be involved',
        trustRequirement: 'high; reasoning, scope, costs, options, and limits must be understandable',
        agencyRequirement: 'high; expertise should increase the client’s ability to decide rather than obscure choices'
      }
    },
    {
      id: 'caregiver_family',
      match: /\b(childcare|child care|daycare|elder care|home care|caregiver|nanny)\b/i,
      providerRole: 'care provider',
      audienceSingular: 'family',
      audiencePlural: 'families and caregivers',
      relationshipLabel: 'care provider ↔ family / caregiver / person receiving care',
      decisionRoles: ['the person choosing or paying may be different from the person receiving care', 'family members or guardians may share approval or oversight'],
      dynamics: {
        expertiseAsymmetry: 'moderate; the provider holds situational experience while the family holds essential knowledge about the individual',
        authorityAsymmetry: 'moderate',
        vulnerability: 'often high because responsibility is being handed over for someone important',
        sharedResponsibility: 'shared across provider, family, and sometimes the person receiving care',
        duration: 'often recurring or ongoing',
        multiStakeholder: 'high in many care decisions',
        trustRequirement: 'very high; attention, judgment, communication, safety, and response to change are central',
        agencyRequirement: 'high; communication should respect the person receiving care as well as the decision-makers around them'
      }
    },
    {
      id: 'pet_owner_provider',
      match: /\b(dog|pet|canine|feline)\b.*\b(daycare|boarding|care|groom|trainer|training)|\b(daycare|boarding|groom)\b.*\b(dog|pet|canine|feline)\b/i,
      providerRole: 'pet care provider',
      audienceSingular: 'pet owner',
      audiencePlural: 'pet owners',
      relationshipLabel: 'provider ↔ pet owner / animal in care',
      decisionRoles: ['the owner chooses and pays', 'the animal receives the direct care or service'],
      dynamics: {
        expertiseAsymmetry: 'moderate; provider expertise combines with the owner’s knowledge of the animal',
        authorityAsymmetry: 'moderate',
        vulnerability: 'elevated because the owner is entrusting an animal they care about',
        sharedResponsibility: 'shared between owner information and provider judgment',
        duration: 'often recurring',
        multiStakeholder: 'usually low among human decision-makers, though household members may influence the choice',
        trustRequirement: 'high; supervision, judgment, communication, and individual attention matter',
        agencyRequirement: 'high; the owner should understand standards and retain meaningful choices about care'
      }
    },
    {
      id: 'advisor_client',
      match: /\b(accountant|bookkeeper|financial advisor|financial planner|consultant|advisor|adviser|coach|strategist|architect|engineer|recruiter)\b/i,
      providerRole: 'advisor',
      audienceSingular: 'client',
      audiencePlural: 'clients',
      relationshipLabel: 'advisor ↔ client',
      decisionRoles: ['the client may choose and receive the service', 'additional approvers, partners, or team members may influence business decisions'],
      dynamics: {
        expertiseAsymmetry: 'meaningful professional expertise asymmetry',
        authorityAsymmetry: 'moderate; recommendations can strongly frame the client’s choices',
        vulnerability: 'variable with the stakes of the decision',
        sharedResponsibility: 'shared; expert judgment is most useful when it increases client understanding and action',
        duration: 'may be project-based or ongoing',
        multiStakeholder: 'common in organizational decisions',
        trustRequirement: 'reasoning, relevance, scope, proof, and useful outcomes matter',
        agencyRequirement: 'high; advice should clarify options and tradeoffs rather than take ownership of the decision'
      }
    },
    {
      id: 'service_client',
      match: /.*/,
      providerRole: 'provider',
      audienceSingular: 'customer',
      audiencePlural: 'customers',
      relationshipLabel: 'provider ↔ customer / client',
      decisionRoles: ['buyer, payer, user, approver, influencer, and beneficiary may be the same person or different people'],
      dynamics: {
        expertiseAsymmetry: 'variable by field',
        authorityAsymmetry: 'variable by field',
        vulnerability: 'variable by stakes and context',
        sharedResponsibility: 'variable by service',
        duration: 'may be transactional or ongoing',
        multiStakeholder: 'variable',
        trustRequirement: 'the person needs enough clarity and confidence to judge fit and next steps',
        agencyRequirement: 'preserve meaningful choice and make tradeoffs understandable'
      }
    }
  ];

  const PSYCHOLOGY_SIGNALS = [
    {
      id: 'regret_aversion',
      models: ['Regret Aversion', 'Probabilistic Thinking'],
      signals: ['Fear of making the wrong choice', "Confidence they're not making a mistake", 'Uncertain', 'Uncertainty', 'Cautious'],
      implication: 'Reduce fear of a wrong choice by clarifying fit, tradeoffs, limits, and what the person can use to judge the recommendation.'
    },
    {
      id: 'choice_overload',
      models: ["Hick's Law", 'Paradox of Choice', 'Choice Architecture'],
      signals: ['Too much information', "They don't understand the differences between options", 'Overwhelmed', 'Clear choices', 'Someone to make it easier'],
      implication: 'Reduce unnecessary choices and organize the decision around a small number of meaningful differences.'
    },
    {
      id: 'status_quo_friction',
      models: ['Status-Quo Bias', 'Activation Energy'],
      signals: ['Changing feels difficult', "They're satisfied enough with what they already have", "They keep putting it off", "They don't feel ready", 'Time or convenience'],
      implication: 'Make the first useful step easier and explain what changes, without manufacturing urgency.'
    },
    {
      id: 'social_validation',
      models: ['Bandwagon Effect / Social Proof', 'Availability Heuristic'],
      signals: ['Recommendations from other people', 'Someone recommended it', "They want someone else's opinion", 'Agreement from other people involved', 'Proof that it works'],
      implication: 'Use relevant proof and examples that help the person judge fit; do not substitute popularity for evidence.'
    },
    {
      id: 'authority_reliance',
      models: ['Authority Bias', 'Curse of Knowledge'],
      signals: ['Expert guidance', 'Expertise', 'Clear information', 'Confused', 'Vulnerable'],
      implication: 'Translate expertise into understandable reasoning and avoid using authority as pressure.'
    },
    {
      id: 'progress_orientation',
      models: ['Goal-Gradient Effect', 'Jobs to Be Done'],
      signals: ['Opportunity or improvement', 'They want something better', 'They want to improve themselves or their situation', 'Motivated', 'Ambitious', 'Ready for change', 'I want to make progress', 'I want something better than I have now'],
      implication: 'Make the next useful capability or outcome visible rather than relying on abstract aspiration.'
    },
    {
      id: 'identity_and_belonging',
      models: ['Liking / Similarity Bias', 'Unity Principle'],
      signals: ['Being understood', 'Belonging or connection', 'Personal values', 'A personal connection', 'I want to feel understood', 'I want to belong or participate'],
      implication: 'Use recognizable language and genuine shared context without manufacturing identity pressure or exclusion.'
    },
    {
      id: 'value_and_cost',
      models: ['Mental Accounting', 'Framing Effect'],
      signals: ['Price', 'Avoiding unnecessary cost', 'A clear price', 'Lower financial risk', "They don't understand the value", 'I want to save money'],
      implication: 'Explain what changes with cost, what is necessary versus optional, and how to compare value without deceptive anchors or decoys.'
    },
    {
      id: 'give_value_first',
      models: ['Reciprocity Principle', 'Present Bias'],
      signals: [],
      implication: 'Give the reader something immediately useful before asking for attention, trust, or commitment.'
    }
  ];

  const clean = (values = []) => values.filter(value => value && value !== "I'm not sure" && value !== 'Something else');
  const unique = values => [...new Set(values.filter(Boolean))];

  function inferRelationship(payload, domain = {}) {
    const title = payload?.offer?.name?.trim() || domain.normalizedTitle || '';
    const profile = RELATIONSHIP_PROFILES.find(item => item.match.test(title)) || RELATIONSHIP_PROFILES.at(-1);
    return {
      id: profile.id,
      providerRole: profile.providerRole,
      audienceSingular: profile.audienceSingular,
      audiencePlural: profile.audiencePlural,
      relationshipLabel: profile.relationshipLabel,
      decisionRoles: [...profile.decisionRoles],
      dynamics: { ...profile.dynamics },
      confidence: profile.id === 'service_client' ? 'moderate' : 'high',
      basis: profile.id === 'service_client' ? 'broad relationship fallback from entered role/service' : 'high-probability relationship pattern from entered role/service'
    };
  }

  function allAudienceSignals(payload) {
    const evidence = payload?.audienceEvidence || {};
    return unique([
      ...clean(evidence.values),
      ...clean(evidence.triggerContext),
      ...clean(evidence.emotionalState),
      ...clean(evidence.decisionNeeds),
      ...clean(evidence.resistanceSignals),
      ...clean(evidence.desiredMovement)
    ]);
  }

  function inferMarketingPsychology(payload, relationship) {
    const signals = allAudienceSignals(payload);
    const matched = PSYCHOLOGY_SIGNALS.map(pattern => ({
      ...pattern,
      matches: pattern.signals.filter(signal => signals.includes(signal))
    }))
      .filter(pattern => pattern.id === 'give_value_first' || pattern.matches.length)
      .sort((a, b) => b.matches.length - a.matches.length);

    return {
      source: MARKETING_PSYCHOLOGY_SOURCE,
      appliedModels: matched.slice(0, 5).map(pattern => ({
        id: pattern.id,
        models: pattern.models,
        matchedSignals: pattern.matches,
        implication: pattern.implication
      })),
      relationshipConstraint: relationship?.dynamics?.agencyRequirement || 'preserve meaningful choice',
      designRules: [
        'Use Jobs to Be Done to focus on the outcome or progress the person is trying to make.',
        'Use probabilistic thinking: patterns are hypotheses, not facts about an individual.',
        'Treat the map as a model, not the territory; provider observations can confirm, refine, or contradict inferred patterns.',
        'Use Hick’s Law and the paradox of choice to keep interview options limited to discriminative, reusable behavioral signals.',
        'Use choice architecture to make questions easier to answer, not to steer the respondent toward a preferred persona.',
        'Use reciprocity as give-value-first communication: provide useful advice before asking for commitment.',
        'Translate authority into understandable reasoning, especially when expertise or power asymmetry is high.'
      ],
      prohibitedUses: [
        'manufactured urgency or false scarcity',
        'fear amplification',
        'deceptive defaults or decoy choices',
        'using authority, vulnerability, identity, or social proof to override agency',
        'treating a probabilistic pattern as a diagnosis or individual certainty'
      ]
    };
  }

  function buildDomainV6(payload) {
    const base = typeof originalDomain === 'function'
      ? originalDomain(payload)
      : { normalizedTitle: payload?.offer?.name || 'Your offer', family: 'general' };
    const relationshipModel = inferRelationship(payload, base);
    return { ...base, relationshipModel };
  }

  function relationTerm(relationship, plural = false) {
    if (!relationship) return plural ? 'customers' : 'customer';
    return plural ? relationship.audiencePlural : relationship.audienceSingular;
  }

  function genericPrimaryPost(report, relationship, domain) {
    const plural = relationTerm(relationship, true);
    const singular = relationTerm(relationship, false);
    const firstSituation = report?.leadWithProblem?.situations?.[0] || domain?.situations?.[0] || 'Not sure what the right next step is?';
    const opportunity = report?.opening?.opportunity || 'Start with the outcome you need and work backward from there.';
    return `${firstSituation}\n\nYou do not need to understand every professional option before asking for help. Start with what you are trying to accomplish, what feels unclear, and what would need to be different afterward.\n\nA useful ${relationship?.providerRole || 'provider'} should help a ${singular} understand the next useful step rather than make ${plural} learn the profession first.\n\n${opportunity}`;
  }

  function relationshipPrimaryPost(report, relationship, domain) {
    switch (relationship?.id) {
      case 'education_student':
        return `Not sure where to start?\n\nYou do not need to know exactly what class or level you need before asking for help.\n\nStart with three questions:\nWhat are you trying to learn?\nWhat are you hoping to be able to do with it?\nWhere are you getting stuck right now?\n\nA good teacher can help you figure out the next useful step from there.\n\nYou do not have to understand the entire learning path before you begin. You just need a clear enough starting point to make progress.`;
      case 'physician_patient':
        return `You do not need the perfect medical terminology before talking with a physician.\n\nStart with what changed, what you have noticed, how it is affecting you, and what you need help understanding.\n\nA useful medical conversation should help you understand what is known, what is still uncertain, what options exist, and what the next step is.\n\nGood care should make the decision clearer without asking you to become the medical expert.`;
      case 'couples_counseling':
        return `You do not have to arrive at counseling already agreeing on what the problem is.\n\nStart with what each of you is noticing, what keeps becoming difficult, and what you hope could be different between you.\n\nA useful counseling process should create enough structure for both partners to be heard without deciding in advance that one person is the problem.\n\nYou can begin with the relationship you have now, not a perfectly shared explanation of it.`;
      default:
        return genericPrimaryPost(report, relationship, domain);
    }
  }

  function applyRelationshipLanguage(report, relationship, domain) {
    if (!report) return report;
    const plural = relationTerm(relationship, true);
    const singular = relationTerm(relationship, false);
    const result = typeof structuredClone === 'function' ? structuredClone(report) : JSON.parse(JSON.stringify(report));

    if (result.opening?.lead) {
      result.opening.lead = result.opening.lead
        .replace(/^Your customers are/i, `Your ${plural} are`)
        .replace(/^Customers are/i, `${plural.charAt(0).toUpperCase()}${plural.slice(1)} are`);
    }
    if (result.leadWithProblem) {
      result.leadWithProblem.intro = `Talk less about capabilities, credentials, or professional terminology in isolation. Talk more about situations your ${singular} already recognizes.`;
      result.leadWithProblem.closing = `That lets ${plural} recognize their situation before they have to understand your profession or process in depth.`;
    }
    if (result.publicAdvice) {
      result.publicAdvice.title = 'Give useful advice publicly';
      result.publicAdvice.intro = `Your public content should regularly help ${plural} understand the decision better. Useful advice demonstrates judgment before they have to trust a claim.`;
    }
    if (result.communicationRule?.guidance) {
      result.communicationRule.guidance = `Use this pattern consistently across your website, social content, conversations, and examples. Do not make ${plural} learn your profession before they can decide whether the next step fits them.`;
    }

    result.relationshipModel = relationship;
    result.publishNow = {
      title: 'YOU CAN POST THIS NOW',
      copy: relationshipPrimaryPost(result, relationship, domain),
      purpose: `Give ${plural} immediate value by naming a recognizable situation, offering one useful piece of guidance, and making the next decision easier.`
    };
    result.messageParts = {
      recognizableSituations: (result.leadWithProblem?.situations || []).slice(0, 4),
      usefulAdvice: (result.decisionRisk?.examples || []).slice(0, 4),
      simplerDecision: unique([result.valueVisibility?.use, result.opening?.opportunity]).slice(0, 4)
    };

    const existingPosts = result.publicAdvice?.posts || [];
    if (result.publicAdvice) {
      result.publicAdvice.posts = [result.publishNow.copy, ...existingPosts.filter(post => post !== result.publishNow.copy)].slice(0, 4);
    }
    return result;
  }

  function buildPlaybookV6(payload) {
    const base = typeof originalPlaybook === 'function' ? originalPlaybook(payload) : {};
    const domain = buildDomainV6(payload);
    const relationship = domain.relationshipModel;
    const report = applyRelationshipLanguage(base, relationship, domain);
    report.playbookVersion = CONTRACT_VERSION;
    report.domainModel = domain;
    report.marketingPsychology = inferMarketingPsychology(payload, relationship);
    return report;
  }

  function buildLocalV6(payload) {
    const legacy = typeof originalLocal === 'function'
      ? originalLocal(payload)
      : { status: 'complete', source: 'local', generatedAt: new Date().toISOString(), audienceIntelligence: {} };
    const humanReport = buildPlaybookV6(payload);
    const audienceIntelligence = legacy.audienceIntelligence || {};
    audienceIntelligence.domainModel = humanReport.domainModel;
    audienceIntelligence.relationshipModel = humanReport.relationshipModel;
    audienceIntelligence.marketingPsychology = humanReport.marketingPsychology;
    audienceIntelligence.communicationPlaybook = {
      version: CONTRACT_VERSION,
      outputGoal: 'calculate high-probability domain, relationship, and behavioral patterns early; use survey evidence to confirm/refine them; give useful outward communication first'
    };
    return {
      ...legacy,
      source: 'local_relationship_playbook_v6',
      humanReport,
      audienceIntelligence
    };
  }

  function buildRequestV6(payload) {
    const base = typeof originalRequestBuilder === 'function'
      ? originalRequestBuilder(payload)
      : { payload };
    const domain = buildDomainV6(payload);
    const psychology = inferMarketingPsychology(payload, domain.relationshipModel);

    return {
      ...base,
      contractVersion: CONTRACT_VERSION,
      task: 'audience_relationship_psychology_communication_playbook',
      methodology: {
        sourceSkill: MARKETING_PSYCHOLOGY_SOURCE,
        principle: 'Calculate first. Ask only where the answer materially improves, distinguishes, or corrects the working audience model.',
        psychology,
        relationshipModel: domain.relationshipModel
      },
      instructions: [
        'PHASE 0 — MAXIMUM EARLY INFERENCE. Use the entered role, profession, service, offer type, and any reliable public context to calculate as much high-probability audience information as possible before leaning on survey answers. Treat these as priors, not provider-specific facts.',
        'PHASE 1 — RELATIONSHIP MODEL. Infer the natural provider-to-audience relationship vocabulary and dynamics: who chooses, pays, approves, participates, uses, influences, and benefits; expertise and authority asymmetry; vulnerability; shared responsibility; relationship duration; multi-stakeholder complexity; trust requirements; and agency requirements.',
        'Use natural relationship terms in customer-facing language. Examples include teacher/student, physician/patient, attorney/client, counselor/client, and couples counselor/couple/partners/family. Do not force every relationship into customer/buyer language.',
        'PHASE 2 — MARKETING PSYCHOLOGY. Apply the referenced marketing-psychology skill as a decision-understanding framework. Relevant models include Jobs to Be Done, probabilistic thinking, Map ≠ Territory, Hick’s Law, paradox of choice, activation energy, status-quo bias, regret aversion, social proof, authority bias, framing, reciprocity, and choice architecture.',
        'Use psychology to identify likely decision friction and improve clarity. Do not use it to manufacture urgency, amplify fear, exploit vulnerability, create deceptive defaults/decoys, or override agency.',
        'PHASE 3 — SURVEY REFINEMENT. Treat the form options as discriminative behavioral signals. Look for combinations of signals rather than isolated answers. Use them to confirm, weaken, distinguish, or contradict the domain and relationship priors.',
        'Do not reward agreement with the inferred model. Contradictory provider evidence is valuable and should change the result when it is stronger than a general prior.',
        'PHASE 4 — PUBLISH-FIRST PLAYBOOK. Give the user one complete, immediately usable outward communication first. It must provide useful advice to the audience before asking for attention, trust, or commitment.',
        'Reverse-engineer that primary communication into reusable parts: recognizable situation, useful advice, and simpler decision/next step. Then provide additional complete copy/paste variations.',
        'The primary publish-now message must be intentionally selected as the strongest application of the analysis. Do not merely promote the first generic social post.',
        'Keep internal persona labels, psychology model names, confidence scoring, and evidence mechanics behind the curtain unless they are necessary to explain a recommendation.',
        ...(base.instructions || [])
      ],
      requiredRelationshipModel: {
        providerRole: 'string',
        audienceSingular: 'string',
        audiencePlural: 'string',
        decisionRoles: ['string'],
        dynamics: {
          expertiseAsymmetry: 'string',
          authorityAsymmetry: 'string',
          vulnerability: 'string',
          sharedResponsibility: 'string',
          duration: 'string',
          multiStakeholder: 'string',
          trustRequirement: 'string',
          agencyRequirement: 'string'
        },
        confidence: 'high | moderate | low',
        evidenceBasis: 'domain prior | provider evidence | public evidence | combination'
      },
      requiredHumanReport: {
        ...(base.requiredHumanReport || {}),
        relationshipModel: 'object',
        publishNow: { title: 'YOU CAN POST THIS NOW', copy: 'string', purpose: 'string' },
        messageParts: {
          recognizableSituations: ['string'],
          usefulAdvice: ['string'],
          simplerDecision: ['string']
        },
        marketingPsychology: {
          appliedModels: [{ id: 'string', models: ['string'], matchedSignals: ['string'], implication: 'string' }]
        }
      },
      payload
    };
  }

  async function requestV6(payload) {
    const analysisRequest = buildRequestV6(payload);
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
        throw new Error('Audience analysis response does not match relationship/psychology contract.');
      }
      return result;
    }
    return buildLocalV6(payload);
  }

  window.buildAudienceRelationshipModel = payload => inferRelationship(payload, buildDomainV6(payload));
  window.buildAudienceMarketingPsychology = payload => {
    const domain = buildDomainV6(payload);
    return inferMarketingPsychology(payload, domain.relationshipModel);
  };
  window.buildAudienceDomainModel = buildDomainV6;
  window.buildAudiencePlaybook = buildPlaybookV6;
  window.buildLLMAnalysisRequest = buildRequestV6;
  window.buildLocalAudienceAnalysis = buildLocalV6;
  window.requestAudienceAnalysis = requestV6;
})();
