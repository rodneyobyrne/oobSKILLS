# Audience Review Analysis Contract

Version: 4.0

## Purpose

The Audience Review should turn survey observations into a finished customer-facing audience insight report without requiring any additional human interaction after form submission.

The form collects evidence. The analysis layer interprets it. The form user sees the finished connection and communication guidance.

Internal behavioral classifications, confidence scoring, evidence mechanics, and reusable audience intelligence remain available to downstream LLM systems but should not be exposed as the primary customer result.

## Core principle

The system is trying to identify the emotional and behavioral relationship between:

1. what the provider genuinely values and delivers;
2. what people are trying to protect, solve, understand, achieve, or feel when choosing the offer; and
3. what communication can make that relationship easier to recognize without manipulating the decision.

Human behavior should be treated as patterned and probabilistic, not deterministic.

## Required analysis sequence

### 1. Understand the offer in context

Use the supplied product/service name, type, optional website, and reliable outside knowledge when available.

Research or retrieve enough context to understand common real-world decision conditions around choosing this kind of offer.

Examples:

- What is the customer actually entrusting, risking, solving, improving, or trying to avoid?
- What does a thoughtful buyer commonly need to evaluate?
- What practical questions are likely to matter?
- Which aspects of the offering are easy for an expert to understand but difficult for a customer to independently judge?

Do not turn generic industry stereotypes into facts about the specific business.

### 2. Interpret provider values

Selected business values such as Quality, Safety, Expertise, Honesty, Reliability, Fairness, Personal Attention, or Convenience must be interpreted in the context of the actual offer.

Do not write:

> Your value of Safety supports their need for Peace of mind.

Translate the value into what it means behaviorally and operationally.

Example for dog daycare:

> People who value safety are not necessarily asking for a promise that nothing can ever go wrong. They are looking for evidence that risk is noticed, managed, and communicated by people who take responsibility seriously.

The analysis should show how a provider could make that value visible.

### 3. Interpret audience evidence

Use the submitted audience values, trigger context, emotions, decision needs, resistance signals, and desired movement.

Infer recurring behavioral patterns such as:

- uncertainty
- perceived risk
- trust requirement
- evidence requirement
- autonomy need
- social influence
- prevention/protection orientation
- progress/advancement orientation
- practical decision friction
- likely reactance to pressure

Do not diagnose individuals or infer clinical conditions.

### 4. Identify the human decision underneath the transaction

The report should help the provider understand what the customer may really be deciding.

A dog daycare customer may say:

> I need daycare a couple days a week.

The deeper decision may be:

> Can I trust these people to notice what my dog needs when I am not there?

An auto repair customer may say:

> I need my brakes fixed.

The deeper decision may include:

> Can I trust this recommendation, understand why it matters, and know I am not paying for more than I need?

The report should make this translation explicit.

### 5. Identify authentic provider-audience alignment

Find the strongest credible relationship between:

- provider values;
- audience protected values;
- audience desired movement;
- the actual capabilities of the offer.

Do not manufacture alignment.

If the provider's stated values do not clearly answer the audience's strongest concern, identify the communication gap rather than forcing a fit.

### 6. Convert likely behavior into useful action

Do not simply report:

- they will compare;
- they will seek reviews;
- they care about risk;
- they want more information.

Translate that into what the provider should do.

Example:

> Do not treat comparison as resistance. Help them compare. Put your standards, process, expectations, pricing logic, and customer proof where they can see them before asking for commitment.

The provider should leave with practical communication decisions.

### 7. Remove avoidable barriers

Identify questions or uncertainties that the provider can answer before the customer has to ask.

The report should distinguish between:

- legitimate caution that deserves information;
- practical friction that can be removed;
- trust gaps that need proof;
- pressure or complexity that may create reactance.

### 8. Make proof understandable

Favor visible decisions, standards, examples, limits, process, and outcomes over unsupported adjectives.

Instead of:

> We are safe and professional.

Prefer:

> Show how new customers are evaluated, how decisions are made, what happens when something changes, and what the customer can expect.

Never invent a specific operational practice. If it is not supplied or verified, phrase it as an opportunity:

> If this is how you operate, make it visible.

### 9. Generate communication examples

Examples should sound close to the decision already happening in the customer's head.

They should:

- be human;
- be specific to the offer;
- connect to the audience's real concern or aspiration;
- preserve agency;
- avoid fear amplification;
- avoid artificial urgency;
- avoid manipulative emotional pressure.

## Customer-facing report structure

The customer-facing report should generally follow this structure.

### Your strongest audience connection

Name the product/service.

Open with a concise interpretation of who the provider is naturally positioned to connect with and why.

Do not lead with an internal persona label.

### What your customer may really be deciding

Explain the practical need and the deeper human decision.

Include one clear question in the customer's likely internal voice when appropriate.

### Where you have a natural advantage

Interpret the provider's selected values in the specific business context.

Explain how those values can credibly answer the audience's needs.

### Help them make the decision

Translate likely decision behavior into actions the provider can take.

### Remove the questions that create hesitation

List practical questions the provider should answer clearly and early.

### Give them proof they can understand

Show how to turn claims into visible evidence.

### Communication you can use

Provide several example message directions.

These are examples, not factual claims about the business.

### Your communication opportunity

End with a simple provider-audience connection statement.

Example structure:

> Their desire to ______ + your commitment to ______.

Then explain the communication job in one or two sentences.

## Tone

The report should sound like an experienced strategist speaking directly to the business owner.

Use:

- second person;
- clear language;
- contextual specificity;
- thoughtful interpretation;
- practical examples;
- calm confidence.

The reader should feel:

- heard;
- understood;
- better able to see the customer decision;
- equipped to communicate differently.

Avoid:

- clinical language;
- abstract marketing jargon;
- persona-taxonomy language;
- generic motivational copy;
- overclaiming certainty;
- excessive explanation of the analysis system.

## Behind-the-curtain audience intelligence

The larger system should retain more detail than the form user sees.

Recommended structure:

```json
{
  "audienceIntelligence": {
    "observedEvidence": {},
    "providerEvidence": {},
    "offerContext": {},
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

- `contractVersion`
- `task`
- `instructions`
- `desiredHumanReportSections`
- the normalized survey `payload`

The page supports either:

1. `window.oobAudienceAnalyzer(analysisRequest)`; or
2. `window.OOB_AUDIENCE_ANALYSIS_ENDPOINT`

The external analyzer should return:

```json
{
  "humanReport": {},
  "audienceIntelligence": {}
}
```

If no external analyzer is available, the page uses a local deterministic fallback so the form still completes without additional user interaction.

The local fallback is not a substitute for research-backed offer-specific analysis. It exists to preserve a complete user flow while the larger LLM analysis service is being integrated.
