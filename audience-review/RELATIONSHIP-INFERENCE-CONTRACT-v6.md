# Audience Review Relationship + Inference Contract

Version: 6.0

This file extends `ANALYSIS-CONTRACT.md` v5.0. Where this contract is more specific, v6 governs.

## Purpose

The Audience Review should calculate a useful working audience model as early as possible, then use the interview to resolve the uncertainties that matter.

The system is not a transcript of survey answers. It is a probabilistic reasoning system that combines:

1. profession / service / offer context;
2. likely provider-to-audience relationship structure;
3. high-probability human behavior patterns;
4. the provider's direct observations;
5. provider values and standards;
6. provider-specific evidence when available.

The goal is to bridge connection: help the provider recognize the decision, relationship, and human concerns already present, then communicate in a way that supports understanding and agency.

## Core operating principle

**Calculate first. Ask only where the answer materially improves, contradicts, or resolves the working model.**

Optimize for information gained per question.

A clear profession or service should immediately activate useful priors. The user should not have to manually supply information that can be inferred with high probability from the domain and relationship.

High probability is not certainty. Every prior remains revisable.

Evidence precedence:

**direct provider evidence > reliable provider-specific evidence > survey evidence > strong domain / relationship prior > generic fallback**

Do not preserve a prior when stronger evidence contradicts it.

## Relationship model

Relationship vocabulary is functional, not cosmetic.

The system should infer both the natural role names and the dynamics created by those roles.

Examples:

- Teacher → student / learner
- Physician → patient
- Attorney → client
- Marriage counselor → client / couple / partners / family
- Recruiter → candidate + hiring client
- Care provider → care recipient + family / decision-maker where applicable

Do not replace a clear relationship with the generic word `customer` unless generic language is genuinely more accurate.

### Required relationship fields

```json
{
  "relationshipModel": {
    "id": "",
    "providerRole": "",
    "providerPublicLabel": "",
    "audienceSingular": "",
    "audiencePlural": "",
    "participantRoles": [],
    "stakeholderRoles": [],
    "decisionStructure": "",
    "dynamics": {
      "expertiseAsymmetry": "",
      "authorityWeight": "",
      "agency": "",
      "dependence": "",
      "emotionalExposure": "",
      "duration": "",
      "privacyBoundaries": "",
      "multiStakeholder": "",
      "sharedResponsibility": ""
    },
    "trustRequirements": [],
    "highProbabilityPatterns": [],
    "decisionFraming": "",
    "confidence": "",
    "evidenceBasis": ""
  }
}
```

## Relationship dynamics

The system should investigate the relationship itself when that relationship changes the likely communication problem.

### Expertise asymmetry

How much does one party rely on knowledge they cannot independently evaluate before choosing?

Examples:

- physician / patient: generally high;
- teacher / student: moderate to high;
- mechanic / vehicle owner: often high;
- restaurant / guest: usually lower.

Expertise asymmetry should change what proof, explanation, and decision support are useful.

### Authority or power asymmetry

Does the provider's professional role carry unusual influence?

Authority should never be used to reduce audience agency.

Where authority is high, communication should make scope, reasoning, choices, boundaries, and realistic expectations easier to understand.

### Agency

Who retains meaningful ownership of the decision?

The system should prefer communication that supports informed choice rather than maximizing compliance.

### Dependence

What does the audience have to entrust to the provider?

This may involve:

- judgment;
- care;
- interpretation;
- access;
- coordination;
- confidentiality;
- technical execution;
- teaching / feedback;
- representation.

### Emotional exposure

How personally consequential can the relationship feel?

High emotional exposure is not permission to manipulate emotion. It increases the responsibility to communicate clearly, respectfully, and without manufactured urgency.

### Duration

Is the relationship:

- transactional;
- episodic;
- repeated;
- ongoing;
- developmental?

Duration changes the importance of reliability, continuity, expectations, and relationship fit.

### Shared responsibility

Who contributes to the outcome?

Do not imply the provider controls outcomes that depend on:

- learner participation;
- patient choices or conditions;
- multiple partners;
- external systems;
- changing project conditions;
- third-party decisions.

### Privacy and professional boundaries

Where relevant, infer the importance of privacy, confidentiality, consent, role boundaries, and scope.

Do not invent a specific legal, clinical, or operational policy.

### Multi-stakeholder relationships

The person who:

- discovers;
- chooses;
- pays;
- approves;
- participates;
- uses;
- influences;
- benefits

may not be the same person.

Do not collapse genuinely different participants into one fictional customer.

When multiple people participate, preserve potentially different:

- goals;
- concerns;
- readiness;
- decision rights;
- definitions of success.

## Examples of relationship inference

### Teacher → student

High-probability starting model:

- teacher has greater subject and learning-path expertise;
- student needs an understandable next step rather than the entire curriculum;
- progress is shared: the teacher provides instruction / feedback while the learner participates and practices;
- parent, school, or employer may sometimes pay or approve;
- reliability can become visible through predictable expectations, feedback, and progression;
- mistakes and difficulty can affect confidence.

The interview should test which of these patterns actually matter to this teacher's students.

### Physician → patient

High-probability starting model:

- high expertise asymmetry;
- professional authority carries significant weight;
- patient may not know the correct medical terminology;
- informed agency matters;
- health decisions can involve vulnerability and consequential uncertainty;
- caregiver, family, payer, referral source, or other clinicians may sometimes be stakeholders;
- privacy, scope, and realistic expectations matter.

The result should use `patient`, not automatically `customer`.

### Marriage counselor → clients / couples / partners / families

High-probability starting model:

