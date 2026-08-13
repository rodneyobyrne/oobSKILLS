# Audience Review Analysis Contract

Version: 5.0

## Purpose

The Audience Review turns survey observations into a practical communication playbook without requiring additional human interaction after form submission.

The form collects evidence. The analysis layer interprets both the **entered profession / job title / service** and the survey evidence. The customer-facing result should help the provider communicate more usefully with the people who are likely to buy, use, approve, recommend, fund, or benefit from the offer.

Internal behavioral classifications, domain inference, confidence, evidence provenance, scoring, and reusable audience intelligence remain available to downstream LLM systems but should not be exposed as the primary customer result.

## Core principle

The entered job title or service is not merely a label. It is a high-value contextual signal.

When the title is clear, the analyzer should use high-probability knowledge about that field to understand:

- what the professional normally does;
- what customers normally hire that professional to accomplish;
- what parts of the work are easy or difficult for a customer to independently evaluate;
- common trigger situations;
- common risks of buying the wrong level or type of service;
- common trust questions;
- useful forms of proof;
- common terminology barriers;
- likely jobs-to-be-done, deliverables, and outcomes.

The survey then refines that working model.

The analysis should connect:

1. high-probability domain knowledge about the profession / service;
2. what the provider genuinely values and delivers;
3. what the audience appears to be trying to protect, solve, understand, achieve, or feel;
4. what communication can make that relationship easier to recognize without manipulating the decision.

Human behavior should be treated as patterned and probabilistic, not deterministic.

## Required analysis sequence

### Phase 1 — Domain orientation

Before interpreting the survey answers, normalize the entered job title, profession, service, or offer and build a working domain model.

The model should identify, when reasonably inferable:

- normalized occupation or service category;
- likely buyers, users, approvers, or stakeholders;
- common jobs-to-be-done;
- common deliverables or outcomes;
- common trigger situations;
- expertise asymmetry between provider and buyer;
- what customers can easily evaluate;
- what customers cannot easily evaluate before purchase;
- common overbuy, underbuy, or wrong-choice risks;
- common trust questions;
- useful forms of proof;
- common terminology barriers;
- confidence in the domain inference;
- whether the inference came from general domain knowledge, provider website evidence, survey evidence, or a combination.

Use high-probability domain knowledge confidently when the title is clear.

Do not flatten a clear occupation into generic advice merely because every detail is not known.

Do not invent facts about the specific provider, its equipment, credentials, methods, pricing, staffing, safety record, service area, or capabilities.

If the title is ambiguous, keep the uncertainty internally and use a broader but still useful domain model.

### Phase 2 — Provider-specific evidence

Use the supplied product/service name, offer type, optional website, and reliable outside knowledge when available.

If a website is supplied and the analyzer can reliably retrieve it, treat it as provider-specific evidence. Keep general field knowledge separate from provider-specific claims.

Never convert an inferred industry norm into a factual claim about the provider.

### Phase 3 — Survey refinement

Use the submitted:

- audience values;
- trigger context;
- emotional state;
- decision needs;
- resistance signals;
- desired movement;
- provider values;
- intended message.

Infer recurring behavioral patterns such as:

- uncertainty;
- perceived risk;
- trust requirement;
- evidence requirement;
- autonomy need;
- social influence;
- prevention/protection orientation;
- progress/advancement orientation;
- practical decision friction;
- likely reactance to pressure.

The survey should refine and personalize the domain model. It should not erase useful high-probability knowledge about how this kind of service is normally bought.

Do not diagnose individuals or infer clinical conditions.

### Phase 4 — Identify the real customer decision

Translate the transaction into the practical human question underneath it.

For a Drone Pilot, the buyer may not primarily be deciding whether drones work. They may be deciding:

- Do I actually need this level of service?
- Will the result give me useful information?
- Will this become more complicated than the problem I am trying to solve?
- Can I trust this person to recommend what I actually need rather than the most technical option?

For an auto repair customer, the deeper questions may include:

- What actually needs to be done?
- What can wait?
- Why is this being recommended?
- How do I know I am not paying for more than I need?

The report should express three or four high-value resistance questions in natural customer language.

### Phase 5 — Translate provider values into decision help

Provider values such as Quality, Safety, Expertise, Honesty, Reliability, Fairness, Personal Attention, Convenience, Human Connection, or Giving People Control should not be explained as abstract virtues.

Ask instead:

- What customer concern can this value reduce?
- What could the provider say, show, explain, or make visible that demonstrates the value?
- What decision becomes easier because the provider works this way?

Example:

Honesty is not useful merely because the provider says they are honest.

It becomes useful when the provider is willing to explain limits, tradeoffs, what the customer may not need, and when a simpler solution may be enough.

Personal Attention becomes useful when the customer can see that their specific situation changes the recommendation.

### Phase 6 — Lead with recognizable problems

The customer-facing guidance should lead with situations the buyer already recognizes.

Do not make the customer learn the profession before they can understand why the service may help.

For a Drone Pilot, useful situations may include:

- documenting what changed;
- getting a clearer view of a site;
- collecting measurements or visual evidence;
- creating a record multiple stakeholders can review;
- comparing conditions over time.

