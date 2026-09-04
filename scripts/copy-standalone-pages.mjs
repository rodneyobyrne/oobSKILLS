#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '..');
const outputRoot = resolve(repositoryRoot, '_site');

const standaloneDirectories = ['voice-agent'];

for (const directory of standaloneDirectories) {
  const source = resolve(repositoryRoot, directory);
  const destination = resolve(outputRoot, directory);

  if (!existsSync(source)) {
    throw new Error(`Required standalone page source is missing: ${directory}`);
  }

  rmSync(destination, { recursive: true, force: true });
  mkdirSync(outputRoot, { recursive: true });
  cpSync(source, destination, { recursive: true });
}

console.log(`Published ${standaloneDirectories.length} standalone conversion page director${standaloneDirectories.length === 1 ? 'y' : 'ies'} into _site.`);
