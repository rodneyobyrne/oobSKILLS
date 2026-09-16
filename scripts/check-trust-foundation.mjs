#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '..');
const siteRoot = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : join(repositoryRoot, '_site');
const problems = [];

const lockedPrivacyBlobSha = '342a1365c29bbf4d7261128dab1601bb7779a186';
const requiredPages = ['accessibility/index.html', 'contact/index.html', 'terms/index.html'];
const requiredFooterLinks = ['/contact/', '/privacy-policy/', '/terms/', '/accessibility/'];

function report(message) {
  problems.push(message);
}

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const absolutePath = join(directory, name);
    return statSync(absolutePath).isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

function siteFileName(absolutePath) {
  return relative(siteRoot, absolutePath).split(sep).join('/');
}

function gitBlobSha(content) {
  const body = Buffer.from(content, 'utf8');
  const header = Buffer.from(`blob ${body.length}\0`, 'utf8');
  return createHash('sha1').update(header).update(body).digest('hex');
}

for (const page of requiredPages) {
  if (!existsSync(join(siteRoot, page))) report(`${page} is missing from the built site`);
}

for (const absolutePath of walk(siteRoot).filter((file) => extname(file).toLowerCase() === '.html')) {
  const file = siteFileName(absolutePath);
  if (file.startsWith('voice-agent/')) continue;
  const html = readFileSync(absolutePath, 'utf8');
  const isRedirect = /<meta\b[^>]*http-equiv=["']refresh["']/i.test(html);
  const isNoIndex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  if (isRedirect || isNoIndex) continue;

  const footer = html.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0];
  if (!footer) {
    report(`${file} is missing the canonical site footer`);
    continue;
  }
  for (const link of requiredFooterLinks) {
    if (!footer.includes(`href="${link}"`)) report(`${file} footer is missing ${link}`);
  }
}

const homepagePath = join(siteRoot, 'index.html');
if (existsSync(homepagePath)) {
  const homepage = readFileSync(homepagePath, 'utf8');
  const schemaBlocks = [...homepage.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim());
  let organizationFound = false;
  for (const block of schemaBlocks) {
    try {
      const parsed = JSON.parse(block);
      if (parsed?.['@id'] === 'https://skills.oobcreative.com/#organization') {
        organizationFound = parsed['@type'] === 'Organization'
          && parsed.name === 'oobCREATIVE'
          && parsed.legalName === 'Baxter Barkley LLC'
          && parsed.email === 'mailto:hello@oobcreative.com';
      }
    } catch {
      report('Homepage contains invalid JSON-LD');
    }
  }
  if (!organizationFound) report('Homepage is missing the canonical oobCREATIVE Organization identity');
}

const privacySourcePath = join(repositoryRoot, 'privacy-policy', 'index.html');
if (!existsSync(privacySourcePath)) {
  report('Privacy Policy source is missing');
} else {
  const actualPrivacyBlobSha = gitBlobSha(readFileSync(privacySourcePath, 'utf8'));
  if (actualPrivacyBlobSha !== lockedPrivacyBlobSha) {
    report('Privacy Policy source changed. It is intentionally locked until a specific oobCREATIVE business use case requires revision.');
  }
}

if (problems.length) {
  console.error(`Trust foundation checks found ${problems.length} problem${problems.length === 1 ? '' : 's'}:\n`);
  for (const problem of problems.sort()) console.error(`- ${problem}`);
  process.exitCode = 1;
} else {
  console.log('Trust foundation checks passed.');
}
