(() => {
  const CONTRACT_VERSION = '5.0';
  const originalLocalAnalysis = window.buildLocalAudienceAnalysis;
  const originalRenderResults = window.renderResults;

  const DOMAIN_FAMILIES = [
    {
      id: 'drone_aerial',
      match: /\b(drone|uas|uav|aerial pilot|aerial imaging|aerial survey)\b/i,
      customerNeed: 'better information, clearer documentation, or a perspective they cannot easily get themselves',
      capabilityContrast: 'The customer usually does not need to understand the aircraft, sensors, flight planning, or production technique before they can understand the value.',
      situations: [
        'Need to document what changed?',
        'Need a clearer view of a site before making a decision?',
        'Need measurements without sending someone into a difficult area?',
        'Need a record everyone involved can look at and understand?'
      ],
      resistance: [
        'Do I really need this?',
        'Will I get something useful from it?',
        'Will this become complicated?',
        'Can I trust this person to recommend what I actually need?'
      ],
      examples: [
        'Not every project needs a complex aerial survey.',
        'Sometimes a few well-planned captures are enough.',
        "Tell me what decision you're trying to make and I'll help determine what information is actually useful."
      ],
      publicAdvice: [
        `Before hiring a drone pilot, start with one question:\n\nWhat do I need to know when this project is finished?\n\nDo you need to see something more clearly?\nMeasure it?\nDocument today's condition?\nCompare it six months from now?\nGive someone else reliable information to work from?\n\nStart there.\n\nA good drone pilot can help determine the right way to collect the information.`,
        `You may not need the biggest drone solution.\n\nSometimes the right answer is a few carefully planned images.\n\nSometimes you need repeatable documentation, measurements, mapping, scanning, or inspection data.\n\nThe important part isn't using more technology.\n\nIt's collecting the information you actually need.`,
        `If you're comparing drone pilots, don't only ask what they fly.\n\nAsk:\n\nWhat will I receive?\nWill it give me the information I need?\nWhat happens if conditions change?\nCan I use the result the way I intend to?\n\nThe aircraft matters.\n\nThe judgment behind the flight matters more.`,
        `Not sure what kind of drone service you need?\n\nYou don't need to know.\n\nTell me:\n\nWhat are you trying to understand?\nWhat needs to be documented?\nWho needs to use the information afterward?\n\nThat's enough to start the conversation.`
      ],
      rule: 'Name a situation they recognize → give them one useful piece of advice → show how you help simplify the decision.',
      desiredThought: 'This person understands the problem I’m trying to solve and will help me figure out what I actually need.'
    },
    {
      id: 'inspection_survey_measurement',
      match: /\b(inspector|inspection|surveyor|surveying|estimator|assessor|appraiser|testing|technician|field technician)\b/i,
      customerNeed: 'reliable information they can use to understand a condition, compare options, document evidence, or make a decision',
      capabilityContrast: 'The technical method matters, but the buyer usually cares more about whether the findings are accurate, understandable, and useful for the next decision.',
      situations: [
        'Need to understand a condition before making a decision?',
        'Need documentation another person can review or act on?',
        'Need measurements or findings you can compare over time?',
        'Need an expert to distinguish what matters from what is merely visible?'
      ],
      resistance: ['What will I actually learn?', 'How reliable is the result?', 'Will I understand the findings?', 'Will the information help me decide what to do next?'],
      examples: ['Explain what the customer will be able to know afterward.', 'Show an example of how findings are organized or explained.', 'Separate data collection from the judgment the customer will need next.'],
      rule: 'Start with the decision the information must support → explain what will be collected → show how the result becomes usable.',
      desiredThought: 'This person will give me information I can actually use.'
    },
    {
      id: 'repair_trades',
      match: /\b(mechanic|repair|plumber|plumbing|electrician|electrical|hvac|roofer|roofing|maintenance|appliance|handyman|automotive)\b/i,
      customerNeed: 'a problem solved with recommendations they can understand and trust',
      capabilityContrast: 'Customers often cannot independently judge the technical recommendation, so the provider’s reasoning becomes part of the service.',
      situations: ['Something stopped working and you need to know what matters first?', 'Trying to decide whether a repair is urgent or can wait?', 'Comparing recommendations that do not seem to say the same thing?', 'Need to understand the cost before approving the work?'],
      resistance: ['What actually needs to be done?', 'What can reasonably wait?', 'Why are you recommending this?', 'How do I know I am not paying for more than I need?'],
      examples: ['Separate what needs attention now from what can reasonably wait.', 'Show the customer the reason behind the recommendation.', 'Make the tradeoffs understandable before asking for approval.'],
      rule: 'Show the problem → explain the judgment → separate what is necessary from what is optional.',
      desiredThought: 'I understand why this is being recommended and I still own the decision.'
    },
    {
      id: 'care_service',
      match: /\b(daycare|child care|childcare|caregiver|home care|elder care|pet care|dog care|boarding|nanny|care provider)\b/i,
      customerNeed: 'reliable care they can feel comfortable trusting when they cannot be there themselves',
      capabilityContrast: 'The customer is not only buying time or supervision; they are handing over responsibility and judging whether the provider will notice, respond, and communicate well.',
      situations: ['Need dependable care while you are at work or away?', 'Trying to decide who you can trust with something important?', 'Need a provider who will notice individual needs rather than use one routine for everyone?', 'Want to know how changes or concerns will be communicated?'],
      resistance: ['Will you notice what matters when I am not there?', 'How do you decide what good care looks like?', 'What happens if something changes?', 'How will I know what actually happened?'],
      examples: ['Explain what staff pay attention to during an ordinary day.', 'Make communication expectations visible before the customer has to ask.', 'Show how individual needs can change the way care is provided, if that is true.'],
      rule: 'Name the responsibility they are handing over → make your standards visible → show how you communicate when something changes.',
      desiredThought: 'I can see how these people think about the responsibility I am trusting them with.'
    },
    {
      id: 'health_wellbeing',
      match: /\b(doctor|physician|nurse|therapist|counselor|psychologist|psychiatrist|clinic|dentist|physical therapist|occupational therapist|chiropractor|health coach|wellness)\b/i,
      customerNeed: 'professional help that feels understandable, appropriate to their situation, and respectful of their ability to make informed choices',
      capabilityContrast: 'The customer may not be able to evaluate clinical or technical expertise directly, so clarity, scope, expectations, and appropriate evidence matter heavily.',
      situations: ['Trying to understand what kind of help fits your situation?', 'Need professional guidance without knowing the right terminology?', 'Comparing options and trying to understand what each one is designed to do?', 'Want to know what the process will ask of you before you begin?'],
      resistance: ['Is this appropriate for my situation?', 'What should I expect from the process?', 'How will I know whether this is helping?', 'Will I be treated as a person rather than a problem to process?'],
      examples: ['Explain scope and expectations without promising an outcome.', 'Clarify what the service can and cannot determine or change.', 'Use plain language and preserve the person’s ability to make informed choices.'],
      rule: 'Start with the person’s question or goal → explain what the service can realistically help with → make expectations and choices clear.',
      desiredThought: 'I understand what this professional can help with and I can decide whether it fits me.'
    },
    {
      id: 'legal_financial_advisory',
      match: /\b(attorney|lawyer|legal|accountant|accounting|bookkeeper|bookkeeping|financial advisor|financial planner|tax preparer|cpa|insurance agent|mortgage broker)\b/i,
      customerNeed: 'expert judgment around a consequential decision they do not want to navigate blindly',
      capabilityContrast: 'The buyer is often relying on expertise they cannot fully verify, so understandable reasoning, boundaries, costs, and choices are central to trust.',
      situations: ['Facing a decision with financial, legal, or long-term consequences?', 'Need help understanding choices before committing?', 'Trying to avoid an expensive mistake without becoming an expert yourself?', 'Need someone to make complexity easier to act on?'],
      resistance: ['Do you understand situations like mine?', 'Will I understand what you are recommending?', 'What choices do I still have?', 'What will this cost and what changes that cost?'],
      examples: ['Explain the decision before the terminology.', 'Show the tradeoffs between realistic options.', 'Make scope, fees, and limits visible before asking for commitment.'],
      rule: 'Name the decision → clarify the choices and consequences → make expert reasoning understandable enough for the client to retain agency.',
      desiredThought: 'This person can help me understand the decision without taking it away from me.'
    },
    {
      id: 'consulting_professional',
      match: /\b(consultant|consulting|advisor|adviser|coach|strategist|architect|engineer|project manager|recruiter|hr|human resources)\b/i,
      customerNeed: 'expert judgment that makes an important or complicated business or personal decision easier to understand and act on',
      capabilityContrast: 'The work is often intangible before purchase, so buyers need to understand how the expert thinks, what changes because of the engagement, and what they will be able to do afterward.',
      situations: ['Facing a decision that feels too important to figure out alone?', 'Need expertise but do not know the right terminology yet?', 'Trying to compare choices with different tradeoffs?', 'Need a clear next step without giving up control of the decision?'],
      resistance: ['Will you understand my specific situation?', 'What will be different after working together?', 'Will I understand the recommendation?', 'How do I know this is more than generic advice?'],
      examples: ['Show how you diagnose the situation before prescribing a solution.', 'Use examples that reveal judgment rather than only credentials.', 'Explain what the client will understand, decide, or be able to do afterward.'],
      rule: 'Start with the decision they are facing → show how you think about it → make the path and tradeoffs understandable.',
      desiredThought: 'This person understands the situation and can help me make a better decision.'
    },
    {
      id: 'creative_media',
      match: /\b(designer|design|photographer|photography|videographer|video|branding|brand strategist|creative|media|copywriter|writer|producer|marketing)\b/i,
      customerNeed: 'a useful finished result they can picture, understand, and confidently use',
      capabilityContrast: 'The customer usually cares more about what the finished work will help them communicate or accomplish than the production technique itself.',
      situations: ['Need to explain something more clearly?', 'Need a visual or written result other people can understand or act on?', 'Have an idea but are not sure what format or deliverable will work best?', 'Need someone to handle production without losing sight of the actual goal?'],
      resistance: ['Will you understand what I am trying to accomplish?', 'What will I actually receive?', 'What do you need from me?', 'How do I judge whether this is the right solution before I buy it?'],
      examples: ['Start with the result the customer needs, not the production technique.', 'Make deliverables and revision expectations clear before work begins.', 'Show examples with context about what each example helped accomplish.'],
      rule: 'Name the result they need → reduce uncertainty about the process → show what they will be able to do with the finished work.',
      desiredThought: 'This person understands the result I need and can make the process manageable.'
    },
    {
      id: 'software_it',
      match: /\b(software|developer|programmer|it consultant|information technology|cybersecurity|web developer|web design|systems administrator|network|automation|saas)\b/i,
      customerNeed: 'a technical result that solves a practical problem without forcing them to become the technical expert',
      capabilityContrast: 'The implementation may be highly technical, but the buyer usually needs clarity about the business problem, reliability, ownership, support, risk, and what changes for users.',
      situations: ['Need a process to work more reliably or with less manual effort?', 'Need technology to solve a business problem but are not sure what architecture is appropriate?', 'Trying to understand what must be fixed now versus improved later?', 'Need a technical partner who can explain tradeoffs without burying the decision in jargon?'],
      resistance: ['Will this actually solve the problem I have?', 'Will I understand what I am buying?', 'What happens when something breaks or requirements change?', 'Will I become dependent on a system I cannot manage?'],
      examples: ['Lead with the workflow or business problem before the technology stack.', 'Explain tradeoffs in reliability, complexity, ownership, and maintenance.', 'Clarify what the client will own, manage, or depend on after delivery.'],
      rule: 'Name the workflow problem → explain the practical tradeoffs → show how the technical solution reduces rather than transfers complexity.',
      desiredThought: 'This person can translate the technical decision into something I can understand and manage.'
    },
    {
      id: 'construction_property',
      match: /\b(contractor|construction|builder|carpenter|landscap|remodel|renovation|real estate|realtor|property manager|property management)\b/i,
      customerNeed: 'a significant property or project outcome with fewer surprises, clearer expectations, and confidence that important details will be managed',
      capabilityContrast: 'Customers can see the finished result, but may struggle to judge scope, sequencing, hidden conditions, pricing logic, and project risk before work begins.',
      situations: ['Planning a project where cost and scope can change quickly?', 'Trying to compare proposals that are structured differently?', 'Need to understand what is included before making a commitment?', 'Want fewer surprises as conditions change?'],
      resistance: ['What is actually included?', 'What could change the cost or schedule?', 'How will changes be handled?', 'How do I compare this proposal with another one?'],
      examples: ['Make assumptions and exclusions visible.', 'Explain what commonly changes scope or schedule.', 'Help the customer compare proposals based on outcome and responsibility, not just the bottom-line number.'],
      rule: 'Name the project outcome → make scope and uncertainty visible → show how changes and responsibilities will be handled.',
      desiredThought: 'I understand what I am agreeing to and how this person handles the parts that could change.'
    },
    {
      id: 'education_training',
      match: /\b(teacher|tutor|trainer|training|instructor|educator|course|workshop|school|lesson|mentor)\b/i,
      customerNeed: 'a believable path from what they know or can do now to what they want to understand or accomplish next',
      capabilityContrast: 'The curriculum matters, but buyers often care more about fit, pace, practical application, support, and whether the learning will transfer into real ability.',
      situations: ['Need to learn something for a specific goal?', 'Have tried to learn this before but struggled to apply it?', 'Trying to choose the right level or format?', 'Need instruction that fits how you will actually use the skill?'],
      resistance: ['Is this the right level for me?', 'Will I actually be able to use what I learn?', 'How much support will I need?', 'What will I be able to do afterward?'],
      examples: ['Describe the capability the learner should gain, not only the topics covered.', 'Help people choose the right starting level.', 'Show how practice and feedback connect to the real-world use of the skill.'],
      rule: 'Name the learner’s goal → show the next useful capability → make the path and expectations visible.',
      desiredThought: 'This person understands what I am trying to learn and can help me make usable progress.'
    },
    {
      id: 'hospitality_events_personal',
      match: /\b(restaurant|cater|chef|event planner|wedding|hotel|hospitality|salon|barber|stylist|massage|personal trainer|fitness|florist)\b/i,
      customerNeed: 'an experience or personal result that feels appropriate to the occasion, preferences, and level of effort they want to manage themselves',
      capabilityContrast: 'Customers may judge the result emotionally and experientially, while still needing clarity around fit, timing, expectations, personalization, and what is included.',
      situations: ['Planning something where the experience matters as much as the transaction?', 'Need help turning preferences into a workable plan?', 'Want a result that feels personal without managing every detail yourself?', 'Trying to understand what is included and what choices you need to make?'],
      resistance: ['Will this fit what I actually want?', 'How much do I need to manage myself?', 'What is included?', 'What happens if preferences or circumstances change?'],
      examples: ['Ask about the desired experience before presenting packages.', 'Clarify what the customer chooses and what you handle.', 'Show examples that explain why a particular solution fit that situation.'],
      rule: 'Start with the experience they want → clarify the choices that matter → reduce the coordination they have to manage.',
      desiredThought: 'This person understands the experience I want and will make it easier to get there.'
    },
    {
      id: 'general',
      match: /.*/,
      customerNeed: 'a useful result without unnecessary uncertainty, effort, or risk',
      capabilityContrast: 'The customer usually does not need to understand the profession in the same depth as the provider; they need to understand the problem, the result, the important tradeoffs, and why the recommendation fits.',
      situations: ['Trying to solve a problem but not sure which option fits?', 'Comparing alternatives and trying to understand the real differences?', 'Need a useful result without adding more complexity?', 'Want enough information to make a confident decision?'],
      resistance: ['Is this really the right solution for my situation?', 'What will I actually get from it?', 'How difficult will the process be?', 'Can I trust the recommendation?'],
      examples: ['Explain who the offer is useful for and when it may not be necessary.', 'Make the expected result and next step understandable before asking for commitment.', 'Help people compare choices instead of treating comparison as resistance.'],
      rule: 'Name a situation they recognize → give them one useful piece of advice → show how you simplify the decision.',
      desiredThought: 'This person understands what I am trying to accomplish and will help me make a good decision.'
    }
  ];

  const VALUE_MOVES = {
    'Honesty': ['reduce the fear of being sold more than the customer actually needs', 'include limits, tradeoffs, and situations where a simpler option may be enough'],
    'Fairness': ['make recommendations and pricing feel understandable rather than arbitrary', 'explain why one option costs more, what changes, and what the customer receives for the difference'],
    'Personal attention': ['show that the customer’s specific situation will change your recommendation', 'ask about the decision, outcome, constraints, and intended use before prescribing a solution'],
    'Expertise': ['turn specialized knowledge into better customer judgment', 'explain the reasoning and tradeoffs instead of relying on credentials alone'],
    'Reliability': ['reduce the attention the customer has to spend wondering what will happen next', 'make timing, follow-through, responsibilities, and communication expectations predictable'],
    'Safety': ['show that risk is noticed and managed rather than dismissed with a promise', 'explain what is monitored, what changes a decision, and how exceptions are handled'],
    'Quality': ['help customers understand what better work actually changes for them', 'show the standards, choices, and details that materially affect the result'],
    'Convenience': ['remove unnecessary effort without making the customer feel rushed', 'make the next step simple and explain what you handle versus what the customer must provide'],
    'Human connection': ['make the customer feel recognized rather than processed', 'use questions and examples that show you adapt to the person and situation in front of you'],
    'Helping people understand their choices': ['increase confidence without taking ownership of the decision away from the customer', 'show options, tradeoffs, and consequences in language the customer can use'],
    'Giving people control': ['reduce resistance by making choice, timing, and tradeoffs explicit', 'show where the customer can choose and what each choice changes']
  };

  const clean = (values = []) => values.filter(value => value && value !== "I'm not sure" && value !== 'Something else');
  const unique = values => [...new Set(values.filter(Boolean))];
  const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const natural = values => values.length < 2 ? (values[0] || '') : values.length === 2 ? `${values[0]} and ${values[1]}` : `${values.slice(0, -1).join(', ')}, and ${values.at(-1)}`;

  function inferDomainModel(payload) {
    const raw = payload.offer?.name?.trim() || 'Your offer';
    const family = DOMAIN_FAMILIES.find(item => item.match.test(raw)) || DOMAIN_FAMILIES.at(-1);
    return {
      normalizedTitle: raw,
      family: family.id,
      inferenceLevel: family.id === 'general' ? 'general high-probability fallback' : 'high-probability title/domain inference',
      customerNeed: family.customerNeed,
      capabilityContrast: family.capabilityContrast,
      situations: family.situations,
      resistance: family.resistance,
      examples: family.examples,
      publicAdvice: family.publicAdvice || [],
      rule: family.rule,
      desiredThought: family.desiredThought
    };
  }

  function enrichResistance(payload, domain) {
    const hesitation = clean(payload.audienceEvidence?.resistanceSignals);
    const needs = clean(payload.audienceEvidence?.decisionNeeds);
    const questions = [...domain.resistance];
    if (hesitation.includes('Price')) questions.unshift('Is this worth the cost for what I actually need?');
    if (hesitation.includes('Fear of making the wrong choice')) questions.unshift('How do I know I am choosing the right level of solution?');
    if (hesitation.includes('Lack of trust')) questions.unshift('Can I trust the recommendation, not just the sales claim?');
    if (needs.includes('Proof that it works')) questions.push('What can I look at that helps me judge the result for myself?');
    if (needs.includes('A clear price')) questions.push('What changes the price and what do I receive for the difference?');
    return unique(questions).slice(0, 4);
  }

  function makeValueStrategy(payload, domain) {
    const values = clean(payload.businessEvidence?.providerValues).slice(0, 4);
    const moves = values.filter(value => VALUE_MOVES[value]).slice(0, 3).map(value => ({ value, benefit: VALUE_MOVES[value][0], proof: VALUE_MOVES[value][1] }));
    const hesitation = clean(payload.audienceEvidence?.resistanceSignals);
    const honestyFairness = values.includes('Honesty') && values.includes('Fairness');
    return {
      title: honestyFairness || hesitation.includes('Price') || hesitation.includes('Fear of making the wrong choice') ? 'Reduce the fear of buying the wrong thing' : 'Make the decision easier to trust',
      intro: honestyFairness ? 'Your values of Honesty and Fairness are strongest when you openly help customers understand what they need, what they may not need, and why one option makes more sense than another.' : moves.length ? `Your value of ${moves[0].value} becomes useful when it helps the customer ${moves[0].benefit}.` : 'Use the standards behind your work to reduce a real customer concern, not simply as adjectives about the business.',
      moves,
      examples: domain.examples.slice(0, 3)
    };
  }

  function makeVisibleValue(payload, domain) {
    const values = clean(payload.businessEvidence?.providerValues);
    const order = ['Personal attention', 'Expertise', 'Reliability', 'Safety', 'Human connection', 'Helping people understand their choices', 'Giving people control', 'Quality', 'Convenience'];
    const value = order.find(item => values.includes(item)) || values[0] || null;
    if (domain.family === 'drone_aerial' && value === 'Personal attention') {
      return { title: 'Make Personal Attention visible', intro: 'Personal Attention matters when the customer can see that their situation changes your recommendation.', avoid: 'Contact us for your drone needs.', use: "Tell me what you're trying to see, measure, document, or understand. We'll work backward from there." };
    }
    const move = value && VALUE_MOVES[value];
    return {
      title: value ? `Make ${value} visible` : 'Make your values visible',
      intro: value && move ? `${value} becomes persuasive when customers can see it in how you help them decide.` : 'Make the standards behind your work visible in the way you explain choices and next steps.',
      avoid: value ? `We care about ${value.toLowerCase()}.` : 'We care about our customers.',
      use: value && move ? `Show it by helping the customer ${move[0]}, and ${move[1]}.` : 'Show what changes in your recommendation, process, or communication because of that standard.'
    };
  }

  function genericSocialPosts(payload, domain) {
    const title = payload.offer?.name || 'this service';
    const s = domain.situations;
    return [
      `Before hiring someone for ${title.toLowerCase()}, start with the result you need.\n\nWhat decision are you trying to make?\nWhat needs to be clearer afterward?\nWho needs to use the result?\n\nStart there. A useful provider should help determine the right level of solution.`,
      `${s[0]}\n\nDo not start by learning every technical option. Start by explaining the situation and the outcome you need.\n\nThe provider's job is to help translate that into the right solution.`,
      `If you're comparing providers, ask more than “What do you offer?”\n\nAsk:\nWhat will I receive?\nWhy does this fit my situation?\nWhat might I not need?\nWhat happens if conditions change?\n\nThe judgment behind the recommendation matters as much as the list of capabilities.`
    ];
  }

  function buildPlaybook(payload) {
    const domain = inferDomainModel(payload);
    const offerName = payload.offer?.name || 'Your offer';
    const values = clean(payload.businessEvidence?.providerValues).slice(0, 3);
    return {
      playbookVersion: CONTRACT_VERSION,
      offerName,
      domainModel: domain,
      opening: {
        lead: `Your customers are often hiring you because they need ${domain.customerNeed}.`,
        capabilityContrast: domain.capabilityContrast,
        resistanceQuestions: enrichResistance(payload, domain),
        opportunity: 'Your strongest communication opportunity is to answer those questions before someone has to ask them.'
      },
      leadWithProblem: {
        title: 'Lead with their problem',
        intro: 'Talk less about equipment, capabilities, credentials, or professional terminology in isolation. Talk more about situations your customer already recognizes.',
        situations: domain.situations.slice(0, 4),
        closing: 'That makes the customer think about their problem instead of trying to understand your profession before they can decide whether to contact you.'
      },
      decisionRisk: makeValueStrategy(payload, domain),
      valueVisibility: makeVisibleValue(payload, domain),
      publicAdvice: {
        title: 'Give useful advice publicly',
        intro: 'Your public content should regularly help customers become better buyers of the service. Useful advice demonstrates judgment before the customer has to trust a claim.',
        posts: (domain.publicAdvice.length ? domain.publicAdvice : genericSocialPosts(payload, domain)).slice(0, 4)
      },
      communicationRule: {
        title: 'Your communication rule',
        pattern: domain.rule,
        guidance: 'Use this pattern consistently across your website, social content, sales conversations, and examples. Do not make the customer learn your profession before they can hire you.',
        desiredThought: domain.desiredThought,
        valuesClosing: values.length ? `That is where ${natural(values)} become reasons to work with you rather than simply values listed on your website.` : 'That is where the standards behind your work become reasons to choose you rather than generic claims.'
      }
    };
  }

  function buildLocal(payload) {
    const legacy = typeof originalLocalAnalysis === 'function' ? originalLocalAnalysis(payload) : { audienceIntelligence: {} };
    const report = buildPlaybook(payload);
    const intelligence = legacy.audienceIntelligence || {};
    intelligence.domainModel = report.domainModel;
    intelligence.communicationPlaybook = { version: CONTRACT_VERSION, outputGoal: 'turn domain knowledge + survey evidence into problem-led communication guidance and reusable customer-facing content' };
    return { status: 'complete', source: 'local_playbook_v5', generatedAt: new Date().toISOString(), humanReport: report, audienceIntelligence: intelligence };
  }

  function buildRequest(payload) {
    return {
      contractVersion: CONTRACT_VERSION,
      task: 'audience_communication_playbook',
      instructions: [
        'PHASE 1 — DOMAIN ORIENTATION. Treat the entered job title, profession, service, or offer name as a high-value domain signal. Before interpreting the survey, build a high-probability working model of what this field normally does and how people normally buy it.',
        'Infer the normalized occupation/service category, common buyers or stakeholders, typical jobs-to-be-done, common deliverables or outcomes, common trigger situations, expertise asymmetry, what customers can and cannot easily evaluate, common overbuy/underbuy/wrong-choice risks, common trust questions, useful forms of proof, and terminology barriers.',
        'Use high-probability domain knowledge confidently when the title is clear. Mark uncertain or ambiguous details internally rather than flattening a clear occupation into generic advice. Never invent facts about the specific provider.',
        'When an optional website is supplied, use it as provider-specific evidence if the analyzer can reliably retrieve it. Distinguish website evidence from general field knowledge.',
        'PHASE 2 — SURVEY REFINEMENT. Use audience values, trigger context, emotions, decision needs, hesitation, desired movement, and provider values to refine the domain model. Survey evidence should personalize the likely customer decision; it should not erase relevant high-probability domain knowledge.',
        'PHASE 3 — COMMUNICATION PLAYBOOK. Produce practical communication guidance, not a generic audience-analysis report. Start with recognizable customer problems and likely resistance questions in natural customer language.',
        'Translate provider values into decision help. Explain what customer concern each value can reduce and how the value becomes visible through advice, choices, limits, proof, expectations, or process. Do not define values as abstract virtues.',
        'Lead with situations the buyer recognizes rather than equipment, features, credentials, jargon, or a list of capabilities.',
        'Give concrete language the provider can use. Prefer useful questions, short examples, and specific message directions over marketing adjectives.',
        'Generate three or four copy/paste social posts that help customers become better buyers of this exact type of service. Posts should demonstrate useful professional judgment rather than merely advertise.',
        'End with one repeatable communication rule: recognizable situation → useful advice → simplified decision.',
        'Treat behavioral patterns probabilistically. Do not diagnose people, manipulate vulnerability, amplify fear, manufacture urgency, or pressure the audience.',
        'Return both humanReport and audienceIntelligence. Keep domain inference, confidence, evidence provenance, and behavioral clustering available internally but do not expose taxonomy or scoring to the customer.'
      ],
      requiredDomainModel: {
        normalizedTitle: 'string', category: 'string', likelyBuyers: ['string'], commonJobsToBeDone: ['string'], commonOutcomes: ['string'], triggerSituations: ['string'], expertiseAsymmetry: 'string', hardToEvaluateBeforePurchase: ['string'], commonDecisionRisks: ['string'], commonTrustQuestions: ['string'], usefulProof: ['string'], terminologyBarriers: ['string'], confidence: 'high | moderate | low', evidenceBasis: 'general domain knowledge | website evidence | survey evidence | combination'
      },
      requiredHumanReport: {
        offerName: 'string',
        opening: { lead: 'string', capabilityContrast: 'string', resistanceQuestions: ['string'], opportunity: 'string' },
        leadWithProblem: { title: 'string', intro: 'string', situations: ['string'], closing: 'string' },
        decisionRisk: { title: 'string', intro: 'string', moves: [{ value: 'string', benefit: 'string', proof: 'string' }], examples: ['string'] },
        valueVisibility: { title: 'string', intro: 'string', avoid: 'string', use: 'string' },
        publicAdvice: { title: 'string', intro: 'string', posts: ['string'] },
        communicationRule: { title: 'string', pattern: 'string', guidance: 'string', desiredThought: 'string', valuesClosing: 'string' }
      },
      payload
    };
  }

  async function request(payload) {
    const analysisRequest = buildRequest(payload);
    window.audienceAnalysisRequest = analysisRequest;
    if (typeof window.oobAudienceAnalyzer === 'function') {
      const result = await window.oobAudienceAnalyzer(analysisRequest);
      if (result?.humanReport && result?.audienceIntelligence) return result;
    }
    if (window.OOB_AUDIENCE_ANALYSIS_ENDPOINT) {
      const response = await fetch(window.OOB_AUDIENCE_ANALYSIS_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(analysisRequest) });
      if (!response.ok) throw new Error(`Audience analysis request failed: ${response.status}`);
      const result = await response.json();
      if (!result?.humanReport || !result?.audienceIntelligence) throw new Error('Audience analysis response does not match contract.');
      return result;
    }
    return buildLocal(payload);
  }

  function render(report, payload) {
    const results = document.getElementById('results');
    if (!results) return;
    if (!report?.opening || !report?.communicationRule) {
      if (typeof originalRenderResults === 'function') return originalRenderResults(payload);
      return;
    }
    const q = report.opening.resistanceQuestions || [];
    const situations = report.leadWithProblem?.situations || [];
    const risk = report.decisionRisk || {};
    const visibility = report.valueVisibility || {};
    const posts = report.publicAdvice?.posts || [];
    const moves = risk.moves || [];
    results.innerHTML = `
      <h3>${esc(report.offerName || payload.offer?.name)}</h3>
      <p class="result-lead">${esc(report.opening.lead)}</p>
      <p>${esc(report.opening.capabilityContrast || '')}</p>
      <div class="result-group">
        <p>The resistance is more often:</p>
        ${q.map(item => `<p><strong>${esc(item)}</strong></p>`).join('')}
        <p><strong>${esc(report.opening.opportunity)}</strong></p>
      </div>
      <div class="result-group">
        <h4>${esc(report.leadWithProblem.title)}</h4>
        <p>${esc(report.leadWithProblem.intro)}</p>
        ${situations.map(item => `<p><strong>${esc(item)}</strong></p>`).join('')}
        <p>${esc(report.leadWithProblem.closing)}</p>
      </div>
      <div class="result-group">
        <h4>${esc(risk.title)}</h4>
        <p>${esc(risk.intro)}</p>
        ${moves.map(move => `<p><strong>${esc(move.value)}:</strong> Help the customer ${esc(move.benefit)}. Make that visible by ${esc(move.proof)}.</p>`).join('')}
        ${(risk.examples || []).map(item => `<div class="message-example">${esc(item)}</div>`).join('')}
      </div>
      <div class="result-group">
        <h4>${esc(visibility.title)}</h4>
        <p>${esc(visibility.intro)}</p>
        <p>Avoid generic:</p>
        <div class="message-example">${esc(visibility.avoid)}</div>
        <p>Use language closer to:</p>
        <div class="message-example">${esc(visibility.use)}</div>
      </div>
      <div class="result-group">
        <h4>${esc(report.publicAdvice.title)}</h4>
        <p>${esc(report.publicAdvice.intro)}</p>
        ${posts.map(post => `<div class="social-post"><p class="result-label">Copy/paste social post</p><div class="message-example">${esc(post).replaceAll('\n', '<br>')}</div></div>`).join('')}
      </div>
      <div class="result-group">
        <h4>${esc(report.communicationRule.title)}</h4>
        <div class="connection-summary"><strong>${esc(report.communicationRule.pattern)}</strong></div>
        <p>${esc(report.communicationRule.guidance)}</p>
        <p>Make them think:</p>
        <div class="human-question">${esc(report.communicationRule.desiredThought)}</div>
        <p><strong>${esc(report.communicationRule.valuesClosing)}</strong></p>
      </div>
      <p class="privacy">This review uses high-probability patterns about the field and the survey evidence you provided. It is intended to improve communication—not diagnose individuals, stereotype an audience, or assume every customer will respond the same way.</p>
    `;
  }

  function renderResultsV5(payload) {
    render(payload.analysis?.humanReport, payload);
  }

  window.buildAudienceDomainModel = inferDomainModel;
  window.buildAudiencePlaybook = buildPlaybook;
  window.buildLLMAnalysisRequest = buildRequest;
  window.buildLocalAudienceAnalysis = buildLocal;
  window.requestAudienceAnalysis = request;
  window.renderResults = renderResultsV5;
})();
