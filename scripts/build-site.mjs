#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(scriptDirectory, '..');
const outputRoot = join(sourceRoot, '_site');
const releaseVersion = String(process.env.SITE_RELEASE_VERSION || process.env.GITHUB_SHA || 'local')
  .trim()
  .replace(/[^a-zA-Z0-9._-]/g, '-') || 'local';

const publicFiles = [
  'CNAME',
  'assessment-tools-v2.css',
  'content-pages.css',
  'doodle-system.css',
  'hero-animation.css',
  'hero-animation.js',
  'home-ai-cards-v3.css',
  'home-ui-v4.css',
  'home-ui-v4.js',
  'navigation-v2.css',
  'review-path-cards.css',
  'section-lockups.css',
  'site-layout-v2.css',
  'site-polish-v3.css',
  'site-polish-v3.js',
  'site-polish-v4.css',
  'site-polish-v4.js',
  '404.html',
  'index.html',
  'robots.txt',
  'sitemap.xml',
  'styles.css',
];

const publicDirectories = [
  'about',
  'assessments',
  'audience-review',
  'branding',
  'downloads',
  'free-tools',
  'images',
  'output',
  'practical-ai',
  'privacy-policy',
  'services',
  'start-here',
  'tools',
  'workfiles',
];

const desktopNavigation = `<nav class="desktop-nav" aria-label="Primary navigation">
  <a href="/">Home</a>
  <a href="/start-here/">Start Here</a>
  <details class="nav-group nav-group--reviews">
    <summary>Reviews</summary>
    <div class="nav-group__menu">
      <a href="/start-here/">Find the Right Review</a>
      <a class="nav-menu-all" href="/assessments/">All Reviews</a>
    </div>
  </details>
  <details class="nav-group nav-group--ai">
    <summary>Practical AI</summary>
    <div class="nav-group__menu">
      <a href="/assessments/ai-workday-review/">01 Find a Use</a>
      <a href="/tools/ai-pilot-starter/">02 Test It</a>
      <a href="/workfiles/ai-workday-map/">03 Put It Into Work</a>
      <a class="nav-menu-all" href="/practical-ai/">Quick AI Checks</a>
    </div>
  </details>
  <a href="/services/">Services</a>
  <a href="/free-tools/">Resources</a>
  <a href="/about/">About</a>
  <a class="nav-cta" href="mailto:hello@oobcreative.com?subject=oobSKILLS%20conversation">Talk to oobCREATIVE</a>
</nav>`;

const mobileNavigation = `<details class="mobile-nav">
  <summary aria-label="Open navigation"><span></span><span></span><span></span></summary>
  <nav aria-label="Mobile navigation">
    <a href="/">Home</a>
    <a href="/start-here/">Start Here</a>
    <details class="nav-group nav-group--reviews">
      <summary>Reviews</summary>
      <div class="nav-group__menu">
        <a href="/start-here/">Find the Right Review</a>
        <a class="nav-menu-all" href="/assessments/">All Reviews</a>
      </div>
    </details>
    <details class="nav-group nav-group--ai">
      <summary>Practical AI</summary>
      <div class="nav-group__menu">
        <a href="/assessments/ai-workday-review/">01 Find a Use</a>
        <a href="/tools/ai-pilot-starter/">02 Test It</a>
        <a href="/workfiles/ai-workday-map/">03 Put It Into Work</a>
        <a class="nav-menu-all" href="/practical-ai/">Quick AI Checks</a>
      </div>
    </details>
    <a href="/services/">Services</a>
    <a href="/free-tools/">Resources</a>
    <a href="/about/">About</a>
    <a class="nav-cta" href="mailto:hello@oobcreative.com?subject=oobSKILLS%20conversation">Talk to oobCREATIVE</a>
  </nav>
</details>`;

const siteFooter = `<footer>
  <div class="site-shell footer-main">
    <div class="footer-brand">
      <img class="footer-logo" src="/branding/logo_horiz-hex111111_background.png" alt="oobCREATIVE" width="270" height="68">
      <p>Go deeper, not louder.</p>
      <p class="footer-description">Practical diagnostics and implementation for the places where communication, workflow, systems and AI meet.</p>
    </div>
    <div class="footer-links">
      <div>
        <p class="footer-label">Explore</p>
        <a href="/start-here/">Start Here</a>
        <a href="/assessments/">Reviews</a>
        <a href="/practical-ai/">Practical AI</a>
        <a href="/services/">Services</a>
        <a href="/free-tools/">Resources</a>
      </div>
      <div>
        <p class="footer-label">Connect</p>
        <a href="/about/">About</a>
        <a href="mailto:hello@oobcreative.com">hello@oobcreative.com</a>
        <a href="/privacy-policy/">Privacy Policy</a>
      </div>
    </div>
  </div>
  <div class="footer-bar"><div class="site-shell"><span>© 2018-2026 oobCREATIVE. All rights reserved.</span><span>Roaring Fork Valley, Colorado</span><a href="/privacy-policy/">Privacy Policy</a></div></div>
</footer>`;

