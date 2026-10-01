import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Approved operation palette is centralized and shared by app/history/embedded entrypoints',()=>{
 const palette=read('docs/flows/shared/operation-icons.css'),history=read('docs/flows/history/category-colors.css');
 for(const key of ['inbound','outbound','warranty','nfc','documents','sessions']){
  assert.match(palette,new RegExp('--hn-op-'+key+'-ink:#[0-9a-f]{6}'));
  assert.match(palette,new RegExp('data-history-tone="'+key+'"'));
 }
 for(const color of ['#0d6b60','#225fa2','#95601a','#7550a2','#466279','#4e5da8'])assert.ok(palette.includes(color)&&!history.includes(color));
 for(const p of ['docs/flows/auth-session/index.html','docs/flows/warranty-components/index.html'])assert.ok(read(p).includes('shared/operation-icons.css'));
 assert.doesNotMatch(palette,/\.p08-chip|\.hn-label|\.p07-artwork|\.hn-logo/);
});
test('Future contributors are directed to the approved design standard and reusable variants',()=>{
 assert.ok(read('AGENTS.md').includes('shared/UI_STANDARD.md'));
 const guide=read('docs/flows/shared/UI_STANDARD.md');
 assert.ok(guide.includes('data-hn-operation'));assert.ok(guide.includes('operation-icons.css'));
 const palette=read('docs/flows/shared/operation-icons.css');
 for(const variant of ['sm','md','lg'])assert.ok(palette.includes('data-size="'+variant+'"'));
});
