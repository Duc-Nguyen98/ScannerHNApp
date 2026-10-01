import test from 'node:test';
import assert from 'node:assert/strict';
import {createDataRead,listDataState} from '../docs/flows/data-states/model.mjs';
import {dataStateView} from '../docs/flows/data-states/view.mjs';
const context=(q='',actor='a')=>({scope:{actor,warehouse:'hn'},filters:{q,type:'all',status:'all',from:'',to:'',sort:'desc'}});
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
test('A01 delay, empty success, filtered empty, reject and null remain distinct',async()=>{
 let next=deferred();const flow=createDataRead({read:()=>next.promise});const work=flow.load(context());assert.equal(listDataState(flow.snapshot(),[]),'loading');next.resolve([]);assert.equal(await work,true);assert.equal(listDataState(flow.snapshot(),[]),'empty');
 next=deferred();const p=flow.load(context('PN'));next.resolve([{id:'one'}]);await p;assert.equal(listDataState(flow.snapshot(),[]),'no-results');assert.equal(listDataState(flow.snapshot(),[{id:'one'}]),'ready');
 next=deferred();const e=flow.load(context('other'));next.reject(Error('network'));await e;assert.equal(listDataState(flow.snapshot(),[]),'error');assert.equal(flow.snapshot().rows,null);
 next=deferred();const n=flow.load(context());next.resolve(null);await n;assert.equal(flow.snapshot().status,'error');flow.dispose();
});
test('A02 pending retry is single-flight and preserves full filters',async()=>{
 let count=0,captured;const d=deferred(),flow=createDataRead({read:c=>{captured=c;count++;return d.promise;}}),c=context('PN');c.filters.from='2026-09-01';c.filters.type='inbound';
 const p=flow.load(c),p2=flow.load(c);assert.equal(p,p2);assert.equal(count,1);assert.deepEqual(captured.filters,c.filters);d.resolve([]);await p;flow.dispose();
});
test('A04 late success and late failure cannot replace newest query',async()=>{
 const calls=[];const flow=createDataRead({read:c=>{const d=deferred();calls.push({c,d});return d.promise;}});
 const a=flow.load(context('A')),b=flow.load(context('B'));assert.equal(await a,false);assert.equal(calls[0].c.signal.aborted,true);calls[1].d.resolve([{id:'B'}]);await b;calls[0].d.resolve([{id:'A'}]);await Promise.resolve();assert.deepEqual(flow.snapshot().rows,[{id:'B'}]);
 const c=flow.load(context('C')),d=flow.load(context('D'));calls[3].d.resolve([{id:'D'}]);await d;calls[2].d.reject(Error('late'));await c;await Promise.resolve();assert.deepEqual(flow.snapshot().rows,[{id:'D'}]);flow.dispose();
});
test('stale cache only survives the same scope and query; errors never become empty',async()=>{
 let fail=false;const flow=createDataRead({read:()=>{if(fail)throw Error('fail');return [{id:'old'}];}});await flow.load(context());fail=true;await flow.load(context());assert.equal(listDataState(flow.snapshot(),[{id:'old'}]),'stale');await flow.load(context('changed'));assert.equal(flow.snapshot().rows,null);await flow.load(context('','new-actor'));assert.equal(flow.snapshot().rows,null);flow.dispose();
});
test('cancel/dispose ignores completion and does not leak session rows',async()=>{
 const d=deferred();let changes=0;const flow=createDataRead({read:()=>d.promise,onChange:()=>changes++});const p=flow.load(context());flow.dispose();d.resolve([{id:'secret'}]);await p;await Promise.resolve();assert.equal(changes,1);assert.equal(flow.snapshot().rows,null);assert.equal(await flow.load(context()),false);
});
test('timeout ends loading; retry can recover with a new read',async()=>{
 let hang=true;const flow=createDataRead({read:()=>hang?new Promise(()=>{}):[],timeoutMs:10});assert.equal(await flow.load(context()),false);assert.equal(flow.snapshot().status,'error');assert.equal(flow.snapshot().error.kind,'timeout');hang=false;await flow.load(context());assert.equal(flow.snapshot().status,'ready');flow.dispose();
});
test('A05 readonly empty has no create and all four states expose status semantics',()=>{
 assert.ok(!dataStateView({kind:'empty'}).includes('data-p12="create"'));assert.ok(dataStateView({kind:'empty',canCreate:true}).includes('data-p12="create"'));
 for(const kind of ['loading','empty','no-results','error'])assert.match(dataStateView({kind}),/role="status"/);
 assert.ok(!dataStateView({kind:'error'}).includes('HN-ERR-01'));assert.match(dataStateView({kind:'error',errorCode:'SOURCE-42'}),/SOURCE-42/);
 assert.ok(!dataStateView({kind:'no-results',query:'<img src=x>'}).includes('<img'));assert.match(dataStateView({kind:'no-results',query:'<img src=x>'}),/&lt;img/);
});
test('invalid array response and thrown non-error values cannot signal empty success',async()=>{
 for(const value of [undefined,{},[null],[{}]]){const flow=createDataRead({read:()=>value});await flow.load(context());assert.equal(flow.snapshot().status,'error');flow.dispose();}
});