const contextualLinkBlocks = new Map([
  [
    'assessments/ai-workday-review/index.html',
    `<section class="content-section--soft" data-related-links="true">
      <div class="site-shell section-heading-row">
        <div><p class="eyebrow">Related next steps</p><h2>Keep the pilot connected to the larger decision.</h2></div>
        <p class="section-side-note">Use the broader guidance only where it helps you understand the responsibility, compare the level of support or confirm how browser-based tools handle your information.</p>
      </div>
      <div class="site-shell content-grid">
        <article class="content-card"><p class="meta">Understand the method</p><h3>Practical AI</h3><p>See why oobCREATIVE starts with the workflow, human review and consequence before choosing an AI tool.</p><a class="text-link" href="/practical-ai/">Read the Practical AI guidance <span aria-hidden="true">→</span></a></article>
        <article class="content-card"><p class="meta">Compare the options</p><h3>Reviews</h3><p>See the other guided review paths and choose the amount of structure that fits the question.</p><a class="text-link" href="/assessments/">See all reviews <span aria-hidden="true">→</span></a></article>
        <article class="content-card"><p class="meta">Browser privacy</p><h3>How your information is handled</h3><p>Review the site privacy details for browser processing, local drafts and the limits of these tools.</p><a class="text-link" href="/privacy-policy/">Read the Privacy Policy <span aria-hidden="true">→</span></a></article>
      </div>
    </section>`,
  ],
  [
    'assessments/idea-to-test-review/index.html',
    `<section class="content-section--soft" data-related-links="true">
      <div class="site-shell section-heading-row">
        <div><p class="eyebrow">Related next steps</p><h2>Keep the test connected to the audience and the real problem.</h2></div>
        <p class="section-side-note">Use these only if the test reveals that the starting problem or audience decision still needs clarification.</p>
      </div>
      <div class="site-shell content-grid">
        <article class="content-card"><p class="meta">Need a different starting point?</p><h3>Start Here</h3><p>Return to the recognizable problem before deciding whether the next move is a test, workflow, message or service.</p><a class="text-link" href="/start-here/">Find the right starting point <span aria-hidden="true">→</span></a></article>
        <article class="content-card"><p class="meta">Need audience clarity?</p><h3>Audience Review</h3><p>Unbox the customer decision before rewriting the message or expanding the test.</p><a class="text-link" href="/audience-review/">Start the Audience Review <span aria-hidden="true">→</span></a></article>
      </div>
    </section>`,
  ],
  [
    'privacy-policy/index.html',
    `<section class="content-section--soft" data-related-links="true">
      <div class="site-shell section-heading-row">
        <div><p class="eyebrow">Related resources</p><h2>See the tools this policy is protecting.</h2></div>
        <p class="section-side-note">The free tools explain their browser, draft and review behavior in context. Use only the tool that fits the decision in front of you.</p>
      </div>
      <div class="site-shell"><a class="text-link" href="/free-tools/">See the resources <span aria-hidden="true">→</span></a></div>
    </section>`,
  ],
]);

function requireSource(pathFromRoot) {
  const absolutePath = join(sourceRoot, pathFromRoot);
  if (!existsSync(absolutePath)) throw new Error(`Required public source is missing: ${pathFromRoot}`);
  return absolutePath;
}

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const absolutePath = join(directory, name);
    return statSync(absolutePath).isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