- one person may initiate contact while two or more people participate;
- participants may have different explanations of the problem;
- participants may have different levels of readiness;
- neutrality, fairness, privacy, expectations, and emotional safety can matter;
- the counselor contributes process and professional judgment but cannot manufacture agreement;
- one participant should not automatically be framed as the problem.

The interview should avoid pretending the couple is one decision-maker with one emotional state.

## Human behavior pattern model

Relationship inference should combine with broader behavioral dimensions.

Look for patterns involving:

- uncertainty;
- perceived risk;
- loss avoidance;
- trust;
- fairness;
- autonomy;
- social influence;
- belonging;
- protection;
- progress / competence;
- cognitive load;
- comparison behavior;
- need for proof;
- likely reactance to pressure;
- desire for control;
- desire to be understood;
- desire to reduce effort.

Do not treat each survey answer independently.

Prefer combinations such as:

**profession × relationship × stakes × audience concern × provider value**

over:

**answer 1 + answer 2 + answer 3**

## Interview information gain

The model should maintain a short internal list of unresolved high-value hypotheses.

Example:

```json
{
  "interviewPriorities": [
    {
      "id": "stakeholder_roles",
      "priority": "high",
      "hypothesis": "The buyer and participant may be different people.",
      "resolveWith": "Use the interview to determine who chooses, pays, participates, and benefits."
    }
  ]
}
```

The purpose is not to add more questions automatically.

The purpose is to know what uncertainty is worth resolving.

When a strong prior already answers a low-value question, do not make the interview feel ignorant.

When uncertainty materially changes communication, use the interview to test it.

## Progressive interview behavior

### Step 1 — profession / service

Immediately calculate:

- domain;
- natural relationship terms;
- likely stakeholders;
- relationship dynamics;
- common jobs-to-be-done;
- decision risks;
- trust requirements;
- high-value uncertainties.

Reflect useful recognition back to the user as a working model.

### Step 2 — audience observations

Ask the provider to confirm, refine, or contradict the model.

Question guidance should use natural relationship language.

Prefer:

> Thinking about your students...

over:

> Thinking about your customers...

when `student` is the more accurate relationship.

For multi-party relationships, remind the provider that different participants may have different goals or readiness.

### Step 3 — provider standards

Interpret provider values against the relationship and customer decision already modeled.

Do not force alignment.

Examples:

- Reliability for a teacher may mean predictable expectations, feedback, and next steps.
- Reliability for a contractor may mean schedule / scope / change communication.
- Fairness for a couples counselor may connect to how multiple participants expect to be heard without implying equal factual claims.
- Expertise for a physician should support understanding and informed choice, not dependence on authority.

## Customer-facing output priority

The highest-value information should appear first.

The output model is:

1. brief useful audience / decision recognition;
2. one strongest complete publish-ready communication;
3. explanation of why that communication works;
4. reverse-engineered reusable parts;
5. additional complete copy / paste variations;
6. deeper provider-value and communication strategy.

## Primary communication artifact

The analyzer must deliberately create one strongest outward-facing example.

Do not merely take an arbitrary first social post and relabel it.

Required structure:

```json
{
  "communicationArtifacts": {
    "primary": {
      "label": "YOU CAN POST THIS NOW",
      "purpose": "finished outward-facing communication chosen as the strongest immediate-value example",
      "copy": ""
    },
    "reverseEngineering": {
      "rule": "recognizable situation → useful advice → simpler decision",
      "recognizableSituation": [],
      "usefulAdvice": [],
      "simplerDecision": []
    },
    "variations": [
      {
        "label": "COPY / PASTE EXAMPLE",
        "copy": ""
      }
    ]
  }
}
```

The primary artifact should:

- use the natural relationship term;
- begin with a situation the audience recognizes;
- give genuinely useful information;
- reduce unnecessary decision friction;
- demonstrate provider judgment without unsupported claims;
- avoid requiring the audience to understand the profession first;
- preserve choice and agency;
- be complete enough to publish with little or no editing.

## Reverse engineering

After creating the primary artifact, explain the message by separating it into reusable components.

### Recognizable situation

What is happening in the audience's world?

### Useful advice

What can they learn before buying anything?

### Simpler decision

How does the provider make the next choice easier to understand?

The user should be able to swap pieces from these groups to make new outward communications without starting from a blank page.

## Additional variations

Generate additional complete examples using the same strategic logic.

They should be variations, not near-duplicates.

Each should teach, clarify, or improve audience judgment.

## Internal calculation record

Retain:

```json
{
  "calculationStrategy": {
    "principle": "calculate first; ask only where the answer materially improves, contradicts, or resolves the working model",
    "evidenceOrder": [
      "profession/service prior",
      "relationship prior",
      "domain prior",
      "survey evidence",
      "provider values",
      "provider-specific evidence when available"
    ],
    "preserveUncertainty": true
  }
}
```

## Guardrails

Use patterns to improve recognition and understanding, not exploit them.

Do not:

- diagnose individuals;
- treat probabilistic traits as facts;
- manufacture fear;
- manufacture urgency;
- exploit vulnerability;
- use authority asymmetry to pressure;
- hide important tradeoffs;
- force provider-value alignment;
- invent provider practices;
- pretend multiple stakeholders share one goal when evidence says otherwise.

The system should become more confident as evidence accumulates, but never less willing to revise the model.

## External LLM responsibility

The browser may contain deterministic relationship and domain profiles for common cases so the local experience remains useful.

Those profiles are a fallback.

The external LLM is responsible for deep relationship and domain reasoning across arbitrary clear professions, services, offers, and stakeholder structures.

A finite keyword library should support the system; it should not define the limits of what the system can understand.
