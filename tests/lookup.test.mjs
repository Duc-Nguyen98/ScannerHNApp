import test from 'node:test';
import {queryDateBounds} from '../docs/flows/shared/query-date-policy.mjs';
import assert from 'node:assert/strict';
import {createLookupFixtureAdapter,filterEvents} from '../docs/flows/lookup/fixture-adapter.mjs';
import {createLookupFlow} from '../docs/flows/lookup/lookup-flow.mjs';
import {initialPickerDates,validatePickerDates} from '../docs/flows/history/history-picker.mjs';
const scope={warehouseId:'fixture-hoa-nam',actorId:'fixture-minhanh'};
test('P06 read failure and retry cannot mutate inventory or signed event fixtures',()=>{
 const a=createLookupFixtureAdapter(),id='fixture-item-HN12346',item=a.item(scope,id),history=a.history(scope,id,{});
 assert.equal(a.setScenario('read-error'),true);assert.ok(a.search(scope,{}).error);assert.ok(a.history(scope,id,{}).error);assert.deepEqual(a.item(scope,id),item);
 a.retryRead();assert.deepEqual(a.history(scope,id,{}),history);assert.deepEqual(a.item(scope,id),item);
});
test('P06 reuses P08 draft/validation semantics without committing picker draft',()=>{
 const filters={type:'warranty',from:'2026-09-01',to:'2026-09-09'};
 const draft=initialPickerDates(filters,'2026-09-29',new Date('2026-09-29T06:00:00Z'));draft.from='10/09/2026';
 assert.equal(filters.from,'2026-09-01');const check=validatePickerDates(draft,'filter',{min:'2026-07-01',max:'2026-09-29'});assert.ok(check.errors.from);assert.ok(check.errors.to);
});
const state=()=>({previewReady:true,session:{actor:{id:scope.actorId},warehouse:{id:scope.warehouseId,active:true},permissions:{warehouseOperations:true},role:'Admin'}});
test('A01 independent code/name/SKU/serial search, scope, aggregate counts and immutable clear',()=>{
 const a=createLookupFixtureAdapter();
 for(const q of ['HN12346','420B (Đen)','XP-420B-BK'])assert.equal(a.search(scope,{query:q}).items[0].code,'HN12346');
 assert.equal(a.search(scope,{category:'components',query:'SN-LK-0001'}).items[0].sku,'LK-0001');
 assert.equal(a.search(scope,{query:'SN-LK-0001'}).items.length,0);
 assert.equal(a.search({...scope,warehouseId:'other'},{}).items.length,0);
 assert.equal(a.search(scope,{query:'not-found'}).items.length,0);
 const all=a.search(scope,{});assert.equal(all.items.length,5);assert.equal(all.totals.products,128);
 all.items[0].name='mutated';assert.notEqual(a.search(scope,{}).items[0].name,'mutated');
});
test('A02 stock uses supplied totals with 12/10/1/1 and 6+3+2+1 positions',()=>{
 const item=createLookupFixtureAdapter().item(scope,'fixture-item-HN12345');
 assert.deepEqual(item.stock,{total:12,available:10,held:1,unavailable:1});
 assert.deepEqual(item.locations.map(l=>l.total),[6,3,2,1]);
 for(const key of Object.keys(item.stock))assert.equal(item.locations.reduce((n,l)=>n+l[key],0),item.stock[key]);
});
test('A03 real zero distinct from missing, SKU never substitutes serial',()=>{
 const a=createLookupFixtureAdapter({scenario:'missing'});assert.equal(a.item(scope,'fixture-item-HN12349').stock.total,0);
 assert.equal(a.item(scope,'fixture-component-01').stock.total,null);
 assert.equal(a.item(scope,'fixture-item-HN12345').serial,null);
 assert.equal(a.item(scope,'fixture-item-HN12347').stock.held,null);
});
test('A04 print and warranty fail closed regardless of role, even if print capability true no implementation',()=>{
 for(const capabilities of [{},{print:false,warranty:false},{print:true,warranty:true}]) {
  const f=createLookupFlow({adapter:createLookupFixtureAdapter({capabilities}),getState:state});f.open('fixture-item-HN12345');
  assert.equal(f.action('print').kind,'blocked');
  assert.equal(f.action('warranty').kind,capabilities.warranty===true?'pending':'blocked');
 }
});
test('A05 inclusive type/range, invalid range and signed events independent of current stock',()=>{
 const a=createLookupFixtureAdapter();const all=a.history(scope,'fixture-item-HN12345',{}).items;
 assert.equal(all.length,7);assert.deepEqual(all.map(e=>e.quantity),[20,-5,-1,10,-2,-1,15]);
 const result=a.history(scope,'fixture-item-HN12345',{type:'inbound',from:'2026-09-01',to:'2026-09-05'});
 assert.deepEqual(result.items.map(e=>e.quantity),[10,15]);
 assert.ok(filterEvents(all,{from:'2026-09-09',to:'2026-09-01'}).error);
 const sample=[{type:'warranty',date:'2026-09-01',quantity:2},{type:'warranty',date:'2026-09-02',quantity:0},{type:'warranty',date:'2026-09-03',quantity:-1}];
 assert.deepEqual(filterEvents(sample,{type:'warranty'}).items.map(e=>e.quantity),[2,0,-1]);
});
test('list context/scroll retained on detail and stock/history; IDs cannot open outside scope',()=>{
 const f=createLookupFlow({adapter:createLookupFixtureAdapter(),getState:state});f.search('420');f.rememberScroll(150);f.open('fixture-item-HN12346');f.panel(3);f.panel(4);f.panel(1);
 assert.equal(f.snapshot().query,'420');assert.equal(f.snapshot().listScroll,150);
 f.category('components');assert.equal(f.snapshot().query,'420');assert.equal(f.open('invalid'),false);assert.equal(f.category('__proto__'),false);
});
test('capability-guarded document link identifies exact event and does not invent a matching document',()=>{
 const f=createLookupFlow({adapter:createLookupFixtureAdapter(),getState:state});f.open('fixture-item-HN12345');
 assert.equal(f.action('document','fixture-event-1').kind,'blocked');assert.equal(f.action('document','not-found').kind,'blocked');
 const adapter=createLookupFixtureAdapter();const original=adapter.history;adapter.history=(...args)=>{const r=original(...args);r.items=r.items.map(e=>({...e,canOpenDocument:true}));return r;};
 const allowed=createLookupFlow({adapter,getState:state});allowed.open('fixture-item-HN12345');
 assert.equal(allowed.action('document','fixture-event-1').documentId,'fixture-event-doc-01');
});
test('session revoked hides data and actions; stopped warehouse remains read-only accessible',()=>{
 let s=state();const f=createLookupFlow({adapter:createLookupFixtureAdapter(),getState:()=>s});f.open('fixture-item-HN12345');s.session.warehouse.active=false;
 assert.equal(f.list().items.length,5);assert.equal(f.action('scan').context.itemId,'fixture-item-HN12345');
 s={};assert.equal(f.list().items.length,0);assert.equal(f.item(),null);assert.equal(f.panel(3),false);assert.equal(f.action('scan').kind,'blocked');
});
test('list scan context drops the previously viewed item while preserving query/category',()=>{
 const f=createLookupFlow({adapter:createLookupFixtureAdapter(),getState:state});
 f.open('fixture-item-HN12345');assert.equal(f.action('scan').context.itemId,'fixture-item-HN12345');
 f.panel(1);f.category('components');f.search('SN-LK');
 assert.deepEqual(f.action('scan').context,{...scope,itemId:null,returnTo:'P06',category:'components',query:'SN-LK'});
});
test('invalid or impossible dates keep the committed filters and events; valid correction clears error',()=>{
 const f=createLookupFlow({adapter:createLookupFixtureAdapter(),getState:state});f.open('fixture-item-HN12345');
 const original=f.snapshot().filters,events=f.history().items;
 for(const filters of [{from:'2026-09-10',to:'2026-09-01'},{from:'2026-02-30'},{from:'2026-13-01'},{to:'2026-02-29'},{from:'0000-01-01'}]){
  assert.equal(f.filters(filters),false);assert.deepEqual(f.snapshot().filters,original);assert.deepEqual(f.history().items,events);assert.ok(f.snapshot().message);
 }
 // A valid calendar date can now be outside the approved 90-day picker window.
 assert.equal(f.filters({from:'2024-02-29',to:'2026-09-09'}),false);assert.deepEqual(f.snapshot().filters,original);
 const bounds=queryDateBounds();assert.equal(f.filters({from:bounds.min,to:bounds.max}),true);assert.equal(f.snapshot().message,'');
 assert.equal(f.filters({from:'',to:''}),true);assert.equal(f.history().items.length,7);
});
test('demo fills each catalogue item with coherent locations and distinct scoped history',()=>{
 const a=createLookupFixtureAdapter();const items=[...a.search(scope,{}).items,...a.search(scope,{category:'components'}).items];
 let total=0;const ids=new Set();
 for(const item of items){
  for(const key of ['total','available','held','unavailable'])assert.equal(item.locations.reduce((n,l)=>n+l[key],0),item.stock[key],item.code+' '+key);
  assert.equal(item.stock.total,item.stock.available+item.stock.held+item.stock.unavailable);
  assert.ok(item.images.length);assert.equal(item.images.length,item.imageLabels.length);
  assert.ok(item.description);assert.ok(item.group);assert.ok(item.brand);
  const events=a.history(scope,item.id,{from:'2026-09-01',to:'2026-09-09'}).items;
  assert.ok(events.length>=5);for(const e of events){assert.equal(e.itemId,item.id);assert.equal(e.warehouseId,scope.warehouseId);assert.ok(!ids.has(e.id));ids.add(e.id);assert.equal(e.canOpenDocument,false);}total+=events.length;
 }
 assert.equal(total,36);assert.equal(a.history({...scope,warehouseId:'other'},items[0].id,{}).items.length,0);
 const signed=a.history(scope,'fixture-component-01',{type:'warranty'}).items.map(e=>e.quantity);assert.deepEqual(signed,[-2,1,0]);
 assert.equal(a.item(scope,'fixture-item-HN12349').stock.total,0);assert.equal(a.history(scope,'fixture-item-HN12349',{}).items.length,5);
});
test('missing-data scenario is reversible and does not erase demo inventory or event fixtures',()=>{
 const a=createLookupFixtureAdapter(),id='fixture-component-01',original=a.item(scope,id),events=a.history(scope,id,{});
 assert.equal(original.stock.total,24);assert.equal(a.setScenario('missing'),true);assert.equal(a.item(scope,id).stock.total,null);assert.deepEqual(a.history(scope,id,{}),events);
 a.setScenario('demo');assert.deepEqual(a.item(scope,id),original);assert.equal(a.setScenario('invalid'),false);
});