The system should generate equivalent domain-specific situations for other professions and service types.

### Phase 7 — Reduce avoidable decision risk

Identify where the customer may fear buying:

- too much;
- too little;
- the wrong option;
- an opaque recommendation;
- an unnecessarily complex solution;
- an outcome they cannot independently judge.

Translate those risks into communication actions.

Help the provider explain what the customer may not need, what changes between options, what is included, and what should determine the recommendation.

Do not create artificial urgency or use fear to force action.

### Phase 8 — Give useful advice publicly

The output should include three or four copy/paste content examples that help customers become better buyers of this exact type of service.

The examples should:

- teach one useful thing;
- demonstrate professional judgment;
- help customers recognize when the service may be useful;
- help them compare or ask better questions;
- reduce jargon and uncertainty;
- preserve the customer’s agency;
- avoid unsupported provider-specific claims.

They should not read like generic advertisements.

### Phase 9 — End with a repeatable communication rule

The report should end with one reusable pattern the provider can apply across website copy, social content, email, sales conversations, and examples.

Preferred structure:

**Recognizable situation → useful advice → simplified decision.**

The exact wording should adapt to the field.

## Customer-facing report structure

The report should generally follow this structure.

### [Profession / Service]

Open with a direct interpretation of what customers are often hiring this professional to accomplish.

Then explain the capability / expertise gap in plain language.

### Likely resistance

Present three or four likely customer questions in natural internal voice.

Then state the main communication opportunity: answer those questions before the customer has to ask them.

### Lead with their problem

Give recognizable situations the customer may already be experiencing.

Explain why this is more useful than leading with equipment, credentials, features, or professional terminology.

### Reduce the fear of buying the wrong thing

When supported by the survey and domain model, show how values such as Honesty and Fairness can help the customer understand what they need, what they may not need, and why one option makes more sense than another.

Use another fitting heading when a different decision barrier dominates.

### Make [relevant provider value] visible

Choose one useful provider value and show the difference between generic value-language and language that demonstrates the value through decision help.

### Give useful advice publicly

Include three or four **Copy/paste social post** examples that teach customers how to make a better decision about this type of service.

### Your communication rule

End with:

- one repeatable communication pattern;
- one sentence explaining how to use it;
- the customer thought the provider should aim to create;
- a closing explanation of how the selected provider values become reasons to work with the provider rather than words listed on a website.

## Tone

The report should sound like an experienced strategist speaking directly to the business owner.

Use:

- second person;
- clear language;
- contextual specificity;
- confident high-probability domain reasoning;
- thoughtful interpretation;
- practical examples;
- usable copy;
- calm confidence.

The reader should feel:

- understood;
- professionally respected;
- better able to see the customer decision;
- equipped to communicate differently.

Avoid:

- clinical language;
- abstract marketing jargon;
- persona-taxonomy language;
- generic motivational copy;
- excessive disclaimers;
- unsupported certainty;
- invented business facts;
- explaining the analysis machinery to the customer.

## Behind-the-curtain audience intelligence

The larger system should retain more detail than the customer sees.

Recommended structure:

```json
{
  "audienceIntelligence": {
    "domainModel": {
      "normalizedTitle": "",
      "category": "",
      "likelyBuyers": [],
      "commonJobsToBeDone": [],
      "commonOutcomes": [],
      "triggerSituations": [],
      "expertiseAsymmetry": "",
      "hardToEvaluateBeforePurchase": [],
      "commonDecisionRisks": [],
      "commonTrustQuestions": [],
      "usefulProof": [],
      "terminologyBarriers": [],
      "confidence": "",
      "evidenceBasis": ""
    },
    "observedEvidence": {},
    "providerEvidence": {},
    "behavioralDimensions": {},
    "personaClusters": [],
    "providerAudienceAlignment": {},
    "communicationPlaybook": {},
    "confidence": {},
    "downstreamGuidance": {
      "useFor": [
        "website copy",
        "advertising",
        "social content",
        "email",
        "sales language",
        "campaign planning",
        "content review"
      ],
      "preserveAgency": true,
      "avoid": [
        "fear amplification",
        "manufactured urgency",
        "unsupported claims",
        "visible internal persona labels",
        "treating probabilistic patterns as individual certainty"
      ]
    }
  }
}
```

Internal persona or behavioral pattern labels may remain useful for clustering, scoring, comparison, or downstream generation. They should not automatically be shown to the business owner.

## External LLM integration

The browser exposes an analysis request containing:

- `contractVersion`;
- `task`;
- domain-orientation instructions;
- a required domain model;
- a required customer-facing report shape;
- the normalized survey payload.

The external analyzer should return:

```json
{
  "humanReport": {},
  "audienceIntelligence": {}
}
```

If no external analyzer is available, the page uses a local deterministic fallback with broad domain-family patterns and a deeper profile for selected common fields such as drone/aerial work.

The local fallback exists to preserve a complete user flow. **Deep inference for arbitrary job titles is ultimately an LLM responsibility, not a finite keyword lookup problem.** The production analyzer should reason systematically from the entered title and reliable domain knowledge rather than depend on a fixed list of occupations.
