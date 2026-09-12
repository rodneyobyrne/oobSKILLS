#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '..');
const outputRoot = resolve(repositoryRoot, '_site');

const standaloneDirectories = ['voice-agent'];
const prelaunchRobotsMeta = '<meta name="robots" content="noindex,nofollow">';

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const absolutePath = join(directory, name);
    return statSync(absolutePath).isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

function enforcePrelaunchRobots(directory) {
  let updated = 0;

  for (const file of walk(directory)) {
    if (extname(file).toLowerCase() !== '.html') continue;

    const source = readFileSync(file, 'utf8');
    const robotsPattern = /<meta\s+name=["']robots["'][^>]*>/i;
    const next = robotsPattern.test(source)
      ? source.replace(robotsPattern, prelaunchRobotsMeta)
      : source.replace(/<head>/i, `<head>\n  ${prelaunchRobotsMeta}`);

    if (next !== source) {
      writeFileSync(file, next, 'utf8');
      updated += 1;
    }
  }

  return updated;
}

for (const directory of standaloneDirectories) {
  const source = resolve(repositoryRoot, directory);
  const destination = resolve(outputRoot, directory);

  if (!existsSync(source)) {
    throw new Error(`Required standalone page source is missing: ${directory}`);
  }

  rmSync(destination, { recursive: true, force: true });
  mkdirSync(outputRoot, { recursive: true });
  cpSync(source, destination, { recursive: true });

  const protectedPages = enforcePrelaunchRobots(destination);
  console.log(`Applied noindex,nofollow to ${protectedPages} ${directory} HTML page${protectedPages === 1 ? '' : 's'}.`);
}

console.log(`Published ${standaloneDirectories.length} standalone conversion page director${standaloneDirectories.length === 1 ? 'y' : 'ies'} into _site.`);
