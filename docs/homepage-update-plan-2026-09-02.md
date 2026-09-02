# oobSKILLS Homepage Update Plan — 2026-09-02

## Scope

Implement the approved homepage visual and interaction update without changing the underlying homepage architecture, six-pathway strategy, navigation, or primary message.

## 1. Homepage hero

Retain:

- Eyebrow: `Go deeper, not louder.`
- H1: `Fix the work that costs time, calls, or clarity.`
- Existing body copy
- CTA: `Find the friction first. ↓`

Update presentation:

- Use a full-width soft-blue hero field directly below the black navigation.
- Keep copy on the left and make the established oobCREATIVE hero robot the dominant visual on the right.
- Integrate the robot into the hero field rather than presenting it as a separate framed illustration.
- Increase robot scale substantially from the current implementation.
- Preserve generous negative space.
- Do not copy decorative podcast-reference UI, statistics, yellow accents, or other reference-specific details.
- Mobile stacks copy first and robot second without a large empty gap.

## 2. Six practical starting points

Retain the current content, imagery, two-column/one-column responsive structure, visible CTA, and static behavior.

Line treatment:

- Gray hand-drawn perimeter remains visible at all times.
- Remove corner overdraw only.
- Horizontal and vertical strokes meet cleanly without protruding tails or X-shaped crossings.
- Do not add hover-blue behavior to these six cards.

## 3. Interactive diagnostic cards

Applies to the homepage free diagnostic cards and other homepage interactive drawn boxes using the shared component.

Required states:

- Rest: no perimeter visible.
- Hover: blue hand-drawn perimeter.
- Keyboard focus/focus-within: blue hand-drawn perimeter.
- Selected: blue hand-drawn perimeter remains visible.
- Inactive/deselected: no perimeter.
- Gray outline is never visible on interactive cards.

Keep text and CTA in live HTML at all times for accessibility, SEO, and LLM retrieval.

## 4. Shared drawn-line geometry

Update the gray and blue line SVG assets from the same geometry.

Preserve:

- low-frequency hand-drawn movement
- approximately 2.5–4px pressure variation
- pressure pooling
- gray static version and ballpoint-blue interactive version

Change:

- horizontal and vertical strokes terminate at their corner meeting point
- no protruding tails
- no X-shaped corner crossings
- no white masking patches

## 5. CSS ownership

- `branding/components.css` should be the canonical owner of interactive drawn-box state behavior.
- Remove/neutralize older homepage-specific overrides that force gray resting lines or duplicate shared-component behavior.
- `review-path-cards.css` keeps its static gray perimeter but uses the corrected shared line assets.

## 6. Mobile and accessibility

- Interactive behavior cannot depend on hover alone.
- Tap/focus/selection must produce the blue selected state.
- Preserve keyboard focus visibility.
- Respect `prefers-reduced-motion` by showing the final blue outline without animation.
- Keep all meaningful text available in the initial HTML.

## Definition of done

The homepage reads as:

**Large blue-field hero → recognizable problems → useful pathways → interactive tools.**

Static pathway cards use restrained gray drawing. Interactive cards reveal ballpoint blue only on interaction/selection. All hand-drawn corners look intentional and meet cleanly without overdraw.