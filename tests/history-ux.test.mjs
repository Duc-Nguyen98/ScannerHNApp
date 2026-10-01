import test from 'node:test';
import assert from 'node:assert/strict';
import {quickHistoryRange,relaxHistoryFilters,historyContextKey} from '../docs/flows/history/history-ux.mjs';
import {initialFilters} from '../docs/flows/history/history-model.mjs';
import {queryDateBounds,dateAllowed} from '../docs/flows/shared/query-date-policy.mjs';
import {historyControls} from '../docs/flows/history/history-controls.mjs';

test('Quick ranges contain exactly N calendar days inclusive; respect Vietnam midnight/leap/year and90-day window',()=>{
 for(const instant of ['2026-09-29T05:00:00Z','2026-12-31T17:01:00Z','2024-03-01T05:00:00Z']){
  const now=new Date(instant),bounds=queryDateBounds(now);
  for(const n of [1,7,30,90]){const r=quickHistoryRange(n,now);assert.equal(r.to,bounds.max);assert.ok(dateAllowed(r.from,bounds));assert.equal((Date.parse(r.to)-Date.parse(r.from))/86400000+1,n);}
 }
 assert.throws(()=>quickHistoryRange(91),RangeError);
});
test('Remove refinements retains selected operation, document scope and sort without mutating committed object',()=>{
 const f={...initialFilters('documents'),type:'inbound',q:'x',from:'2026-09-01',to:'2026-09-29',status:'waiting',sort:'desc'};
 assert.deepEqual(relaxHistoryFilters(f),{...f,q:'',from:'',to:'',status:'all'});assert.equal(f.q,'x');
});
test('All6 list memory keys are distinct; daily cannot overwrite general or documents',()=>{
 const keys=[historyContextKey(1,'','all'),historyContextKey(1,'','documents'),historyContextKey(4,'','all'),...['nfc','warranty','sessions'].map(b=>historyContextKey(1,b,'all'))];assert.equal(new Set(keys).size,6);
});
test('Active filter indicator is accessible and history-scoped; P12 remains opt-out',()=>{
 const args={filters:{...initialFilters(),status:'waiting'},tabs:[],statuses:{waiting:'Chờ xử lý trên Web'},count:1,icon:()=>''};
 assert.match(historyControls(args),/data-filter-active="true"/);assert.match(historyControls(args),/đang áp dụng/);
 assert.doesNotMatch(historyControls({...args,namespace:'p12'}),/data-filter-active/);
 assert.doesNotMatch(historyControls({...args,filters:initialFilters()}),/data-filter-active/);
});
