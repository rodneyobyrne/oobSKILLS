import { spawnSync } from 'node:child_process';

const args = ['playwright', 'install'];

if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
  args.push('--with-deps');
}

args.push('chromium');

const result = spawnSync('npx', args, { stdio: 'inherit', shell: process.platform === 'win32' });

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
