import { cp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { preparePreviewPages } from './prepare-preview-pages.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = '/WMS_UIUX_HoaNamv2/app-scanner';
const buildRoot = join(root, 'work', 'scanner-build-latest');
const output = join(root, 'work', 'scanner-pages');

await rm(buildRoot, { recursive: true, force: true });
await rm(output, { recursive: true, force: true });
await mkdir(join(buildRoot, 'app'), { recursive: true });

async function copy(source, destination = source) {
  const target = join(buildRoot, destination);
  await mkdir(dirname(target), { recursive: true });
  await cp(join(root, source), target, { recursive: true });
}

await copy('app/layout.tsx');
await copy('app/globals.css');
await copy('app/scanner/page.tsx', 'app/page.tsx');
await copy('components/scanner-preview.tsx');
await copy('components/scanner-preview.css');
await copy('components/scanner-home.tsx');
await copy('components/scanner-home.css');
await copy('components/scanner-launcher.tsx');
await copy('components/scanner-intent-scan.tsx');
await copy('components/scanner-global.css');
await copy('components/scanner-visual-lock.css');
await copy('components/scanner-approved-assets');
await copy('lib/scanner-intent.ts');
await copy('lib/scanner-design-fixtures.ts');
await copy('components/scanner-mobile-layout.tsx');
await copy('components/scanner-mobile-layout.css');
await copy('components/scanner-outbound.tsx');
await copy('components/scanner-inbound-create.tsx');
await copy('components/scanner-inbound-create.css');
await copy('components/scanner-inbound-scan.tsx');
await copy('components/scanner-inbound-scan.css');
await copy('components/scanner-inbound-review.tsx');
await copy('components/scanner-inbound-review.css');
await copy('components/scanner-outbound-scan.tsx');
await copy('components/scanner-outbound-scan.css');
await copy('components/scanner-outbound-review.tsx');
await copy('components/scanner-outbound-review.css');
await copy('components/scanner-outbound.css');
await copy('lib/agency-demo.ts');
await copy('components/scanner-auth.tsx');
await copy('components/scanner-entry-ui.css');
await copy('components/scanner-entry-reference.css');
await copy('components/scanner-account.tsx');
await copy('components/scanner-account.css');
await copy('lib/scanner-account-preview.ts');
await copy('lib/scanner-auth.ts');
await copy('lib/scanner-auth-preview.ts');
await copy('components/warranty-scanner-app.tsx');
await copy('components/scanner-app-shell.tsx');
await copy('components/scanner-app-shell.css');
await copy('components/scanner-app-overlay.tsx');
await copy('lib/scanner-model.ts');
await copy('lib/scanner-policy.ts');
await copy('lib/utils.ts');
await copy('next-env.d.ts');
await copy('next.config.ts');
await copy('tsconfig.json');
await copy('package.json');
await symlink(join(root, 'node_modules'), join(buildRoot, 'node_modules'), 'junction');

await writeFile(join(buildRoot, 'vite.config.ts'), `
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
export default defineConfig({
  css: { postcss: { plugins: [tailwindcss()] } },
  environments: { client: { define: {
    'process.env.__NEXT_ROUTER_BASEPATH': ${JSON.stringify(JSON.stringify(base))}
  } } },
  plugins: [vinext()],
});
`);

try {
  execFileSync(process.execPath, [join(root, 'node_modules/vinext/dist/cli.js'), 'build'], {
    cwd: buildRoot,
    stdio: 'inherit',
  });
} catch (error) {
  // On some Windows Node builds vinext can finish the export and then exit
  // with a libuv assertion while closing its prerender server. Continue only
  // when the complete client export is present; CI/Linux still fails normally.
  if (process.platform !== 'win32' || error?.status !== 3221226505) throw error;
  console.warn('vinext exited after prerender; validating the generated client export.');
}

const client = join(buildRoot, 'dist', 'client');
await preparePreviewPages(client, base);
await mkdir(join(output, 'app-scanner'), { recursive: true });
await cp(join(client, 'index.html'), join(output, 'app-scanner', 'index.html'));
await cp(join(client, '_next'), join(output, 'app-scanner', '_next'), { recursive: true });
try {
  await cp(join(client, 'favicon.svg'), join(output, 'app-scanner', 'favicon.svg'));
} catch {
  // Optional asset.
}
await writeFile(join(output, '.nojekyll'), '');
await writeFile(
  join(output, 'README.txt'),
  'Hoa Nam Scanner preview. The app is served from /WMS_UIUX_HoaNamv2/app-scanner/.\n',
);

const html = await readFile(join(output, 'app-scanner', 'index.html'), 'utf8');
if (!html.includes(base)) throw new Error(`Scanner export does not contain router base ${base}`);
console.log(`Standalone Scanner Pages artifact ready: ${output}`);
