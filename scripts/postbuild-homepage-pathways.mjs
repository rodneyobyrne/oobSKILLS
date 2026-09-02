#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const homepagePath = resolve(process.cwd(), '_site', 'index.html');
let html = readFileSync(homepagePath, 'utf8');

const oldPrompt = 'Choose the situation that sounds closest. Each card gives you the useful first move before implementation. On desktop, hover or focus a card to see its next step; on touch devices, both parts remain visible.';
const newPrompt = 'Choose the situation that sounds closest. Each illustrated tile shows the useful first move and the review or tool to use next.';
html = html.replace(oldPrompt, newPrompt);

html = html.replace(
  'https://skills.oobcreative.com/images/ai-relationship/ai-workflow-map.webp',
  'https://skills.oobcreative.com/images/ai-character/poses/robot-confident.webp'
);

html = html.replace(
  /<figure class="hero-art" aria-labelledby="hero-art-caption">[\s\S]*?<\/figure>/,
  '<figure class="hero-art" aria-labelledby="hero-art-caption"><img class="hero-art__image" src="/images/ai-character/poses/robot-confident.webp" alt="The oobCREATIVE robot stands beside the homepage introduction." width="305" height="526" decoding="async" fetchpriority="high"><figcaption id="hero-art-caption" class="hero-art__caption">Find the friction first, then choose the useful next step.</figcaption></figure>'
);

const sceneSources = new Map([
  ['/images/experiences/missed-calls.webp', '/images/pathway-scenes/customer-contact.svg'],
  ['/images/experiences/repeated-admin.webp', '/images/pathway-scenes/workflow-systems.svg'],
  ['/images/experiences/team-ai-boundaries.webp', '/images/pathway-scenes/ai-team.svg'],
  ['/images/experiences/website-message-clarity.webp', '/images/pathway-scenes/website-message.svg'],
  ['/images/experiences/idea-to-test.webp', '/images/pathway-scenes/test-idea.svg'],
  ['/images/ai-character/poses/robot-arms-crossed.webp', '/images/pathway-scenes/founder-bottleneck.svg'],
]);

for (const [oldSource, newSource] of sceneSources) {
  html = html.replace(`src="${oldSource}"`, `src="${newSource}"`);
}

html = html.replace(/<p class="review-path-card__hint"[^>]*>[\s\S]*?<\/p>/g, '');

html = html.replace(
  /(<section class="review-path-card__face review-path-card__back"[^>]*><p class="eyebrow">A useful first move<\/p>)<h3>[\s\S]*?<\/h3><p>[\s\S]*?<\/p>(<a class="oob-cta")/g,
  '$1$2'
);

writeFileSync(homepagePath, html);
console.log('Normalized homepage hero and pathways for production.');