function versionLocalAssets(html) {
  return html.replace(/\b(href|src)=(['"])([^'"]+\.(?:css|js))(?:\?[^'"]*)?\2/gi, (match, attribute, quote, url) => {
    if (/^(?:https?:)?\/\//i.test(url) || /^(?:data|blob):/i.test(url)) return match;
    return `${attribute}=${quote}${url}?v=${releaseVersion}${quote}`;
  });
}

function getExperience(outputFile) {
  if (outputFile === 'assessments/index.html') return 'reviews-hub';
  if (outputFile === 'audience-review/index.html') return 'audience-review';
  if (/^assessments\/[^/]+\/index\.html$/i.test(outputFile)) return 'review';
  if (/^tools\/[^/]+\/index\.html$/i.test(outputFile)) return 'tool';
  if (outputFile === 'workfiles/ai-workday-map/index.html') return 'tool';
  return '';
}

function annotateExperience(html, outputFile) {
  const experience = getExperience(outputFile);
  if (!experience) return html;
  return html.replace(/<body\b([^>]*)>/i, (match, attrs) => {
    if (/\bdata-oob-experience=/i.test(attrs)) return match;
    return `<body${attrs} data-oob-experience="${experience}">`;
  });
}

function injectSiteAssets(html, outputFile) {
  let next = html;
  const experience = getExperience(outputFile);
  if (!next.includes('/navigation-v2.css')) {
    next = next.replace('</head>', `    <link rel="stylesheet" href="/navigation-v2.css?v=${releaseVersion}">\n  </head>`);
  }
  if (experience && !next.includes('/assessment-tools-v2.css')) {
    next = next.replace('</head>', `    <link rel="stylesheet" href="/assessment-tools-v2.css?v=${releaseVersion}">\n  </head>`);
  }
  if (!next.includes('/site-layout-v2.css')) {
    next = next.replace('</head>', `    <link rel="stylesheet" href="/site-layout-v2.css?v=${releaseVersion}">\n  </head>`);
  }
  if (!next.includes('/site-polish-v3.css')) {
    next = next.replace('</head>', `    <link rel="stylesheet" href="/site-polish-v3.css?v=${releaseVersion}">\n  </head>`);
  }
  if (!next.includes('/site-polish-v4.css')) {
    next = next.replace('</head>', `    <link rel="stylesheet" href="/site-polish-v4.css?v=${releaseVersion}">\n  </head>`);
  }
  if (!next.includes('/site-polish-v3.js')) {
    next = next.replace('</head>', `    <script defer src="/site-polish-v3.js?v=${releaseVersion}"></script>\n  </head>`);
  }
  if (!next.includes('/site-polish-v4.js')) {
    next = next.replace('</head>', `    <script defer src="/site-polish-v4.js?v=${releaseVersion}"></script>\n  </head>`);
  }
  return next;
}

function replacePrimaryNavigation(html) {
  let next = html.replace(/<nav class="desktop-nav"[^>]*>[\s\S]*?<\/nav>/i, desktopNavigation);
  next = next.replace(/<details class="mobile-nav"[^>]*>[\s\S]*?<\/details>/i, mobileNavigation);
  return next;
}

function replaceFooter(html) {
  if (/<footer\b[\s\S]*?<\/footer>/i.test(html)) {
    return html.replace(/<footer\b[\s\S]*?<\/footer>/i, siteFooter);
  }
  return html;
}

function injectContextualLinks(html, outputFile) {
  const block = contextualLinkBlocks.get(outputFile);
  if (!block || html.includes('data-related-links="true"') || !/<\/main>/i.test(html)) return html;
  return html.replace(/<\/main>/i, `${block}\n  </main>`);
}

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

for (const file of publicFiles) cpSync(requireSource(file), join(outputRoot, file));
for (const directory of publicDirectories) {
  cpSync(requireSource(directory), join(outputRoot, directory), { recursive: true });
}

for (const absolutePath of walk(outputRoot)) {
  if (extname(absolutePath).toLowerCase() !== '.html') continue;
  const outputFile = relative(outputRoot, absolutePath).split(sep).join('/');
  const html = readFileSync(absolutePath, 'utf8');
  const withContextualLinks = injectContextualLinks(html, outputFile);
  const withCanonicalNavigation = replacePrimaryNavigation(withContextualLinks);
  const withFooter = replaceFooter(withCanonicalNavigation);
  const withExperience = annotateExperience(withFooter, outputFile);
  writeFileSync(absolutePath, injectSiteAssets(versionLocalAssets(withExperience), outputFile));
}

writeFileSync(join(outputRoot, '.nojekyll'), '');
writeFileSync(join(outputRoot, 'release.json'), `${JSON.stringify({ version: releaseVersion }, null, 2)}\n`);

const builtFiles = walk(outputRoot).map((file) => relative(outputRoot, file).split(sep).join('/'));
const forbiddenTopLevel = new Set(['.github', 'AGENTS.md', 'scripts', 'static.yml', 'tests', 'tmp']);
for (const file of builtFiles) {
  if (forbiddenTopLevel.has(file.split('/')[0])) throw new Error(`Operational file entered public build: ${file}`);
}

console.log(`Built ${builtFiles.length} public files in _site for release ${releaseVersion}.`);
