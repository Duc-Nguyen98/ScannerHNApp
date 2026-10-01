import test from 'node:test';
import assert from 'node:assert/strict';
import {createLookupReadOwner} from '../docs/flows/lookup/read-owner.mjs';
const result=id=>({items:[{id}],totals:{products:128}});
test('late A cannot commit after B; cancellation belongs to read owner',async()=>{
 const accepted=[];const owner=createLookupReadOwner({onCommit:(kind,key,data)=>accepted.push([key,data.items[0].id])});let a,b,signal;
 owner.read('list','A',s=>{signal=s;return new Promise(r=>a=r);});owner.read('list','B',()=>new Promise(r=>b=r));assert.equal(signal.aborted,true);
 b(result('B'));await Promise.resolve();a(result('A'));await Promise.resolve();assert.deepEqual(accepted,[['B','B']]);assert.deepEqual(owner.read('list','B',()=>{throw Error('duplicate read');}).items,[{id:'B'}]);
});
test('sync fixture remains synchronous and repeated render reads are deduplicated',()=>{
 const owner=createLookupReadOwner();let calls=0;const load=()=>{calls++;return result('item');};assert.equal(owner.read('list','key',load).items[0].id,'item');owner.read('list','key',load);assert.equal(calls,1);
});
test('error retains only the same scoped query cache, never another result set',()=>{
 const owner=createLookupReadOwner();owner.read('list','actor/kho/A',()=>result('A'));owner.invalidate();const error=owner.read('list','actor/kho/A',()=>({error:'offline',items:[]}));assert.equal(error.items[0].id,'A');assert.equal(error.stale,true);
 const other=owner.read('list','other/kho/A',()=>({error:'offline',items:[]}));assert.deepEqual(other.items,[]);assert.equal(other.stale,false);
});
test('hide/dispose ignore late read and reject malformed payload without throwing',async()=>{
 let resolve;const commits=[];const owner=createLookupReadOwner({onCommit:()=>commits.push(true)});owner.read('history','one',()=>new Promise(r=>resolve=r));owner.cancel();resolve(result('late'));await Promise.resolve();assert.deepEqual(commits,[]);
 assert.ok(owner.read('list','malformed',()=>({items:null})).error);owner.dispose();assert.ok(owner.read('list','gone',()=>result('gone')).error);
});
