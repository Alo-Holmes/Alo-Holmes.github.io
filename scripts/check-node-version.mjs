import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8'));
const expectedRange = pkg.engines?.node || '';
const currentVersion = process.version.replace(/^v/, '');

const satisfies = (version, range) => {
  if (!range) return true;

  const [minRaw, maxRaw] = range.split(' < ');
  const min = minRaw.replace('>=', '');
  const max = maxRaw?.replace('<=', '');

  const compare = (a, b) => {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    const length = Math.max(aParts.length, bParts.length);

    for (let i = 0; i < length; i += 1) {
      const aValue = aParts[i] ?? 0;
      const bValue = bParts[i] ?? 0;
      if (aValue > bValue) return 1;
      if (aValue < bValue) return -1;
    }
    return 0;
  };

  if (compare(version, min) < 0) return false;
  if (max && compare(version, max) >= 0) return false;
  return true;
};

if (!satisfies(currentVersion, expectedRange)) {
  console.error(`Unsupported Node.js version ${currentVersion}. Expected ${expectedRange}.`);
  process.exit(1);
}

console.log(`Node.js version ${currentVersion} satisfies ${expectedRange}.`);
