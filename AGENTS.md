# oobSKILLS Repository Instructions

This repository deploys directly to a public customer-facing website. Treat every tracked page, script, comment, download, metadata field and asset as publishable.

## Publication boundary

- Publish only complete, selected customer-facing work.
- Never publish internal planning, private conversations, brainstorms, future roadmaps, unapproved strategy, hidden audience labels or abandoned alternatives.
- Do not use the live site to describe unfinished products, future availability or implementation notes.
- Never commit credentials, API keys, access tokens, customer data or private source material.

## Customer experience

- Start with the situation a visitor recognizes, then explain the useful outcome, what happens next and what the visitor will receive.
- Keep language human, calm, direct, specific and respectful. Preserve visitor agency; do not use fear, hype, manipulation or unsupported promises.
- Free tools must provide a complete useful result. Paid pathways must be relevant to that result and clearly scoped.
- A visible control must perform the action its label promises. Interactive reviews require a real submit path, validation, a meaningful result and a way to recover from errors.
- Keep privacy, human responsibility and important limits visible without allowing disclaimers to replace the main value or next step.
- Meet responsive and keyboard-accessible interaction standards. Use semantic HTML, explicit button types, labeled controls, visible focus and understandable status messages.

## Technical constraints

- This is a static GitHub Pages site. Do not expose secrets or imply server-side, database or AI behavior that does not exist.
- Preserve working routes, canonical URLs, metadata, local links and the established brand assets unless the task explicitly changes them.
- Do not merge placeholder copy, TODO markers, nonfunctional calls to action, broken downloads or dead-end forms.

## Required pre-publish checks

1. Run `node scripts/check-public-site.mjs` and resolve every reported problem.
2. Test every changed interaction from a fresh browser session through its complete result, reset and error paths.
3. Review changed pages at mobile and desktop widths, including keyboard focus and print/download output when offered.
4. Confirm that no internal language, draft marker, unsupported claim, secret or private data appears in source or rendered output.
5. Merge only when the customer-facing experience is complete, usable and consistent with these instructions.
