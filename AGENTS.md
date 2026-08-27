# oobSKILLS Repository Instructions

This repository deploys directly to a public customer-facing website. Treat every tracked page, script, comment, download, metadata field and asset as publishable.

## Publication boundary

- Publish only complete, selected customer-facing work.
- Never publish internal planning, private conversations, brainstorms, future roadmaps, unapproved strategy, hidden audience labels or abandoned alternatives.
- Do not use the live site to describe unfinished products, future availability or implementation notes.
- Never commit credentials, API keys, access tokens, customer data or private source material.

## Customer experience

- Give the visitor the useful answer before requiring deeper reading, a form submission, contact information or a sales conversation. For substantial pages, prefer the progression **answer → recognition → understanding → choice → practical action**.
- Use the H1 for the page-level situation, problem or promise. Every H2 should map to a real audience question, concern, search intent or decision, but the displayed H2 should normally be the concise answer—not another question. The audience provides the question; the H2 provides the answer.
- Continue the answer immediately below the H2. A visitor should not have to read several paragraphs before discovering what the heading means. Treat each H2 section as a bounded mini sales page: recognition → answer → understanding → evidence or distinction → practical implication → appropriate next decision. Not every section needs a CTA.
- Use H3s for supporting recognition, specifics, comparisons, evidence, boundaries, choices or actions—not decorative labels. Questions may appear in eyebrow copy, introductory text, assessment prompts, transitions or body copy when they help self-recognition; do not turn the site into a stack of rhetorical-question H2s.
- Replace generic H2 labels such as “Our Services,” “Why Choose Us” or “Solutions” whenever a useful answer can be stated instead. SEO and AI retrieval should follow from clear, meaningful language rather than control the writing style.
- When useful, place a compact short-answer, TL;DR or “what you need to know” summary near the top so a scanning visitor can get the core information without reading the whole page.
- Start from the situation the visitor recognizes, then explain the useful outcome, what happens next and what the visitor will receive.
- Keep language human, calm, direct, specific and respectful. Preserve visitor agency; do not use fear, hype, manipulation or unsupported promises.
- Silently account for what the visitor may be protecting—time, money, control, staff capacity, customer trust, reputation or confidence—without diagnosing or naming their emotional state. Prefer recognition such as “you should not have to keep every follow-up in your head” over statements such as “you feel overwhelmed.”
- Free tools must provide a complete useful result even if the visitor never becomes a lead. Paid or human-support pathways must be relevant to that result and clearly scoped.
- Helpful software may be named when it genuinely helps someone evaluate a problem. Present tools as options to consider, not a checklist to install. More software is not more progress; start with one defined need, check what is already available and add a tool only when it earns its place.
- Do not turn useful information into a lead-capture gate. If an assessment can operate without an account or email, make that clear. If sharing is optional, the visitor must deliberately initiate it and understand what will be shared.
- A visible control must perform the action its label promises. Interactive reviews require a real submit path, validation, a meaningful result and a way to recover from errors.
- Keep privacy, human responsibility and important limits visible without allowing disclaimers to replace the main value or next step. Privacy claims must describe the implementation exactly; distinguish assessment-answer handling from ordinary hosting or third-party infrastructure.
- Make claims only at the level supported by evidence. Do not promise revenue, savings, performance improvement or similar measurable outcomes without a defensible baseline, timeframe, measurement method and attribution boundary.
- Meet responsive and keyboard-accessible interaction standards. Use semantic HTML, explicit button types, labeled controls, visible focus and understandable status messages.

## Assessment visual language

- Keep the overall site and page sections open and full-width. The interactive assessment worksheet itself should read as a centered, solid outlined work surface, visually distinct from ordinary content cards and buttons. Results should use the same centered boxed workfile language.
- Entry calls to action that launch an assessment should use the oobCREATIVE loose hand-drawn “cut here” treatment: a restrained dashed outline that feels like a paper worksheet could be cut out, rather than a generic CSS dashed box.
- Continue, back, submit and result-action controls inside the worksheet remain normal buttons. The cut-line treatment identifies entry into an assessment, not every interaction inside it.
- When an outline animates, the line must draw around the entire perimeter and finish as a complete closed border. Do not use partial underline traces, corner-only animations or outlines that stop before closing the shape.
- Respect `prefers-reduced-motion`; the final complete outline should remain understandable without animation.
- Browser print / Save PDF output should preserve a clean boxed result presentation so the result already reads like a future dedicated PDF workfile.

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
6. For every H2, silently identify the audience question it answers. Confirm the H2 alone is a credible first sentence of that answer and that everything underneath proves, explains or fulfills it.
7. Confirm that short-answer/TL;DR content is useful information rather than merely promotional copy.
8. Confirm assessment entry CTAs, worksheet surfaces, result surfaces and outline animations follow the assessment visual-language rules above.
9. Merge only when the customer-facing experience is complete, usable and consistent with these instructions.
