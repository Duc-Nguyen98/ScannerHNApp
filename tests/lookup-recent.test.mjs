import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecentLookupItems,resolveLookupSelection} from '../docs/flows/lookup/recent-items.mjs';
import {createLookupFixtureAdapter} from '../docs/flows/lookup/fixture-adapter.mjs';
import {createLookupFlow} from '../docs/flows/lookup/lookup-flow.mjs';

const makeState=()=>({previewReady:true,session:{authSessionId:'session-1',actor:{id:'fixture-minhanh'},warehouse:{id:'fixture-hoa-nam',active:true},permissions:{warehouseOperations:true}}});
const scope={actorId:'fixture-minhanh',warehouseId:'fixture-hoa-nam'};
const item=(id,category='products')=>({id,category,warehouseId:scope.warehouseId,name:'name '+id});

test('recent store is unique MRU max3 and returns current source objects rather than copied values',()=>{
  const state=makeState(),store=createRecentLookupItems({getState:()=>state});
  const items=['one','two','three','four'].map(id=>item(id));for(const row of items)store.remember(row);store.remember(items[1]);
  const current=items.map(row=>({...row,name:'NEW '+row.id,stock:{total:99}}));
  const result=store.items('products',{items:current});assert.deepEqual(result.map(row=>row.id),['two','four','three']);assert.equal(result[0],current[1]);assert.equal(result[0].stock.total,99);
});
test('categories stay separate; invalid category/id/warehouse cannot be remembered or substituted',()=>{
  const state=makeState(),store=createRecentLookupItems({getState:()=>state}),product=item('same'),component=item('same','components');
  store.remember(product);store.remember(component);assert.equal(store.remember({...product,warehouseId:'other'}),false);assert.equal(store.remember({...product,id:''}),false);assert.equal(store.remember({...product,category:'__proto__'}),false);
  assert.deepEqual(store.items('products',{items:[component]}),[]);assert.deepEqual(store.items('components',{items:[product,component]}),[component]);
});
test('read error and removed source rows hide entries without turning failure into deletion or using stale data',()=>{
  const state=makeState(),store=createRecentLookupItems({getState:()=>state}),row=item('a');store.remember(row);
  assert.deepEqual(store.items('products',{error:'offline',items:[row]}),[]);assert.deepEqual(store.items('products',{items:[]}),[]);assert.deepEqual(store.items('products',{items:[row]}),[row]);
});
test('actor, warehouse, auth session, logout, denial and explicit clear all invalidate previous IDs',()=>{
  for(const change of [s=>{s.session.actor.id='other';},s=>{s.session.warehouse.id='other';},s=>{s.session.authSessionId='session-2';},s=>{s.session=null;},s=>{s.previewReady=false;},s=>{s.session.permissions.warehouseOperations=false;}]){
    let state=makeState();const store=createRecentLookupItems({getState:()=>state}),row=item('a');store.remember(row);change(state);assert.deepEqual(store.items('products',{items:[row]}),[]);state=makeState();assert.deepEqual(store.items('products',{items:[row]}),[]);
  }
  const store=createRecentLookupItems({getState:makeState}),row=item('a');store.remember(row);store.clear();assert.deepEqual(store.items('products',{items:[row]}),[]);
});
test('missing auth session is never treated as an authorized durable recent scope',()=>{
  const state=makeState();delete state.session.authSessionId;const store=createRecentLookupItems({getState:()=>state});assert.equal(store.remember(item('a')),false);assert.deepEqual(store.items('products',{items:[item('a')]}),[]);
});
test('selection rereads list and exact item; names/SKUs/codes never substitute ID',()=>{
  const row=item('raw-"<& id'),calls=[],adapter={search(s,query){calls.push(['list',s,query]);return {items:[row]};},item(s,id){calls.push(['item',s,id]);return {...row,name:'updated'};}};
  const result=resolveLookupSelection({adapter,scope,category:'products',id:row.id});assert.equal(result.kind,'item');assert.equal(result.item.name,'updated');assert.equal(result.item.id,row.id);assert.deepEqual(calls.map(x=>x[0]),['list','item']);assert.deepEqual(calls[0][2],{category:'products',query:''});assert.equal(resolveLookupSelection({adapter,scope,category:'products',id:row.name}).kind,'missing');
});
test('selection rejects source unavailable, thrown read, deleted detail and scope/category mismatch',()=>{
  const row=item('a');for(const adapter of [{search:()=>({error:'offline',items:[row]}),item:()=>row},{search:()=>{throw Error('offline');},item:()=>row}])assert.equal(resolveLookupSelection({adapter,scope,category:'products',id:'a'}).kind,'unavailable');
  for(const final of [null,{...row,id:'other'},{...row,warehouseId:'other'},{...row,category:'components'}])assert.equal(resolveLookupSelection({adapter:{search:()=>({items:[row]}),item:()=>final},scope,category:'products',id:'a'}).kind,'missing');
  assert.equal(resolveLookupSelection({adapter:{},scope:null,category:'products',id:'a'}).kind,'blocked');
});
test('flow default All dates and selection source guard preserve current query/category/scroll on failure',()=>{
  const state=makeState(),adapter=createLookupFixtureAdapter(),flow=createLookupFlow({adapter,getState:()=>state});assert.deepEqual(flow.snapshot().filters,{type:'all',from:'',to:''});flow.search('HN12346');flow.rememberScroll(125);assert.equal(flow.select('fixture-item-HN12346').kind,'item');flow.search('');assert.equal(flow.recentItems(flow.list()).length,1);flow.search('HN12346');flow.rememberScroll(125);const before=flow.snapshot();adapter.setScenario('read-error');assert.equal(flow.select('fixture-item-HN12346').kind,'unavailable');assert.deepEqual(flow.snapshot(),before);assert.deepEqual(flow.recentItems(flow.list()),[]);adapter.retryRead();assert.equal(flow.select('fixture-item-HN12346').kind,'item');assert.deepEqual(flow.snapshot(),before);
});
test('direct deep-link open also rejects unavailable or deleted current source and keeps prior state',()=>{
  const state=makeState(),adapter=createLookupFixtureAdapter(),flow=createLookupFlow({adapter,getState:()=>state});flow.open('fixture-item-HN12345');const before=flow.snapshot();adapter.setScenario('read-error');assert.equal(flow.open('fixture-item-HN12346'),false);assert.deepEqual(flow.snapshot(),before);adapter.retryRead();adapter.search=()=>({items:[]});assert.equal(flow.open('fixture-item-HN12346'),false);assert.deepEqual(flow.snapshot(),before);adapter.item=()=>{throw Error('offline');};assert.equal(flow.open('fixture-item-HN12346'),false);assert.deepEqual(flow.snapshot(),before);
});
