#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '..');
const siteRoot = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : repositoryRoot;
const requireVersionedAssets = basename(siteRoot) === '_site' || process.env.REQUIRE_VERSIONED_ASSETS === '1';
const ignoredDirectories = new Set(['.git', '_site', 'node_modules', 'scripts', 'tests', 'tmp']);

const problems = [];

function report(file, message) {
  problems.push(`${file}: ${message}`);
}

function walk(directory) {
  return readdirSync(directory)
    .flatMap((name) => {
      if (ignoredDirectories.has(name)) return [];
      const absolutePath = join(directory, name);
      return statSync(absolutePath).isDirectory() ? walk(absolutePath) : [absolutePath];
    });
}

function siteFileName(absolutePath) {
  return relative(siteRoot, absolutePath).split(sep).join('/');
}

function stripNonVisibleContent(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<template\b[\s\S]*?<\/template>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const privateLanguagePatterns = [
  /\binternal (?:communication|planning|strategy|ideation|roadmap)\b/i,
  /\bprivate (?:project )?(?:conversation|notes?|strategy|ideation|brainstorm)\b/i,
  /\b(?:website|content|product) roadmap\b/i,
  /\b(?:content|product development|launch) plan\b/i,
  /\bfuture (?:website|offering|offer|product|release|plan)\b/i,
  /\b(?:the )?market is full of\b/i,
  /\b(?:undercut|competitors? charge|others (?:are )?charging)\b/i,
  /\b(?:persona name|persona label|persona cluster)\b/i,
  /\b(?:Frederick|Jonathan|Brendan|Eli|Doug|Devon|Dave) persona\b/i,
];

const unfinishedPatterns = [
  /\b(?:TODO|FIXME|TBD)\b/,
  /\blorem ipsum\b/i,
  /\bcoming soon\b/i,
  /\bunder construction\b/i,
  /\bnot yet available\b/i,
  /\bwhen available\b/i,
  /\bcurrently available\b/i,
  /\b(?:insert|replace|add) (?:copy|content|text) here\b/i,
  /\b(?:draft only|work in progress)\b/i,
];

const privateSourcePatterns = [
  /\binternal (?:communication|planning|strategy|ideation|roadmap)\b/i,
  /\bprivate project conversation\b/i,
  /\b(?:website|content|product) roadmap\b/i,
  /\b(?:content|product development|launch) plan\b/i,
  /\bfuture (?:website|offering|offer|product|release)\b/i,
  /\b(?:the )?market is full of\b/i,
  /\b(?:undercut|competitors? charge|others (?:are )?charging)\b/i,
];

function checkLanguage(file, html) {
  const visibleText = stripNonVisibleContent(html);

  for (const pattern of privateLanguagePatterns) {
    if (pattern.test(visibleText)) {
      report(file, `customer-facing text appears to expose private planning language (${pattern})`);
    }
  }

  for (const pattern of privateSourcePatterns) {
    if (pattern.test(html) && !pattern.test(visibleText)) {
      report(file, `non-visible public source appears to contain private planning language (${pattern})`);
    }
  }

  for (const pattern of unfinishedPatterns) {
    if (pattern.test(visibleText)) {
      report(file, `customer-facing text contains an unfinished-release marker (${pattern})`);
    }
  }

  if (/\b(?:TODO|FIXME|TBD)\b/.test(html)) {
    report(file, 'source contains an unfinished TODO, FIXME or TBD marker');
  }
}

function checkDocumentStructure(file, html) {
  if (!/^<!doctype html>/i.test(html.trimStart())) report(file, 'missing HTML doctype');
  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) report(file, 'missing html lang attribute');
  if (!/<title>\s*[^<]+\s*<\/title>/i.test(html)) report(file, 'missing a non-empty title');
  const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  const hasDescription = metaTags.some((tag) => /\bname=["']description["']/i.test(tag) && /\bcontent=["'][^"']+["']/i.test(tag));
  if (!hasDescription) {
    report(file, 'missing a non-empty meta description');
  }
  const linkTags = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);
  const hasCanonical = linkTags.some((tag) => /\brel=["']canonical["']/i.test(tag) && /\bhref=["'][^"']+["']/i.test(tag));
  if (!hasCanonical) {
    report(file, 'missing canonical URL');
  }

  const isRedirect = /<meta\b[^>]*http-equiv=["']refresh["']/i.test(html);
  const isNoIndex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (!isRedirect && h1Count !== 1) report(file, `expected exactly one h1; found ${h1Count}`);
  if (!isRedirect && !isNoIndex && !/<main\b/i.test(html)) report(file, 'indexable page is missing a main landmark');
  if (!isRedirect && !isNoIndex && !/<header\b/i.test(html)) report(file, 'indexable page is missing a header landmark');

  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const id of new Set(ids)) {
    if (ids.filter((candidate) => candidate === id).length > 1) report(file, `duplicate id "${id}"`);
  }

  for (const match of html.matchAll(/<button\b([^>]*)>/gi)) {
    if (!/\btype=["'](?:button|submit|reset)["']/i.test(match[1])) {
      report(file, 'button is missing an explicit type');
    }
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(match[1])) report(file, 'image is missing an alt attribute');
  }

  for (const match of html.matchAll(/<a\b([^>]*)>/gi)) {
    if (/\btarget=["']_blank["']/i.test(match[1]) && !/\brel=["'][^"']*\b(?:noopener|noreferrer)\b[^"']*["']/i.test(match[1])) {
      report(file, 'target="_blank" link is missing rel="noopener" or rel="noreferrer"');
    }
  }
}

function linkedScripts(html, sourceFile) {
  const chunks = [html];
  for (const match of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi)) {
    const source = match[1].split(/[?#]/)[0];
    if (!source || /^(?:https?:)?\/\//i.test(source)) continue;
    const absolutePath = source.startsWith('/') ? join(siteRoot, source) : resolve(dirname(sourceFile), source);
    if (existsSync(absolutePath)) chunks.push(readFileSync(absolutePath, 'utf8'));
  }
  return chunks.join('\n');
}

function checkInteractiveExperience(file, html, absolutePath) {
  const controlCount = (html.match(/<(?:input|select|textarea)\b/gi) || []).length;
  if (controlCount < 3) return;

  if (!/<form\b/i.test(html)) report(file, `contains ${controlCount} controls but no form`);
  if (!/<button\b[^>]*\btype=["']submit["']/i.test(html) && !/<input\b[^>]*\btype=["']submit["']/i.test(html)) {
    report(file, 'interactive review has no submit control');
  }

  const behavior = linkedScripts(html, absolutePath);
  if (!/(?:addEventListener\s*\(\s*["']submit["']|onsubmit\s*=)/i.test(behavior)) {
    report(file, 'interactive review has no discoverable submit handler');
  }
  if (!/(?:\bresult(?:s|Title|Content)?\b|aria-live|role=["']status["'])/i.test(behavior)) {
    report(file, 'interactive review has no discoverable result or status path');
  }
}

function resolveLocalReference(referenceValue, sourceFile) {
  const cleanReference = referenceValue.split(/[?#]/)[0];
  if (!cleanReference || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(cleanReference)) return null;

  const candidate = cleanReference.startsWith('/')
    ? join(siteRoot, cleanReference)
    : resolve(dirname(sourceFile), cleanReference);

  if (existsSync(candidate) && statSync(candidate).isDirectory()) return join(candidate, 'index.html');
  if (!extname(candidate) && existsSync(`${candidate}.html`)) return `${candidate}.html`;
  return candidate;
}

function checkLocalReferences(file, html, absolutePath) {
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const referenceValue = match[1];
    if (referenceValue.startsWith('#')) continue;
    const isLocalAsset = !/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(referenceValue);
    if (requireVersionedAssets && isLocalAsset && /\.(?:css|js)(?:[?#]|$)/i.test(referenceValue) && !/[?&]v=[^&#]+/i.test(referenceValue)) {
      report(file, `local CSS or JavaScript asset is not release-versioned: "${referenceValue}"`);
    }
    const localPath = resolveLocalReference(referenceValue, absolutePath);
    if (localPath && !existsSync(localPath)) report(file, `broken local reference "${referenceValue}"`);
  }
}

function checkPublicationBoundary() {
  if (!requireVersionedAssets) return;
  const forbiddenPaths = ['.github', 'AGENTS.md', 'scripts', 'static.yml', 'tests', 'tmp'];
  for (const forbiddenPath of forbiddenPaths) {
    if (existsSync(join(siteRoot, forbiddenPath))) report(forbiddenPath, 'operational or internal path is present in public artifact');
  }

  if (requireVersionedAssets) {
    for (const requiredFile of ['CNAME', 'robots.txt', 'sitemap.xml', 'release.json']) {
      if (!existsSync(join(siteRoot, requiredFile))) report(requiredFile, 'required release file is missing from public artifact');
    }
  }
}

function checkPrivacyDisclosure() {
  const privacyPath = join(siteRoot, 'privacy-policy', 'index.html');
  if (!existsSync(privacyPath)) {
    report('privacy-policy/index.html', 'privacy policy is missing');
    return;
  }

  const privacyText = stripNonVisibleContent(readFileSync(privacyPath, 'utf8'));
  const draftTools = [
    { name: 'Audience Review', script: 'audience-review/app.js' },
    { name: 'Human Review Checklist', script: 'tools/human-review-checklist/review.js' },
    { name: 'AI Workday Review', script: 'assessments/ai-workday-review/review.js' },
    { name: 'Idea-to-Test Review', script: 'assessments/idea-to-test-review/review.js' },
  ];

  for (const tool of draftTools) {
    const scriptPath = join(siteRoot, tool.script);
    if (!existsSync(scriptPath)) {
      report(tool.script, 'declared browser-draft tool script is missing');
      continue;
    }
    if (!/\blocalStorage\b/.test(readFileSync(scriptPath, 'utf8'))) {
      report(tool.script, 'declared browser-draft tool no longer uses local storage; update the disclosure registry');
    }
    const mentions = privacyText.split(tool.name).length - 1;
    if (mentions < 3) {
      report('privacy-policy/index.html', `${tool.name} must be named in the browser, no-endpoint and local-draft disclosures`);
    }
  }

  const disclosedScripts = new Set(draftTools.map((tool) => tool.script));
  for (const absolutePath of walk(siteRoot).filter((file) => extname(file).toLowerCase() === '.js')) {
    const file = siteFileName(absolutePath);
    if (/\blocalStorage\b/.test(readFileSync(absolutePath, 'utf8')) && !disclosedScripts.has(file)) {
      report(file, 'uses local storage but is missing from the privacy disclosure registry');
    }
  }
}

function checkSitemap(htmlFiles) {
  const sitemapPath = join(siteRoot, 'sitemap.xml');
  if (!existsSync(sitemapPath)) {
    report('sitemap.xml', 'sitemap is missing');
    return;
  }

  const sitemap = readFileSync(sitemapPath, 'utf8');
  const sitemapUrls = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1]);
  const sitemapSet = new Set(sitemapUrls);
  if (sitemapUrls.length !== sitemapSet.size) report('sitemap.xml', 'sitemap contains a duplicate URL');
  for (const match of sitemap.matchAll(/<lastmod>\s*([^<]+?)\s*<\/lastmod>/gi)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(match[1])) report('sitemap.xml', `invalid lastmod value "${match[1]}"`);
  }

  const canonicalOwners = new Map();
  for (const absolutePath of htmlFiles) {
    const file = siteFileName(absolutePath);
    const html = readFileSync(absolutePath, 'utf8');
    const isRedirect = /<meta\b[^>]*http-equiv=["']refresh["']/i.test(html);
    const isNoIndex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
    if (isRedirect || isNoIndex) continue;
    const canonicalTag = [...html.matchAll(/<link\b[^>]*>/gi)]
      .map((match) => match[0])
      .find((tag) => /\brel=["']canonical["']/i.test(tag));
    const canonical = canonicalTag?.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (!canonical) continue;
    if (canonicalOwners.has(canonical)) {
      report(file, `canonical URL duplicates ${canonicalOwners.get(canonical)}`);
    } else {
      canonicalOwners.set(canonical, file);
    }
    if (canonical.startsWith('https://skills.oobcreative.com/') && !sitemapSet.has(canonical)) {
      report(file, `indexable canonical URL is missing from sitemap: "${canonical}"`);
    }
  }

  for (const sitemapUrl of sitemapSet) {
    let parsed;
    try {
      parsed = new URL(sitemapUrl);
    } catch {
      report('sitemap.xml', `invalid URL "${sitemapUrl}"`);
      continue;
    }
    if (parsed.origin !== 'https://skills.oobcreative.com') {
      report('sitemap.xml', `unexpected sitemap origin "${parsed.origin}"`);
      continue;
    }
    const localPath = parsed.pathname.endsWith('/')
      ? join(siteRoot, parsed.pathname, 'index.html')
      : join(siteRoot, parsed.pathname);
    if (!existsSync(localPath)) report('sitemap.xml', `URL does not resolve to a built page: "${sitemapUrl}"`);
  }
}

const htmlFiles = walk(siteRoot).filter((file) => extname(file).toLowerCase() === '.html');
const sourceFiles = walk(siteRoot).filter((file) => {
  const extension = extname(file).toLowerCase();
  return extension === '.js' || (extension === '.md' && siteFileName(file).startsWith('downloads/'));
});

for (const absolutePath of sourceFiles) {
  const file = siteFileName(absolutePath);
  const source = readFileSync(absolutePath, 'utf8');
  for (const pattern of privateSourcePatterns) {
    if (pattern.test(source)) report(file, `public source appears to contain private planning language (${pattern})`);
  }
}

for (const absolutePath of htmlFiles) {
  const file = siteFileName(absolutePath);
  const html = readFileSync(absolutePath, 'utf8');
  checkLanguage(file, html);
  checkDocumentStructure(file, html);
  checkInteractiveExperience(file, html, absolutePath);
  checkLocalReferences(file, html, absolutePath);
}

checkPublicationBoundary();
checkPrivacyDisclosure();
checkSitemap(htmlFiles);

if (problems.length > 0) {
  console.error(`Public-site quality checks found ${problems.length} problem${problems.length === 1 ? '' : 's'}:\n`);
  for (const problem of problems.sort()) console.error(`- ${problem}`);
  process.exitCode = 1;
} else {
  console.log(`Public-site quality checks passed for ${htmlFiles.length} HTML files.`);
}
