const ANALYSIS_CONTRACT_VERSION = "4.0";

const OFFER_TYPE_QUESTION = {
  id: "offer_type",
  title: "Which best describes it?",
  help: "Choose one.",
  max: 1,
  options: [
    "A service",
    "A physical product",
    "A digital product",
    "An experience or event",
    "A membership or subscription",
    "A cause, program or organization",
    "A professional relationship",
    "Something else"
  ]
};

const AUDIENCE_QUESTIONS = [
  {
    id: "audience_values",
    title: "What's most important to the people involved in choosing or using what you offer?",
    help: "Select up to 5.",
    max: 5,
    options: [
      "Trust", "Quality", "Price", "Reliability", "Safety", "Convenience", "Speed", "Expertise",
      "Independence", "Control", "Clear information", "Being treated fairly", "Being understood",
      "Belonging or connection", "Recognition or status", "Personal values", "Avoiding unnecessary cost",
      "Protecting people they care about", "Flexibility", "Peace of mind", "Opportunity or improvement",
      "Enjoyment", "I'm not sure"
    ]
  },
  {
    id: "audience_trigger",
    title: "What's usually happening when they become interested in what you offer?",
    help: "Select up to 4.",
    max: 4,
    options: [
      "Something has gone wrong", "They want to prevent something from going wrong",
      "They're dissatisfied with their current situation", "They want something better",
      "They have an immediate need", "They have an upcoming deadline or event",
      "They're making an important decision", "They're comparing alternatives", "Someone recommended it",
      "They're planning for the future", "Something in their life or business has changed",
      "They want to try something new", "They want to improve themselves or their situation",
      "They're supporting someone else", "They're simply curious", "I'm not sure"
    ]
  },
  {
    id: "audience_emotions",
    title: "What are they most likely feeling at that point?",
    help: "Select up to 4.",
    max: 4,
    options: [
      "Worried", "Frustrated", "Confused", "Overwhelmed", "Skeptical", "Cautious", "Distrustful",
      "Pressured", "Vulnerable", "Uncertain", "Hopeful", "Curious", "Excited", "Motivated", "Ambitious",
      "Responsible for someone else", "Ready for change", "Relieved to finally be doing something",
      "Tired of the current situation", "Confident", "I'm not sure"
    ]
  },
  {
    id: "audience_needs",
    title: "When making the decision, what do they seem to need most?",
    help: "Select up to 4.",
    max: 4,
    options: [
      "More information", "Reassurance", "Proof that it works", "Expert guidance",
      "Recommendations from other people", "Time to think", "Clear choices", "Someone to make it easier",
      "Confidence they're not making a mistake", "Control over the decision", "A clear price",
      "Lower financial risk", "Convenience", "Permission or approval from someone else",
      "Agreement from other people involved", "A reason to act now", "Inspiration or possibility",
      "A personal connection", "I'm not sure"
    ]
  },
  {
    id: "audience_hesitation",
    title: "What tends to make them hesitate or pull away?",
    help: "Select up to 4.",
    max: 4,
    options: [
      "Price", "Uncertainty", "Fear of making the wrong choice", "Lack of trust", "Not enough information",
      "Too much information", "They don't understand the value", "They don't understand the differences between options",
      "They don't believe the claims", "They don't feel ready", "They don't feel enough urgency",
      "They want someone else's opinion", "They don't want to feel pressured", "Changing feels difficult",
      "They're satisfied enough with what they already have", "Time or convenience",
      "The decision involves too many people", "They keep putting it off", "I'm not sure"
    ]
  },
  {
    id: "audience_outcome",
    title: "What are they hoping will be different afterward?",
    help: "Select up to 4.",
    max: 4,
    options: [
      "I want the problem gone", "I want to feel confident", "I want to feel safe", "I want greater control",
      "I want less stress", "I want to feel understood", "I want something I can depend on", "I want to save time",
      "I want to save money", "I want to make progress", "I want something better than I have now",
      "I want new possibilities", "I want to feel prepared", "I want to belong or participate",
      "I want to feel proud of my choice", "I want to help someone else", "I want to enjoy the experience",
      "I want to stop thinking about this", "I'm not sure"
    ]
  }
];

const BUSINESS_QUESTIONS = [
  {
    id: "business_values",
    title: "What's most important to you about how you provide this product or service?",
    help: "Select up to 4.",
    max: 4,
    required: true,
    options: [
      "Quality", "Expertise", "Honesty", "Fairness", "Reliability", "Personal attention", "Responsibility",
      "Safety", "Innovation", "Creativity", "Affordability", "Convenience", "Independence", "Community",
      "Human connection", "Helping people understand their choices", "Giving people control",
      "Creating meaningful results", "Long-term relationships", "Something else"
    ]
  },
  {
    id: "business_message",
    title: "What do you most want people to understand about what you offer?",
    help: "Optional. Select up to 2.",
    max: 2,
    required: false,
    options: [
      "We're experienced", "We're trustworthy", "We care about quality", "We understand their situation",
      "We make things easier", "We offer good value", "We give people clear choices",
      "We're different from the alternatives", "We help prevent problems", "We help people move forward",
      "We care about the outcome", "We stand behind our work", "Something else", "I'm not sure"
    ]
  }
];

