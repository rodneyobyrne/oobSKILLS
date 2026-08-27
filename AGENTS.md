# oobSKILLS Repository Instructions

This repository deploys directly to a public customer-facing website. Treat every tracked page, script, comment, download, metadata field and asset as publishable.

## Publication boundary

- Publish only complete, selected customer-facing work.
- Never publish internal planning, private conversations, brainstorms, future roadmaps, unapproved strategy, hidden audience labels or abandoned alternatives.
- Do not use the live site to describe unfinished products, future availability or implementation notes.
- Never commit credentials, API keys, access tokens, customer data or private source material.

## Customer experience

- Give the visitor the useful answer before requiring deeper reading, a form submission, contact information or a sales conversation. For substantial pages, prefer the progression **answer → recognition → understanding → choice → practical action**.
- Use the H1 for the page-level situation, problem or promise. Each H2 should map to a real audience question and either ask it clearly or answer it clearly; answer that question immediately below the H2. Use H3s for supporting conditions, evidence, distinctions, choices or narrower answers—not decorative labels.
- When useful, place a compact short-answer, TL;DR or “what you need to know” summary near the top so a scanning visitor can get the core information without reading the whole page.
- Start from the situation the visitor recognizes, then explain the useful outcome, what happens next and what the visitor will receive.
- Keep language human, calm, direct, specific and respectful. Preserve visitor agency; do not use fear, hype, manipulation or unsupported promises.
- Silently account for what the visitor may be protecting—time, money, control, staff capacity, customer trust, reputation or confidence—without diagnosing or naming their emotional state. Prefer recognition such as “you should not have to keep every follow-up in your head” over statements such as “you feel overwhelmed.”
- Free tools must provide a complete useful result even if the visitor never becomes a lead. Paid or human-support pathways must be relevant to that result and clearly scoped.
- Do not turn useful information into a lead-capture gate. If an assessment can operate without an account or email, make that clear. If sharing is optional, the visitor must deliberately initiate it and understand what will be shared.
- A visible control must perform the action its label promises. Interactive reviews require a real submit path, validation, a meaningful result and a way to recover from errors.
- Keep privacy, human responsibility and important limits visible without allowing disclaimers to replace the main value or next step. Privacy claims must describe the implementation exactly; distinguish assessment-answer handling from ordinary hosting or third-party infrastructure.
- Make claims only at the level supported by evidence. Do not promise revenue, savings, performance improvement or similar measurable outcomes without a defensible baseline, timeframe, measurement method and attribution boundary.
- Meet responsive and keyboard-accessible interaction standards. Use semantic HTML, explicit button types, labeled controls, visible focus and understandable status messages.

## Technical constraints

- This is a static GitHub Pages site. Do not expose secrets or imply server-side, database or AI behavior that does not exist.
- Preserve working routes, canonical URLs, metadata, local links and the established brand assets unless the task explicitly changes them.
- Do not merge placeholder copy, TODO markers, nonfunctional calls to action, broken downloads or dead-end forms.
- Browser-only assessments must not silently begin transmitting answers. If a future change adds network submission, analytics tied to answers or another external processing path, update the privacy language and tests as part of the same change.

## Required pre-publish checks

1. Run `npm ci` and `npm run validate`; resolve every build, publication-boundary, credential-scan and DOM-test problem.
2. Provision Chromium with `npx playwright install chromium`, then run `npm run test:browser`.
3. Test every changed interaction from a fresh browser session through its complete result, reset and error paths.
4. Review changed pages at mobile and desktop widths, including keyboard focus and print/download output when offered.
5. Confirm that no internal language, draft marker, unsupported claim, secret or private data appears in source or rendered output.
6. Confirm that question-oriented H2s receive a direct answer and that short-answer/TL;DR content is not merely promotional copy.
7. Merge only when the customer-facing experience is complete, usable and consistent with these instructions.
