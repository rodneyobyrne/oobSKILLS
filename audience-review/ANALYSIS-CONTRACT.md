# Audience Review Analysis Contract

Version: 5.0

## Purpose

The Audience Review should turn a short guided interview into a finished customer-facing communication playbook without requiring any additional human interaction after submission.

The form does not ask the user to perform psychology analysis. It collects professional context, the provider's observations about customers, and the provider's own standards. The analysis layer combines that evidence with high-probability domain knowledge about the entered profession, role, product, or service.

Internal behavioral classifications, confidence scoring, evidence mechanics, and reusable audience intelligence remain available to downstream LLM systems but should not be exposed as the primary customer result.

## Core principle

The system is trying to identify the relationship between:

1. the real-world decision context surrounding the entered profession, role, product, or service;
2. what the provider already observes about the people making that decision;
3. what the provider genuinely values and delivers; and
4. what communication can make that relationship easier to recognize without manipulating the decision.

Human behavior should be treated as patterned and probabilistic, not deterministic.

## Progressive interview sequence

The form should behave like an informed interview, not three disconnected questionnaire pages.

### Step 1 — You and your work

Interview the prospective oobCREATIVE customer first.

Collect:

- the profession, job title, product, service, or professional role being reviewed;
- the broad offer type;
- an optional website or public page.

This step establishes the professional context before asking the user to analyze customers.

As soon as the entered title is sufficiently clear, the system may form a high-probability working model of the field. That model should be presented as context, not fact about the specific provider.

Example:

> That gives us useful professional context. In drone work, customers often need better information, clearer documentation, or a perspective they cannot easily get themselves. We’ll use common patterns from this field as a starting point, then let what you tell us about your own customers confirm, refine, or contradict them.

### Step 2 — Your customers

Use the Step 1 domain model to make the customer interview warmer, more specific, and more authoritative.

The form should recognize the professional reality before asking the user to describe customers.

Example:

> As a drone operator, you probably already know that customers do not always arrive knowing the right technical solution. They are usually trying to get better information, clearer documentation, or a perspective they cannot easily get themselves. Help us understand what you already know about your customers.

Then collect the audience evidence:

- what matters to them;
- what usually triggers the search;
- likely emotional state;
- what they need before deciding;
- what creates hesitation;
- what they hope will be different afterward.

Each question may use the entered profession and earlier answers to make its guidance more specific. The system should periodically reflect a working interpretation back to the user so the experience feels cumulative rather than repetitive.

### Step 3 — How you work

Combine the domain model with the user's customer observations before asking about provider values.

The form should briefly summarize the emerging customer decision and then ask which standards matter most in how the provider works.

After provider values are selected, explain how those standards could credibly reduce customer friction, uncertainty, or risk in this professional context before the user submits.

Do not force alignment. If the selected provider values do not clearly answer the strongest customer concern, preserve that as a communication gap for the final analysis.

## Required analysis sequence

### 1. Build a domain model from the entered profession or service

Treat the supplied job title, profession, product, service, or offer name as a high-value domain signal.

Before interpreting the survey answers, build a high-probability working model of the field itself.

Infer, when reasonably supported:

- normalized occupation or service category;
- common buyers, users, approvers, or other stakeholders;
- typical jobs-to-be-done;
- common deliverables or outcomes;
- common trigger situations;
- expertise asymmetry between provider and customer;
- what customers can and cannot easily evaluate before purchase;
- common overbuy, underbuy, or wrong-choice risks;
- common trust questions;
- useful forms of proof;
- terminology or complexity barriers.

Use high-probability field knowledge confidently when the title is clear. Do not flatten a clear occupation into generic service advice merely because provider-specific details are not yet known.

Do not turn general domain knowledge into a factual claim about the specific provider.

When a supplied title is ambiguous, preserve that uncertainty internally and rely more heavily on the survey evidence or external research.

### 2. Use outside or provider-specific evidence when available

Use the optional website or public page when the analysis environment can reliably retrieve it.

Separate:

- general domain knowledge;
- provider-specific website evidence;
- survey observations;
- inference.

Do not invent operational practices or capabilities that are not supplied or verified.

### 3. Interpret audience evidence inside the domain model

Use submitted audience values, trigger context, emotions, decision needs, resistance signals, and desired movement to refine the general field model.

Infer recurring behavioral patterns such as:

- uncertainty;
- perceived risk;
- trust requirement;
- evidence requirement;
- autonomy need;
- social influence;
- prevention or protection orientation;
- progress or advancement orientation;
- practical decision friction;
- likely reactance to pressure.

The survey evidence personalizes the domain model. It should not erase relevant high-probability knowledge about how this kind of work is normally evaluated.

Do not diagnose individuals or infer clinical conditions.

### 4. Identify the human decision underneath the transaction

Translate the transaction into the practical decision the customer is trying to make.

For a drone pilot, the customer may not be deciding whether drones work. They may be deciding whether they need aerial information at all, what information will actually be useful, what level of service is appropriate, and whether the provider can simplify a technical choice they cannot easily evaluate themselves.

For an auto repair customer, the deeper decision may include:

> Can I trust this recommendation, understand why it matters, and know I am not paying for more than I need?

The report should make this translation explicit.

### 5. Interpret provider values as decision help

Selected values such as Quality, Safety, Expertise, Honesty, Reliability, Fairness, Personal Attention, or Convenience must be interpreted in the context of the actual field and the customer decision already identified.

Do not define values as abstract virtues.

Ask instead:

- What customer concern could this value reduce?
- How could the value become visible in advice, choices, limits, proof, expectations, or process?
- Does the selected value actually answer the strongest audience concern?

Example:

Honesty for a drone operator may become valuable when the provider openly helps customers determine when a simple capture is enough and when more complex mapping, measurement, or inspection work is justified.