/*
  Persona patterns remain behind the curtain.
  They support pattern recognition and downstream LLM context.
  They are not customer-facing labels.
*/
const PERSONA_PATTERNS = [
  {
    id: "confidence_seeker",
    name: "Confidence-Seeking Decision Maker",
    signals: ["Trust", "Clear information", "Expertise", "Uncertain", "Cautious", "More information", "Expert guidance", "Proof that it works", "Confidence they're not making a mistake", "Fear of making the wrong choice", "I want to feel confident"],
    goal: "make a good decision without feeling exposed to unnecessary uncertainty",
    connect: "clarity, visible expertise, understandable proof, and clear expectations",
    resistance: "vague claims, unexplained jargon, pressure, or expecting them to understand the service before you explain it"
  },
  {
    id: "risk_reducer",
    name: "Risk-Aware Evaluator",
    signals: ["Safety", "Reliability", "Peace of mind", "Avoiding unnecessary cost", "Worried", "Vulnerable", "Lower financial risk", "Proof that it works", "Lack of trust", "Uncertainty", "I want to feel safe", "I want something I can depend on"],
    goal: "reduce the chance of an expensive, disruptive, or consequential mistake",
    connect: "reliability, transparent limits, evidence, and realistic expectations",
    resistance: "fear amplification, artificial urgency, hidden costs, or unsupported certainty"
  },
  {
    id: "problem_solver",
    name: "Problem-Focused Customer",
    signals: ["Something has gone wrong", "They have an immediate need", "Frustrated", "Tired of the current situation", "Someone to make it easier", "Convenience", "Time or convenience", "I want the problem gone", "I want less stress", "I want to stop thinking about this"],
    goal: "remove a specific problem with as little additional friction as possible",
    connect: "a simple path, practical outcomes, responsiveness, and reduced effort",
    resistance: "complexity, long explanations before relevance is clear, or adding work to an already frustrating situation"
  },
  {
    id: "progress_seeker",
    name: "Progress-Seeking Customer",
    signals: ["Opportunity or improvement", "They want something better", "They want to improve themselves or their situation", "Hopeful", "Motivated", "Ambitious", "Ready for change", "Inspiration or possibility", "I want to make progress", "I want something better than I have now", "I want new possibilities"],
    goal: "move toward a better result, opportunity, or version of their current situation",
    connect: "visible outcomes, possibility, momentum, and a credible path forward",
    resistance: "generic promises, unclear differentiation, or communication that focuses only on avoiding problems"
  },
  {
    id: "autonomy_seeker",
    name: "Control-Seeking Evaluator",
    signals: ["Independence", "Control", "Being treated fairly", "Clear information", "Clear choices", "Control over the decision", "Time to think", "They don't want to feel pressured", "I want greater control", "I want to feel prepared"],
    goal: "retain ownership of the decision while getting enough guidance to make it well",
    connect: "choices, explanation, transparent tradeoffs, and room to decide",
    resistance: "controlling language, forced urgency, opaque recommendations, or being told what they have to do"
  },
  {
    id: "relationship_seeker",
    name: "Relationship-Driven Customer",
    signals: ["Being understood", "Belonging or connection", "Protecting people they care about", "Recommendations from other people", "A personal connection", "Responsible for someone else", "I want to feel understood", "I want to belong or participate", "I want to help someone else"],
    goal: "feel understood and confident that the people involved care about the outcome, not just the transaction",
    connect: "human attention, empathy, continuity, recommendations, and visible care",
    resistance: "impersonal processes, generic messaging, or communication that treats the decision as purely transactional"
  },
  {
    id: "value_evaluator",
    name: "Value-Conscious Comparator",
    signals: ["Price", "Avoiding unnecessary cost", "Being treated fairly", "They're comparing alternatives", "A clear price", "Lower financial risk", "They don't understand the differences between options", "I want to save money", "I want to feel confident"],
    goal: "understand what they are paying for and why one option is worth choosing over another",
    connect: "transparent pricing, understandable differences, evidence of value, and fair tradeoffs",
    resistance: "opaque packages, unexplained premiums, discount pressure, or claims that do not help them compare"
  },
  {
    id: "convenience_seeker",
    name: "Convenience-Driven Customer",
    signals: ["Convenience", "Speed", "Flexibility", "They have an immediate need", "Someone to make it easier", "Time or convenience", "I want to save time", "I want to stop thinking about this"],
    goal: "get a useful result with minimal time, effort, and coordination",
    connect: "simplicity, responsiveness, predictable process, and low-friction next steps",
    resistance: "unnecessary steps, scheduling friction, slow responses, or asking for information that does not feel necessary"
  }
];

