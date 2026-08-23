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
  'content-pages.css',
  'doodle-system.css',
  'hero-animation.css',
  'hero-animation.js',
  'home-ai-cards-v3.css',
  '404.html',
  'index.html',
  'robots.txt',
  'sitemap.xml',
  'styles.css',
];

const publicDirectories = [
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

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

for (const file of publicFiles) cpSync(requireSource(file), join(outputRoot, file));
for (const directory of publicDirectories) {
  cpSync(requireSource(directory), join(outputRoot, directory), { recursive: true });
}

for (const absolutePath of walk(outputRoot)) {
  if (extname(absolutePath).toLowerCase() !== '.html') continue;
  const html = readFileSync(absolutePath, 'utf8');
  writeFileSync(absolutePath, versionLocalAssets(html));
}

writeFileSync(join(outputRoot, '.nojekyll'), '');
writeFileSync(join(outputRoot, 'release.json'), `${JSON.stringify({ version: releaseVersion }, null, 2)}\n`);

const builtFiles = walk(outputRoot).map((file) => relative(outputRoot, file).split(sep).join('/'));
const forbiddenTopLevel = new Set(['.github', 'AGENTS.md', 'scripts', 'static.yml', 'tests', 'tmp']);
for (const file of builtFiles) {
  if (forbiddenTopLevel.has(file.split('/')[0])) throw new Error(`Operational file entered public build: ${file}`);
}

console.log(`Built ${builtFiles.length} public files in _site for release ${releaseVersion}.`);