Personal Attention may become visible when the provider starts with what the customer is trying to see, measure, document, or understand rather than prescribing a technical package first.

### 6. Identify authentic provider-audience alignment

Find the strongest credible relationship between:

- the domain model;
- provider values;
- audience protected values;
- audience desired movement;
- the actual capabilities reasonably associated with the offer.

Do not manufacture alignment.

If the provider's stated values do not clearly answer the audience's strongest concern, identify the communication gap rather than forcing a fit.

### 7. Convert likely behavior into useful action

Do not simply report that customers will compare, seek reviews, care about risk, or want more information.

Translate likely behavior into what the provider should do.

Example:

> Do not treat comparison as resistance. Help them compare. Put your standards, process, expectations, pricing logic, and customer proof where they can see them before asking for commitment.

The provider should leave with practical communication decisions.

### 8. Lead with recognizable customer situations

Prefer situations customers already recognize over equipment, capabilities, credentials, jargon, or a list of professional features.

For drone work, examples include:

- Need to document what changed?
- Need a clearer view of a site before making a decision?
- Need measurements without sending someone into a difficult area?
- Need a record everyone involved can look at and understand?

This lets the customer recognize the problem before they are required to understand the profession.

### 9. Reduce the fear of buying the wrong thing

Identify where the customer could overbuy, underbuy, misunderstand the scope, or struggle to judge the recommendation.

Help the provider publicly explain what customers may not need as well as what they may need.

That turns expertise into decision help rather than sales pressure.

### 10. Make proof understandable

Favor visible decisions, standards, examples, limits, process, and outcomes over unsupported adjectives.

Instead of:

> We are safe and professional.

Prefer:

> Show how decisions are made, what changes the recommendation, what happens when conditions change, and what the customer can expect.

Never invent a specific operational practice. If it is not supplied or verified, phrase it as an opportunity or example the provider should use only if true.

### 11. Generate useful public advice

The final customer-facing report should include three or four copy/paste social posts or equivalent reusable content examples.

These should help customers become better buyers of the exact type of service.

They should demonstrate useful professional judgment rather than merely advertise.

For example, a drone pilot may teach customers to begin with:

> What do I need to know when this project is finished?

The post can then explain how that question determines whether the customer needs simple imagery, repeatable documentation, measurement, mapping, scanning, inspection data, or another approach.

### 12. End with one communication rule

The final report should reduce the analysis to one repeatable communication pattern.

Default pattern:

> Name a situation they recognize → give them one useful piece of advice → show how you help simplify the decision.

The precise wording may change by field, but the principle should remain usable across website content, social posts, sales conversations, and examples.

## Customer-facing report structure

The customer-facing result should read as a communication playbook rather than a diagnostic audience report.

### Opening: the decision already happening

Name the profession, service, or offer.

Explain what customers in this field are often trying to accomplish.

Contrast that with what the provider may be tempted to lead with technically.

Then surface several likely resistance questions in natural customer language.

### Lead with their problem

Give recognizable customer situations.

Help the provider lead with those situations rather than professional capabilities in isolation.

### Reduce the fear of buying the wrong thing

Connect relevant provider values to common overbuy, underbuy, trust, price, uncertainty, or complexity concerns.

Give concrete language the provider can use.

### Make a provider value visible

Choose one particularly useful provider value and contrast generic claim language with a better customer-facing expression.

### Give useful advice publicly

Provide three or four copy/paste social posts or equivalent reusable communication examples.

The content should teach, clarify, or improve customer judgment.

### Your communication rule

End with one reusable pattern and one sentence describing what the customer should ideally think after encountering the provider's communication.

Connect the provider's selected values back to the rule.

## Tone

The report and form should sound like an experienced strategist speaking directly to the business owner.

Use:

- second person;
- clear language;
- contextual specificity;
- thoughtful interpretation;
- practical examples;
- warm professional recognition;
- calm expert authority.

The reader should feel:

- heard;
- understood;
- professionally respected;
- better able to see the customer decision;
- equipped to communicate differently.

Avoid:

- clinical language;
- abstract marketing jargon;
- persona-taxonomy language;
- generic motivational copy;
- overclaiming certainty;
- excessive explanation of the analysis system;
- empty praise such as “Great answer!” or “You’re doing great.”

Recognition should come from demonstrating that the system understood what the user said, not from congratulating them for answering.

## Behind-the-curtain audience intelligence

The larger system should retain more detail than the form user sees.

Recommended structure:

```json
{
  "audienceIntelligence": {
    "observedEvidence": {},
    "providerEvidence": {},
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
    "behavioralDimensions": {},
    "personaClusters": [],
    "providerAudienceAlignment": {},
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

Internal persona or behavioral pattern labels may be useful for clustering, scoring, comparison, or downstream content generation. They should not automatically be shown to the business owner.

## External LLM integration

The browser exposes an analysis request containing:

- `contractVersion`;
- `task`;
- domain-orientation instructions;
- the required domain model;
- the required customer-facing communication-playbook shape;
- the normalized survey payload.

The page supports either:

1. `window.oobAudienceAnalyzer(analysisRequest)`; or
2. `window.OOB_AUDIENCE_ANALYSIS_ENDPOINT`.

The external analyzer should return:

```json
{
  "humanReport": {},
  "audienceIntelligence": {}
}
```

The external LLM is responsible for deep reasoning about arbitrary clear job titles, professions, and service categories. Do not attempt to replace this with an exhaustive finite keyword table.

The browser may retain broad local domain families and deeper profiles for common test cases so the form can complete without an external endpoint.

The local fallback is not a substitute for research-backed profession-specific analysis. It exists to preserve a complete user flow while the larger LLM analysis service is being integrated.