/*
  These local context profiles keep the public review available without
  transmitting a visitor's answers to an external analysis service.
*/
const OFFER_CONTEXTS = [
  {
    id: "dog_daycare",
    match: /\b(dog|canine)\b.*\b(daycare|day care|boarding|care)\b|\b(daycare|day care|boarding)\b.*\b(dog|canine)\b/i,
    audienceDescription: "dog owners who need care while they are away but are not willing to trade peace of mind for convenience",
    decisionReality: "They are not simply buying a place for a dog to spend the day. They are trusting other people to supervise an animal they care about, around unfamiliar dogs, in an environment they cannot fully control themselves.",
    humanQuestion: "Can I trust these people to notice what my dog needs when I'm not there?",
    proofIdeas: [
      "Show how new dogs are assessed before joining group play.",
      "Explain how dogs are grouped and how staff watch for stress, overstimulation, or play that is becoming too intense.",
      "Show what happens when a dog needs rest, space, or a different level of activity.",
      "Explain how owners are updated when something important happens during the day.",
      "Make emergency procedures, staff expectations, cleanliness, and physical security easy to understand."
    ],
    barrierQuestions: [
      "Who is supervising my dog?",
      "How do you decide which dogs spend time together?",
      "What happens when a dog needs a break or looks uncomfortable?",
      "What happens if there is an injury or emergency?",
      "How will I know how my dog actually did?"
    ],
    messageExamples: [
      "You shouldn't have to spend the day wondering if your dog is okay.",
      "Not every dog plays the same way. We don't care for them as if they do.",
      "A good day at daycare is more than a tired dog. It is a dog that felt safe, comfortable, and understood while you were away."
    ],
    strongestConnection: "their desire to leave their dog somewhere they can trust"
  },
  {
    id: "entrusted_care",
    match: /\b(childcare|child care|daycare|elder care|home care|caregiver|pet care|boarding)\b/i,
    audienceDescription: "people who are handing responsibility for someone or something they care about to another person",
    decisionReality: "The practical service matters, but the emotional decision is about trust: whether the provider will pay attention, exercise sound judgment, and communicate when the customer is not there to see what is happening.",
    humanQuestion: "Can I trust these people to notice what matters when I'm not there?",
    proofIdeas: [
      "Show how people are screened, trained, or prepared for the responsibility.",
      "Explain what good judgment looks like during an ordinary day, not only during an emergency.",
      "Make supervision, communication, routines, and exceptions visible.",
      "Explain what happens when something does not go according to plan.",
      "Show how individual needs are noticed rather than treating everyone the same."
    ],
    barrierQuestions: [
      "Who is actually responsible while I am away?",
      "What standards guide their decisions?",
      "How will I know if something is not going well?",
      "What happens when an unusual situation comes up?",
      "How do you account for individual needs?"
    ],
    messageExamples: [
      "You should not have to wonder what is happening when you are not there.",
      "Good care is not only being present. It is noticing what needs attention.",
      "We make the standards behind our care visible so you can decide whether they match what matters to you."
    ],
    strongestConnection: "their need to trust another person with something important"
  },
  {
    id: "repair_service",
    match: /\b(auto repair|mechanic|hvac|plumb|roof|electrician|repair|maintenance)\b/i,
    audienceDescription: "people who need a problem solved but may not have the technical knowledge to independently judge the recommendation",
    decisionReality: "They are often deciding two things at once: whether the technical recommendation is sound and whether they can trust the person making it. The provider's judgment becomes part of the product.",
    humanQuestion: "Can I trust this recommendation, understand why it matters, and know I'm not paying for more than I need?",
    proofIdeas: [
      "Show the problem in a way the customer can understand.",
      "Separate what needs attention now from what can reasonably wait.",
      "Explain options and tradeoffs instead of presenting one opaque recommendation.",
      "Make pricing expectations and scope visible before work begins.",
      "Use experience to explain judgment, not merely as a credential."
    ],
    barrierQuestions: [
      "What actually needs to be done?",
      "What can wait?",
      "Why are you recommending this?",
      "What will it cost?",
      "How do I know this is the right fix?"
    ],
    messageExamples: [
      "We will show you what needs attention, what can wait, and why.",
      "Expertise is most useful when it helps you make a better decision.",
      "Clear recommendations. Visible reasoning. No pressure to know the technical details before you arrive."
    ],
    strongestConnection: "their need for understandable, trustworthy judgment"
  },
  {
    id: "professional_guidance",
    match: /\b(consult|attorney|lawyer|account|bookkeep|therap|counsel|coach|advisor|architect)\b/i,
    audienceDescription: "people looking for expertise because the decision is important enough that they do not want to navigate it alone",
    decisionReality: "They may be buying expertise, but they are also deciding whether the expert can understand their situation, explain complexity without making them feel uninformed, and help them retain ownership of the decision.",
    humanQuestion: "Will this person understand my situation and help me make a better decision without taking the decision away from me?",
    proofIdeas: [
      "Show how you listen before recommending.",
      "Explain complex issues in language the client can use.",
      "Make the decision process visible, including tradeoffs and limits.",
      "Use examples that show judgment rather than only credentials.",
      "Clarify where the client has choices and what each choice means."
    ],
    barrierQuestions: [
      "Do you understand situations like mine?",
      "Will I understand what you are recommending?",
      "What choices will I have?",
      "How will we know whether this is working?",
      "What happens if the situation changes?"
    ],
    messageExamples: [
      "Expert guidance should make the decision clearer, not make you more dependent on the expert.",
      "You do not need to arrive with the right terminology. That is part of our job.",
      "We make the reasoning visible so you can make an informed choice."
    ],
    strongestConnection: "their need for expertise that increases confidence rather than dependence"
  },
  {
    id: "creative_visual",
    match: /\b(drone|photo|photograph|video|design|creative|branding|media)\b/i,
    audienceDescription: "people who may be hiring a technical or creative specialist because they need a result they cannot easily produce or evaluate on their own",
    decisionReality: "The customer often cares less about the production technique than what the finished work will help them communicate, document, understand, sell, or accomplish.",
    humanQuestion: "Will this person understand the result I need and make the process easy enough that I can trust the outcome?",
    proofIdeas: [
      "Lead with the client outcome before technical capabilities.",
      "Show examples with context about the problem each example solved.",
      "Clarify what the customer needs to provide and what you handle.",
      "Set realistic expectations about process, timing, revisions, and deliverables.",
      "Translate technical expertise into visible benefits the customer can judge."
    ],
    barrierQuestions: [
      "What will I actually receive?",
      "How will this help me accomplish my goal?",
      "What do you need from me?",
      "How do I judge the quality before I hire you?",
      "What happens if conditions or requirements change?"
    ],
    messageExamples: [
      "Start with the result you need. We will handle the technical path to get there.",
      "You do not need to understand the equipment to understand what the finished work can do for you.",
      "Clear deliverables, realistic expectations, and work you can judge for yourself."
    ],
    strongestConnection: "their need for a useful outcome they can understand and trust"
  }
];

