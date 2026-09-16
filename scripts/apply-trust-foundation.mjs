#!/usr/bin/env node

import { cpSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(scriptDirectory, '..');
const outputRoot = join(sourceRoot, '_site');
const releaseVersion = String(process.env.SITE_RELEASE_VERSION || process.env.GITHUB_SHA || 'local')
  .trim()
  .replace(/[^a-zA-Z0-9._-]/g, '-') || 'local';

const trustDirectories = ['accessibility', 'contact', 'terms'];
const buildSource = readFileSync(join(sourceRoot, 'scripts', 'build-site.mjs'), 'utf8');

function templateConstant(name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = buildSource.match(new RegExp('const ' + escapedName + ' = `([\\s\\S]*?)`;'));
  if (!match) throw new Error(`Could not read ${name} from scripts/build-site.mjs`);
  return match[1];
}

const desktopNavigation = templateConstant('desktopNavigation');
const mobileNavigation = templateConstant('mobileNavigation');

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
        <p class="footer-label">Company</p>
        <a href="/about/">About</a>
        <a href="/contact/">Contact</a>
        <a href="mailto:hello@oobcreative.com">hello@oobcreative.com</a>
      </div>
      <div>
        <p class="footer-label">Policies</p>
        <a href="/privacy-policy/">Privacy Policy</a>
        <a href="/terms/">Terms of Use</a>
        <a href="/accessibility/">Accessibility</a>
      </div>
    </div>
  </div>
  <div class="footer-bar"><div class="site-shell"><span>© 2018-2026 oobCREATIVE. All rights reserved.</span><span>Roaring Fork Valley, Colorado</span><a href="/privacy-policy/">Privacy</a><a href="/terms/">Terms</a><a href="/accessibility/">Accessibility</a></div></div>
</footer>`;

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://skills.oobcreative.com/#organization',
  name: 'oobCREATIVE',
  legalName: 'Baxter Barkley LLC',
  url: 'https://skills.oobcreative.com/',
  email: 'mailto:hello@oobcreative.com',
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Roaring Fork Valley, Colorado',
  },
};

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const absolutePath = join(directory, name);
    return statSync(absolutePath).isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

function replacePrimaryNavigation(html) {
  let next = html.replace(/<nav class="desktop-nav"[^>]*>[\s\S]*?<\/nav>/i, desktopNavigation);
  next = next.replace(/<details class="mobile-nav"[^>]*>[\s\S]*?<\/details>/i, mobileNavigation);
  return next;
}

function ensureFooter(html) {
  if (/<footer\b[\s\S]*?<\/footer>/i.test(html)) {
    return html.replace(/<footer\b[\s\S]*?<\/footer>/i, siteFooter);
  }
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${siteFooter}\n</body>`);
  return html;
}

function injectSiteAssets(html) {
  let next = html;
  const styles = ['/navigation-v2.css', '/site-layout-v2.css', '/site-polish-v3.css', '/site-polish-v4.css'];
  const scripts = ['/site-polish-v3.js', '/site-polish-v4.js'];

  for (const href of styles) {
    if (!next.includes(href)) next = next.replace('</head>', `  <link rel="stylesheet" href="${href}">\n</head>`);
  }
  for (const src of scripts) {
    if (!next.includes(src)) next = next.replace('</head>', `  <script defer src="${src}"></script>\n</head>`);
  }
  return next;
}

function versionLocalAssets(html) {
  return html.replace(/\b(href|src)=(['"])([^'"]+\.(?:css|js))(?:\?[^'"]*)?\2/gi, (match, attribute, quote, url) => {
    if (/^(?:https?:)?\/\//i.test(url) || /^(?:data|blob):/i.test(url)) return match;
    return `${attribute}=${quote}${url}?v=${releaseVersion}${quote}`;
  });
}

function addOrganizationSchema(html) {
  if (html.includes('https://skills.oobcreative.com/#organization')) return html;
  const schema = `  <script type="application/ld+json">${JSON.stringify(organizationSchema)}</script>\n`;
  return html.replace('</head>', `${schema}</head>`);
}

for (const directory of trustDirectories) {
  const source = join(sourceRoot, directory);
  if (!existsSync(source)) throw new Error(`Trust page source is missing: ${directory}`);
  cpSync(source, join(outputRoot, directory), { recursive: true });
}

for (const directory of trustDirectories) {
  const directoryRoot = join(outputRoot, directory);
  for (const absolutePath of walk(directoryRoot)) {
    if (extname(absolutePath).toLowerCase() !== '.html') continue;
    let html = readFileSync(absolutePath, 'utf8');
    html = replacePrimaryNavigation(html);
    html = ensureFooter(html);
    html = injectSiteAssets(html);
    html = versionLocalAssets(html);
    writeFileSync(absolutePath, html);
  }
}

for (const absolutePath of walk(outputRoot)) {
  if (extname(absolutePath).toLowerCase() !== '.html') continue;
  const outputFile = relative(outputRoot, absolutePath).split(sep).join('/');
  if (outputFile.startsWith('voice-agent/')) continue;
  let html = readFileSync(absolutePath, 'utf8');
  html = ensureFooter(html);
  if (outputFile === 'index.html') html = addOrganizationSchema(html);
  writeFileSync(absolutePath, html);
}

console.log('Applied trust foundation pages, footer coverage and organization identity.');
