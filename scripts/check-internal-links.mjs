#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '..');
const siteRoot = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : join(repositoryRoot, '_site');
const siteOrigin = 'https://skills.oobcreative.com';
const ignoredDirectories = new Set(['.git', 'node_modules', 'scripts', 'tests', 'tmp']);

const problems = [];
const pages = new Map();
const contextualLinks = new Map();

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    if (ignoredDirectories.has(name)) return [];
    const absolutePath = join(directory, name);
    return statSync(absolutePath).isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

function fileName(absolutePath) {
  return relative(siteRoot, absolutePath).split(sep).join('/');
}

function routeForFile(file) {
  if (file === 'index.html') return '/';
  if (file.endsWith('/index.html')) return `/${file.slice(0, -'index.html'.length)}`;
  return `/${file}`;
}

function pageFileForPath(pathname) {
  const cleanPath = decodeURIComponent(pathname).replace(/\/+/g, '/');
  if (cleanPath === '/') return 'index.html';
  if (cleanPath.endsWith('/')) return `${cleanPath.slice(1)}index.html`;
  const withoutLeadingSlash = cleanPath.replace(/^\//, '');
  if (extname(withoutLeadingSlash)) return withoutLeadingSlash;
  return `${withoutLeadingSlash}/index.html`;
}

function stripNavigation(mainHtml) {
  return mainHtml
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<div\b[^>]*class=["'][^"']*\bbreadcrumbs\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, ' ');
}

function pageTarget(href, sourceRoute) {
  const trimmed = href.trim();
  if (!trimmed || /^(?:#|mailto:|tel:|data:|javascript:)/i.test(trimmed)) return null;

  let url;
  try {
    url = new URL(trimmed, `${siteOrigin}${sourceRoute}`);
  } catch {
    return null;
  }

  if (url.origin !== siteOrigin) return null;
  const targetFile = pageFileForPath(url.pathname);
  if (!targetFile.toLowerCase().endsWith('.html')) return null;
  if (!pages.has(targetFile)) return null;
  return targetFile;
}

const htmlFiles = walk(siteRoot).filter((file) => extname(file).toLowerCase() === '.html');

for (const absolutePath of htmlFiles) {
  const file = fileName(absolutePath);
  const html = readFileSync(absolutePath, 'utf8');
  const route = routeForFile(file);
  const isRedirect = /<meta\b[^>]*http-equiv=["']refresh["']/i.test(html);
  const isNoIndex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  pages.set(file, { file, route, html, isRedirect, isNoIndex });
}

for (const page of pages.values()) {
  if (page.isRedirect) continue;
  const mainMatch = page.html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) continue;

  const content = stripNavigation(mainMatch[1]);
  const targets = new Set();
  for (const match of content.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const target = pageTarget(match[1], page.route);
    if (!target || target === page.file) continue;
    targets.add(target);
  }
  contextualLinks.set(page.file, targets);

  if (targets.size < 1) {
    problems.push(`${page.file}: no contextual internal cross-link in <main> outside navigation/breadcrumbs`);
  }
}

const inbound = new Map([...pages.keys()].map((file) => [file, new Set()]));
for (const [source, targets] of contextualLinks.entries()) {
  for (const target of targets) inbound.get(target)?.add(source);
}

for (const page of pages.values()) {
  if (page.isRedirect || page.isNoIndex || page.file === 'index.html') continue;
  const sources = inbound.get(page.file) || new Set();
  const indexableSources = [...sources].filter((source) => {
    const sourcePage = pages.get(source);
    return sourcePage && !sourcePage.isRedirect && !sourcePage.isNoIndex;
  });
  if (indexableSources.length < 1) {
    problems.push(`${page.file}: no contextual inbound link from another indexable page`);
  }
}

console.log('Contextual internal-link graph:');
for (const page of [...pages.values()].sort((a, b) => a.file.localeCompare(b.file))) {
  if (page.isRedirect) continue;
  const outgoing = contextualLinks.get(page.file)?.size || 0;
  const incoming = inbound.get(page.file)?.size || 0;
  const flags = [page.isNoIndex ? 'noindex' : 'indexable'].join(', ');
  console.log(`- ${page.file}: ${outgoing} contextual outbound, ${incoming} contextual inbound (${flags})`);
}

if (problems.length > 0) {
  console.error(`\nInternal-link audit found ${problems.length} problem${problems.length === 1 ? '' : 's'}:`);
  for (const problem of problems.sort()) console.error(`- ${problem}`);
  process.exitCode = 1;
} else {
  console.log(`\nInternal-link audit passed for ${pages.size} HTML pages.`);
}
