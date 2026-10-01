// Structural visual regressions only, NOT pixel-identical acceptance of B01.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SOURCED_ICONS } from '../docs/flows/auth-session/sourced-icons.mjs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const app = read('../docs/flows/auth-session/app.mjs');

test('confirmation actions have distinct sourced chevron, play and logout icons', () => {
  const markup = app.slice(app.indexOf('function confirmation('), app.indexOf('function render('));
  assert.equal((markup.match(/icon\('chevron-right'/g) || []).length, 2);
  assert.match(markup, /icon\('circle-play'\)/);
  assert.match(markup, /icon\('log-out'\)/);
  assert.doesNotMatch(markup, /icon\('arrow'/);
});
test('login uses user, eye and shield-check shapes rather than unrelated glyphs', () => {
  const markup = app.slice(app.indexOf('function login('), app.indexOf('function confirmation('));
  for (const name of ['user', 'eye', 'shield-check']) assert.ok(markup.includes(`icon('${name}')`));
  assert.doesNotMatch(markup, /◉/);
});
test('loading label updates cannot delete the new leading play icon', () => {
  assert.match(app, /authMotion\.label\(button\.querySelector\('\.button-label'\),/);
  assert.doesNotMatch(app, /button\.querySelector\('span'\)\.textContent/);
});
test('verified repository icon geometry remains intact and attributed', () => {
  assert.equal(SOURCED_ICONS['chevron-right'], '<path d="m9 18 6-6-6-6"/>');
  assert.match(SOURCED_ICONS['circle-play'], /<circle cx="12" cy="12" r="10"\/>/);
  assert.match(SOURCED_ICONS['log-out'], /M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4/);
  const license = read('../docs/flows/auth-session/ICONS-LICENSE.txt');
  assert.match(license, /2026 Lucide Icons and Contributors/);
  assert.match(license, /Cole Bemis/);
});
test('locked board remains unchanged; auth behavior is covered by executable regressions', () => {
  const files = {
    '../design/01_Main/BOARDS/00_LOCKED_ORIGINALS/01_Dang_nhap_va_Xac_nhan_phien_ORIGINAL.jpg': '260e483a6447af2fb84cd5c1a5c5f5d75bd1a756ec6e37d69e0743aea5bd5853',
  };
  for (const [path, hash] of Object.entries(files)) {
    assert.equal(createHash('sha256').update(readFileSync(new URL(path, import.meta.url))).digest('hex'), hash, path);
  }
});
// P08 is authorized to connect the history hub/shared session fixture. A whole-file
// P01-era hash for flow.js is no longer a valid invariant. Its existing POSTED
// history/state behavior is exercised by warranty-component-history.test.cjs.
