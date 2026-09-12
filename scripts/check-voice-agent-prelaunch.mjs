#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const siteRoot = resolve(process.argv[2] || '_site');
const voiceRoot = join(siteRoot, 'voice-agent');
const expectedRobots = /<meta\s+name=["']robots["']\s+content=["']noindex,nofollow["']\s*\/?>/i;

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const absolutePath = join(directory, name);
    return statSync(absolutePath).isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

if (!existsSync(voiceRoot)) {
  throw new Error('Prelaunch check failed: _site/voice-agent is missing.');
}

const htmlFiles = walk(voiceRoot).filter((file) => extname(file).toLowerCase() === '.html');
if (!htmlFiles.length) {
  throw new Error('Prelaunch check failed: no voice-agent HTML pages were found.');
}

const unprotected = htmlFiles.filter((file) => !expectedRobots.test(readFileSync(file, 'utf8')));
if (unprotected.length) {
  throw new Error(`Prelaunch check failed: voice-agent pages missing noindex,nofollow:\n${unprotected.join('\n')}`);
}

const sitemapPath = join(siteRoot, 'sitemap.xml');
if (existsSync(sitemapPath) && /\/voice-agent\//i.test(readFileSync(sitemapPath, 'utf8'))) {
  throw new Error('Prelaunch check failed: sitemap.xml still exposes /voice-agent/ URLs.');
}

console.log(`Voice-agent prelaunch guard passed: ${htmlFiles.length} pages are noindex,nofollow and absent from the sitemap.`);
