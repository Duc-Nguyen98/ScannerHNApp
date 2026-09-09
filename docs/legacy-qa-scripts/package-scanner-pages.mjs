import { access, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'dist', 'client');
const output = join(root, 'work', 'scanner-pages');
const projectBase = '/WMS_UIUX_HoaNamv2/app-scanner';
const textExtensions = new Set(['.html', '.css', '.js', '.json', '.rsc', '.txt', '.svg']);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(file));
    else files.push(file);
  }
  return files;
}

await rm(output, { recursive: true, force: true });
await mkdir(join(output, 'app-scanner'), { recursive: true });

// The regular vinext export emits scanner.html plus one shared _next tree.
// Put both beneath the project path expected by GitHub Pages.
await cp(join(source, 'scanner.html'), join(output, 'app-scanner', 'index.html'));
await cp(join(source, '_next'), join(output, 'app-scanner', '_next'), { recursive: true });
try {
  await access(join(source, 'favicon.svg'));
  await cp(join(source, 'favicon.svg'), join(output, 'app-scanner', 'favicon.svg'));
} catch {
  // The favicon is optional for the scanner-only artifact.
}

for (const file of await walk(join(output, 'app-scanner'))) {
  if (!textExtensions.has(extname(file))) continue;
  const before = await readFile(file, 'utf8');
  const after = before.replaceAll('/_next/', `${projectBase}/_next/`);
  if (after !== before) await writeFile(file, after);
}

await writeFile(join(output, '.nojekyll'), '');
await writeFile(
  join(output, 'README.txt'),
  'Hoa Nam Scanner preview. The app is served from /WMS_UIUX_HoaNamv2/app-scanner/.\n',
);
console.log(`Scanner Pages artifact ready: ${output}`);