const DEFAULT_CONTEXT = {
  id: "general",
  audienceDescription: "people trying to decide whether what you offer fits their situation and is worth choosing",
  decisionReality: "A customer rarely evaluates features alone. They are also deciding whether the outcome feels useful, whether the provider feels credible, and whether the process creates more confidence than uncertainty.",
  humanQuestion: "Do I understand what this will do for me, and do I trust the people behind it enough to move forward?",
  proofIdeas: [
    "Show the outcome before explaining every feature.",
    "Make expectations, process, and next steps easy to understand.",
    "Use examples that let people judge the work rather than relying on adjectives.",
    "Explain choices and tradeoffs clearly.",
    "Answer common questions before asking for commitment."
  ],
  barrierQuestions: [
    "Is this really for someone like me?",
    "What result should I expect?",
    "Why should I trust this provider?",
    "What will the process require from me?",
    "What happens if it does not go exactly as planned?"
  ],
  messageExamples: [
    "Make the result easier to understand before asking people to choose it.",
    "Show how you work, not only what you claim.",
    "Give people enough clarity to make the decision for themselves."
  ],
  strongestConnection: "their need to understand the value and trust the path to the result"
};

const VALUE_INTERPRETATIONS = {
  "Quality": "People who care about quality usually look for evidence of judgment, consistency, standards, and attention to details that affect the result. The opportunity is to show what you do differently when quality actually matters.",
  "Safety": "People who value safety are rarely asking for a promise that nothing can ever go wrong. They want evidence that risk is noticed, managed, and communicated by people who take responsibility seriously.",
  "Trust": "Trust grows when the customer can see how decisions are made, what happens when something changes, and whether the provider is willing to be clear even when the answer is not the easiest sales answer.",
  "Reliability": "Reliability is emotional as well as operational. Predictable follow-through reduces the amount of attention the customer has to spend wondering whether the service will do what was promised.",
  "Expertise": "Expertise becomes persuasive when it makes the customer's decision easier to understand. Credentials matter, but visible judgment often matters more.",
  "Honesty": "Honesty is most credible when communication includes limits, tradeoffs, and what the customer does not need—not only reasons to buy.",
  "Fairness": "Customers who value fairness want to understand how recommendations, prices, and tradeoffs are determined so they can feel respected rather than managed.",
  "Personal attention": "Personal attention matters when the customer believes their specific situation will actually change how the provider responds.",
  "Responsibility": "Responsibility becomes visible when a provider explains what they monitor, what they own, and what they will do if circumstances change.",
  "Affordability": "Affordability is not always the same as low price. It can mean avoiding waste, knowing costs in advance, and understanding what is necessary versus optional.",
  "Convenience": "Convenience reduces decision friction. The strongest version removes unnecessary effort without making the customer feel rushed or uninformed.",
  "Human connection": "Human connection matters when the customer wants to feel recognized as a person rather than processed as a transaction.",
  "Helping people understand their choices": "Helping people understand their choices supports autonomy. It is especially strong when the customer can see tradeoffs and decide without pressure.",
  "Giving people control": "Giving people control reduces resistance by making choice, timing, and tradeoffs explicit.",
  "Creating meaningful results": "Meaningful results become easier to value when the customer can picture what will be different afterward.",
  "Long-term relationships": "A long-term relationship becomes attractive when continuity improves judgment, reduces repeated explanation, and creates confidence over time."
};

function renderQuestion(question) {
  const wrapper = document.createElement("div");
  wrapper.className = "field question";
  wrapper.dataset.question = question.id;

  const title = document.createElement("p");
  title.className = "question-title";
  title.textContent = question.title;

  const help = document.createElement("p");
  help.className = "question-help";
  help.textContent = question.help;

  const options = document.createElement("div");
  options.className = "options";

  question.options.forEach((labelText, index) => {
    const item = document.createElement("div");
    item.className = "option";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = `${question.id}-${index}`;
    input.name = question.id;
    input.value = labelText;

    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.textContent = labelText;

    input.addEventListener("change", () => enforceMaximum(question.id, question.max));

    item.appendChild(input);
    item.appendChild(label);
    options.appendChild(item);
  });

  const count = document.createElement("div");
  count.className = "selection-count";
  count.id = `${question.id}-count`;

  wrapper.appendChild(title);
  wrapper.appendChild(help);
  wrapper.appendChild(options);
  wrapper.appendChild(count);

  return wrapper;
}

document.getElementById("offer-type-question").appendChild(renderQuestion(OFFER_TYPE_QUESTION));
AUDIENCE_QUESTIONS.forEach(question => {
  document.getElementById("audience-questions").appendChild(renderQuestion(question));
});
BUSINESS_QUESTIONS.forEach(question => {
  document.getElementById("business-questions").appendChild(renderQuestion(question));
});

function enforceMaximum(questionId, max) {
  const inputs = [...document.querySelectorAll(`input[name="${questionId}"]`)];
  const selected = inputs.filter(input => input.checked);

  inputs.forEach(input => {
    const wrapper = input.closest(".option");
    if (selected.length >= max && !input.checked) {
      input.disabled = true;
      wrapper.classList.add("disabled");
    } else {
      input.disabled = false;
      wrapper.classList.remove("disabled");
    }
  });

  const counter = document.getElementById(`${questionId}-count`);
  if (counter) counter.textContent = `${selected.length} selected · up to ${max}`;
}

function showStep(stepNumber) {
  document.querySelectorAll(".step").forEach(step => {
    step.classList.toggle("active", Number(step.dataset.step) === stepNumber);
  });

  [1, 2, 3].forEach(number => {
    document.getElementById(`progress-${number}`).classList.toggle("active", number <= stepNumber);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-next]").forEach(button => {
  button.addEventListener("click", () => {
    const next = Number(button.dataset.next);
    if (next === 2 && !validateStepOne()) return;
    showStep(next);
  });
});

document.querySelectorAll("[data-back]").forEach(button => {
  button.addEventListener("click", () => showStep(Number(button.dataset.back)));
});

function questionHasSelection(questionId) {
  return Boolean(document.querySelector(`input[name="${questionId}"]:checked`));
}

function validateStepOne() {
  const offer = document.getElementById("offer").value.trim();
  const requiredIds = [OFFER_TYPE_QUESTION.id, ...AUDIENCE_QUESTIONS.map(question => question.id)];
  const complete = requiredIds.every(questionHasSelection);
  const valid = Boolean(offer) && complete;
  document.getElementById("step1-error").classList.toggle("visible", !valid);
  return valid;
}

function validateStepTwo() {
  const requiredQuestions = BUSINESS_QUESTIONS.filter(question => question.required);
  const valid = requiredQuestions.every(question => questionHasSelection(question.id));
  document.getElementById("step2-error").classList.toggle("visible", !valid);
  return valid;
}

function selectedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);
}

function cleanSignals(values) {
  return values.filter(value => value !== "I'm not sure" && value !== "Something else");
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function scorePersona(pattern, signals) {
  const matches = pattern.signals.filter(signal => signals.includes(signal));
  return { ...pattern, score: matches.length, matches };
}

function inferBehavioralDimensions(payload) {
  const evidence = [
    ...payload.audienceEvidence.values,
    ...payload.audienceEvidence.triggerContext,
    ...payload.audienceEvidence.emotionalState,
    ...payload.audienceEvidence.decisionNeeds,
    ...payload.audienceEvidence.resistanceSignals,
    ...payload.audienceEvidence.desiredMovement
  ];

  const hasAny = terms => terms.some(term => evidence.includes(term));

  return {
    preventionOrientation: hasAny(["Something has gone wrong", "They want to prevent something from going wrong", "Worried", "Cautious", "Safety", "Reliability", "Lower financial risk"]) ? "elevated" : "moderate",
    uncertainty: hasAny(["Uncertain", "Confused", "More information", "Fear of making the wrong choice", "Uncertainty", "Not enough information"]) ? "elevated" : "moderate",
    trustRequirement: hasAny(["Trust", "Lack of trust", "Distrustful", "Proof that it works", "Recommendations from other people"]) ? "elevated" : "moderate",
    autonomyNeed: hasAny(["Control", "Independence", "Clear choices", "Control over the decision", "They don't want to feel pressured"]) ? "elevated" : "moderate",
    socialInfluence: hasAny(["Recommendations from other people", "Someone recommended it", "Agreement from other people involved", "Permission or approval from someone else"]) ? "meaningful" : "limited",
    decisionFriction: hasAny(["They keep putting it off", "Time or convenience", "The decision involves too many people", "Changing feels difficult", "They don't feel ready"]) ? "elevated" : "moderate"
  };
}

function buildAlignment(providerValues, audienceValues) {
  const direct = providerValues.filter(value => audienceValues.includes(value));
  const bridges = [];

  const bridgeMap = {
    "Quality": ["Quality", "Reliability", "Peace of mind"],
    "Expertise": ["Trust", "Quality", "Clear information"],
    "Honesty": ["Trust", "Being treated fairly", "Clear information"],
    "Fairness": ["Being treated fairly", "Price", "Trust"],
    "Reliability": ["Reliability", "Peace of mind", "Trust"],
    "Personal attention": ["Being understood", "Belonging or connection", "Trust"],
    "Responsibility": ["Safety", "Trust", "Protecting people they care about"],
    "Safety": ["Safety", "Peace of mind", "Reliability"],
    "Innovation": ["Opportunity or improvement", "Quality", "Speed"],
    "Creativity": ["Opportunity or improvement", "Enjoyment", "Quality"],
    "Affordability": ["Price", "Avoiding unnecessary cost", "Being treated fairly"],
    "Convenience": ["Convenience", "Speed", "Flexibility"],
    "Community": ["Belonging or connection", "Personal values", "Protecting people they care about"],
    "Human connection": ["Being understood", "Belonging or connection", "Trust"],
    "Helping people understand their choices": ["Clear information", "Control", "Trust"],
    "Giving people control": ["Control", "Independence", "Being treated fairly"],
    "Creating meaningful results": ["Quality", "Opportunity or improvement", "Reliability"],
    "Long-term relationships": ["Trust", "Reliability", "Belonging or connection"]
  };

  providerValues.forEach(providerValue => {
    (bridgeMap[providerValue] || []).forEach(audienceValue => {
      if (audienceValues.includes(audienceValue)) {
        bridges.push({ providerValue, audienceValue });
      }
    });
  });

  return { direct, bridges };
}

function inferOfferContext(offerName) {
  return OFFER_CONTEXTS.find(context => context.match.test(offerName)) || DEFAULT_CONTEXT;
}

function rankInternalPatterns(payload) {
  const audienceSignals = cleanSignals([
    ...payload.audienceEvidence.values,
    ...payload.audienceEvidence.triggerContext,
    ...payload.audienceEvidence.emotionalState,
    ...payload.audienceEvidence.decisionNeeds,
    ...payload.audienceEvidence.resistanceSignals,
    ...payload.audienceEvidence.desiredMovement
  ]);

  const ranked = PERSONA_PATTERNS
    .map(pattern => scorePersona(pattern, audienceSignals))
    .filter(pattern => pattern.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked.length ? ranked : [{
    id: "general",
    name: "Practical Decision Maker",
    score: 1,
    matches: [],
    goal: "understand whether the offer fits their situation and is worth acting on",
    connect: "clear outcomes, relevant examples, realistic expectations, and a simple next step",
    resistance: "generic claims or communication that does not connect the offer to a recognizable need"
  }];
}

function selectValueInsights(providerValues) {
  return providerValues
    .map(value => ({ value, insight: VALUE_INTERPRETATIONS[value] }))
    .filter(item => item.insight)
    .slice(0, 3);
}

function buildActionableDecisionGuidance(payload, context, dimensions, primaryPattern) {
  const actions = [...context.proofIdeas];

  if (dimensions.uncertainty === "elevated") {
    actions.unshift("Answer the questions a thoughtful customer is likely to ask before they have to ask them.");
  }

  if (dimensions.trustRequirement === "elevated") {
    actions.push("Use proof that shows how you make decisions, not only testimonials that say people liked the result.");
  }

  if (dimensions.autonomyNeed === "elevated") {
    actions.push("Show choices and tradeoffs clearly so the customer can retain ownership of the decision.");
  }

  if (dimensions.socialInfluence === "meaningful") {
    actions.push("Make recommendations, reviews, references, or visible customer experiences easy to find at the point of decision.");
  }

  if (primaryPattern.id === "problem_solver") {
    actions.unshift("Make the first useful next step obvious and keep it simple.");
  }

  return [...new Set(actions)].slice(0, 6);
}

function buildResistanceGuidance(payload, context, rankedPatterns) {
  const risks = rankedPatterns.slice(0, 3).map(pattern => pattern.resistance);
  const selected = cleanSignals(payload.audienceEvidence.resistanceSignals);

  if (selected.includes("Price")) {
    risks.unshift("Make the value and scope understandable before the customer has to reduce the decision to price alone.");
  }

  if (selected.includes("They don't want to feel pressured")) {
    risks.unshift("Give them a clear path forward without creating artificial urgency or making hesitation feel like a problem.");
  }

  if (selected.includes("They don't understand the value")) {
    risks.unshift("Connect the service to the customer's real-life outcome before explaining features, packages, or process.");
  }

  return [...new Set(risks)].slice(0, 5);
}

function buildLocalAudienceAnalysis(payload) {
  const context = inferOfferContext(payload.offer.name);
  const providerValues = cleanSignals(payload.businessEvidence.providerValues);
  const audienceValues = cleanSignals(payload.audienceEvidence.values);
  const rankedPatterns = rankInternalPatterns(payload);
  const primaryPattern = rankedPatterns[0];
  const dimensions = inferBehavioralDimensions(payload);
  const alignment = buildAlignment(providerValues, audienceValues);
  const valueInsights = selectValueInsights(providerValues);

  const valuesText = providerValues.length
    ? providerValues.slice(0, 3).join(", ")
    : "the standards behind your work";

  const audienceOutcome = cleanSignals(payload.audienceEvidence.desiredMovement)[0];
  const desiredMovement = audienceOutcome
    ? audienceOutcome.replace(/^I want /i, "")
    : "feel more confident about the decision";

  const lead = `Your work in ${payload.offer.name}, combined with your emphasis on ${valuesText}, gives you a natural connection with ${context.audienceDescription}.`;

  const outcomeLine = `They may be looking for ${payload.offer.name.toLowerCase()}, but the deeper decision is whether choosing you will help them ${desiredMovement} without creating unnecessary uncertainty, risk, or effort.`;

  const connectionCredibility = valueInsights.length
    ? valueInsights.map(item => `${item.value}: ${item.insight}`)
    : ["The strongest opportunity is to make the values behind your work visible through decisions, standards, and customer experience—not only claims."];

  const decisionActions = buildActionableDecisionGuidance(payload, context, dimensions, primaryPattern);
  const resistanceGuidance = buildResistanceGuidance(payload, context, rankedPatterns);

  const messageExamples = context.messageExamples.slice(0, 3);

  const alignmentSummary = alignment.direct.length
    ? `You already share an important language with this audience around ${alignment.direct.slice(0, 3).join(", ")}. The opportunity is to demonstrate those values through the customer experience so they do not have to take the claim on faith.`
    : alignment.bridges.length
      ? `Your value of ${alignment.bridges[0].providerValue} can directly support their need for ${alignment.bridges[0].audienceValue}. Make that connection visible in what you explain, show, and promise.`
      : `Your opportunity is to translate the standards behind your work into customer outcomes they can recognize and judge for themselves.`;

  const strongestConnection = `${context.strongestConnection} + your commitment to ${valuesText}.`;

  return {
    status: "complete",
    source: "local_fallback",
    generatedAt: new Date().toISOString(),
    humanReport: {
      offerName: payload.offer.name,
      lead,
      decisionReality: context.decisionReality,
      outcomeLine,
      humanQuestion: context.humanQuestion,
      credibility: connectionCredibility,
      alignmentSummary,
      decisionActions,
      barrierQuestions: context.barrierQuestions,
      resistanceGuidance,
      messageExamples,
      strongestConnection,
      closing: "Your communication job is not to manufacture the emotion behind the decision. It is to recognize what already matters, make your real value easier to see, and give people enough clarity to choose for themselves."
    },
    audienceIntelligence: {
      observedEvidence: payload.audienceEvidence,
      providerEvidence: payload.businessEvidence,
      offerContext: {
        id: context.id,
        source: "local context profile; production analysis should research the specific offer"
      },
      behavioralDimensions: dimensions,
      personaClusters: rankedPatterns.slice(0, 5).map(pattern => ({
        id: pattern.id,
        name: pattern.name,
        score: pattern.score,
        supportingSignals: pattern.matches,
        goal: pattern.goal,
        connect: pattern.connect,
        resistance: pattern.resistance
      })),
      providerAudienceAlignment: alignment,
      confidence: {
        personaRanking: rankedPatterns[0].score >= 5 ? "strong inference" : rankedPatterns[0].score >= 3 ? "moderate inference" : "working hypothesis",
        offerContext: context.id === "general" ? "general fallback" : "keyword-matched local context",
        behavioralDimensions: "inference from selected survey signals"
      },
      downstreamGuidance: {
        useFor: ["website copy", "advertising", "social content", "email", "sales language", "campaign planning", "content review"],
        preserveAgency: true,
        avoid: [
          "fear amplification",
          "manufactured urgency",
          "unsupported claims",
          "visible internal persona labels",
          "treating probabilistic patterns as individual certainty"
        ]
      }
    }
  };
}

function buildLLMAnalysisRequest(payload) {
  return {
    contractVersion: ANALYSIS_CONTRACT_VERSION,
    task: "audience_connection_report",
    instructions: [
      "Research or use reliable knowledge about the specific product/service and the common real-world decision context around choosing it.",
      "Interpret selected provider values using reasonable behavioral knowledge. Explain what those values mean in this specific business, not as generic adjectives.",
      "Use survey evidence to infer likely emotional and behavioral patterns probabilistically; do not diagnose individuals.",
      "Do not show internal audience pattern names, scores, taxonomy, confidence labels, or evidence mechanics in the customer-facing report.",
      "Write directly to the business owner in a personal, specific, useful tone. The reader should feel understood rather than analyzed.",
      "Translate likely behavior into actionable ways to strengthen connection and remove decision barriers.",
      "Show how the provider can make values visible through process, proof, expectations, choices, and customer experience.",
      "Do not invent operational practices. Phrase unverified practices as opportunities or examples the business should use only if true.",
      "Avoid fear amplification, manufactured urgency, manipulation, unsupported certainty, or using emotion to override agency.",
      "Return both a humanReport and a deeper audienceIntelligence object for downstream LLM use."
    ],
    desiredHumanReportSections: [
      "strongest audience connection",
      "what the customer may really be deciding",
      "where the provider has a natural advantage",
      "help them make the decision",
      "remove questions that create hesitation",
      "give them proof they can understand",
      "communication examples",
      "strongest connection summary"
    ],
    payload
  };
}

async function requestAudienceAnalysis(payload) {
  const analysisRequest = buildLLMAnalysisRequest(payload);
  window.audienceAnalysisRequest = analysisRequest;

  if (typeof window.oobAudienceAnalyzer === "function") {
    const result = await window.oobAudienceAnalyzer(analysisRequest);
    if (result?.humanReport && result?.audienceIntelligence) return result;
  }

  if (window.OOB_AUDIENCE_ANALYSIS_ENDPOINT) {
    const response = await fetch(window.OOB_AUDIENCE_ANALYSIS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(analysisRequest)
    });

    if (!response.ok) {
      throw new Error(`Audience analysis request failed: ${response.status}`);
    }

    const result = await response.json();
    if (!result?.humanReport || !result?.audienceIntelligence) {
      throw new Error("Audience analysis response does not match contract.");
    }

    return result;
  }

  return buildLocalAudienceAnalysis(payload);
}

function renderResults(payload) {
  const results = document.getElementById("results");
  const report = payload.analysis.humanReport;

  results.innerHTML = `
    <div class="result-label">Your strongest audience connection</div>
    <h3>${escapeHTML(report.offerName || payload.offer.name)}</h3>
    <p class="result-lead">${escapeHTML(report.lead)}</p>

    <div class="result-group">
      <h4>What your customer may really be deciding</h4>
      <p>${escapeHTML(report.decisionReality)}</p>
      <p>${escapeHTML(report.outcomeLine)}</p>
      <div class="human-question">${escapeHTML(report.humanQuestion)}</div>
    </div>

    <div class="result-group">
      <h4>Where you have a natural advantage</h4>
      ${report.credibility.map(item => `<p>${escapeHTML(item)}</p>`).join("")}
      <p><strong>${escapeHTML(report.alignmentSummary)}</strong></p>
    </div>

    <div class="result-group">
      <h4>Help them make the decision</h4>
      <p>
        Do not treat thoughtful research, comparison, or caution as resistance you need to defeat.
        Help the customer make the decision well.
      </p>
      <ul class="signal-list">
        ${report.decisionActions.map(item => `<li>${escapeHTML(item)}</li>`).join("")}
      </ul>
    </div>

    <div class="result-group">
      <h4>Remove the questions that create hesitation</h4>
      <p>Make these answers easy to find before you ask for commitment:</p>
      <ul class="signal-list">
        ${report.barrierQuestions.map(item => `<li>${escapeHTML(item)}</li>`).join("")}
      </ul>
    </div>

    <div class="result-group">
      <h4>Give them proof they can understand</h4>
      <p>
        Claims such as “quality,” “safe,” “professional,” or “experienced” are conclusions.
        Show the decisions, standards, examples, and expectations that allow the customer to reach those conclusions themselves.
      </p>
      <ul class="signal-list">
        ${report.resistanceGuidance.map(item => `<li>${escapeHTML(item)}</li>`).join("")}
      </ul>
    </div>

    <div class="result-group">
      <h4>Communication you can use</h4>
      <p>Lead closer to the decision already happening in the customer's head:</p>
      ${report.messageExamples.map(item => `<div class="message-example">${escapeHTML(item)}</div>`).join("")}
    </div>

    <div class="result-group">
      <h4>Your communication opportunity</h4>
      <div class="connection-summary">
        <strong>Your strongest connection:</strong><br>
        ${escapeHTML(report.strongestConnection)}
      </div>
      <p>${escapeHTML(report.closing)}</p>
    </div>

    <p class="privacy">
      This review identifies recurring decision patterns supported by the information you provided.
      It is intended to improve communication—not diagnose individuals, stereotype an audience,
      or assume every person will respond in the same way.
    </p>
  `;
}

document.getElementById("audience-form").addEventListener("submit", async event => {
  event.preventDefault();
  if (!validateStepTwo()) return;

  const submitButton = document.getElementById("submit-review");
  const originalLabel = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Building your audience review...";

  const payload = {
    schemaVersion: ANALYSIS_CONTRACT_VERSION,
    reviewType: "audience_behavioral_analysis",
    offer: {
      name: document.getElementById("offer").value.trim(),
      type: selectedValues("offer_type")[0] || null,
      website: document.getElementById("website").value.trim() || null
    },
    audienceEvidence: {
      values: selectedValues("audience_values"),
      triggerContext: selectedValues("audience_trigger"),
      emotionalState: selectedValues("audience_emotions"),
      decisionNeeds: selectedValues("audience_needs"),
      resistanceSignals: selectedValues("audience_hesitation"),
      desiredMovement: selectedValues("audience_outcome")
    },
    businessEvidence: {
      providerValues: selectedValues("business_values"),
      intendedMessage: selectedValues("business_message")
    },
    createdAt: new Date().toISOString()
  };

  try {
    payload.analysis = await requestAudienceAnalysis(payload);
  } catch (error) {
    console.error("External audience analysis failed. Using local fallback.", error);
    payload.analysis = buildLocalAudienceAnalysis(payload);
    payload.analysis.audienceIntelligence.externalAnalysisError = String(error.message || error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }

  window.audienceReviewPayload = payload;
  window.audienceIntelligence = payload.analysis.audienceIntelligence;

  console.log("Audience Review Payload:", payload);
  console.log("Audience Intelligence:", payload.analysis.audienceIntelligence);

  renderResults(payload);
  showStep(3);
});
