import test from 'node:test';
import assert from 'node:assert/strict';
import {createNfcFixtureAdapter,BOARD_PRODUCT} from '../docs/flows/nfc/fixture-adapter.mjs';
import {createNfcFlow} from '../docs/flows/nfc/nfc-flow.mjs';
const state=()=>({previewReady:true,session:{actor:{id:'fixture-minhanh',name:'Minh Anh',role:'Nhân viên kho'},warehouse:{id:'fixture-hoa-nam',name:'Kho Hoa Nam',active:true},permissions:{warehouseOperations:true}}});
function setup(options={}){let current=state();const adapter=createNfcFixtureAdapter({delay:1,...options}),flow=createNfcFlow({adapter,getState:()=>current});return {adapter,flow,current,setState:s=>current=s};}
async function verify(f){f.begin();await f.read();assert.equal(f.next(),true);}
test('P07.A01 unread and unsupported are gated without device calls',async()=>{const {flow:f,adapter:a}=setup({scenario:'unsupported'});f.begin();assert.equal(f.canContinue(),false);await f.read();assert.equal(a.stats().reads,0);assert.equal(f.snapshot().dependency.reason,'nfc-unsupported');assert.equal(f.canContinue(),false);assert.equal(f.next(),false);assert.equal(a.stats().mutations,0);});
test('P07.A02 reading and prepare never create a mapping or receipt',async()=>{const {flow:f,adapter:a}=setup();await verify(f);assert.equal(a.mapping(f.scope(),'NFC-8A2F'),null);assert.equal(a.stats().mutations,0);assert.equal(f.snapshot().receipt,null);assert.equal(f.panel(4),false);});
test('P07.A03 conflict preserves current mapping and provides P17.S03 context',async()=>{const {flow:f,adapter:a}=setup({scenario:'conflict'});f.begin();await f.read();const before=a.mapping(f.scope(),f.snapshot().read.uid);assert.equal(f.next(),false);assert.equal(f.snapshot().dependency.panel,'P17.S03');assert.equal(await f.confirm(),false);assert.deepEqual(a.mapping(f.scope(),before.uid),before);assert.equal(a.stats().mutations,0);});
test('P07.A04 duplicate confirm yields one confirmed mapping and same tag detail/list',async()=>{const {flow:f,adapter:a}=setup({delay:10});await verify(f);await Promise.all([f.confirm(),f.confirm(),f.confirm()]);const s=f.snapshot();assert.equal(s.panel,4);assert.equal(a.stats().mutations,1);assert.equal(s.receipt.actor.name,'Minh Anh');assert.equal(f.detail(s.receipt.tagId).uid,s.receipt.uid);assert.equal(f.list().items.find(t=>t.id===s.receipt.tagId).product.id,s.receipt.itemId);await f.confirm();assert.equal(a.stats().mutations,1);});
test('UNKNOWN preserves request and blocks blind retry; reconcile uses same receipt',async()=>{const {flow:f,adapter:a}=setup({scenario:'unknown'});await verify(f);await f.confirm();const s=f.snapshot();assert.equal(s.unknown,true);assert.equal(s.receipt,null);assert.equal(s.panel,3);assert.equal(a.stats().mutations,1);assert.equal(await f.confirm(),false);assert.equal(f.select('fixture-item-HN12346'),false);f.panel(1);f.begin();assert.deepEqual(f.snapshot().request,s.request);await f.reconcile();assert.equal(f.snapshot().panel,4);assert.equal(f.snapshot().receipt.requestId,s.request.requestId);assert.equal(a.stats().mutations,1);});
test('Known failure retry retains request; fresh successful attempt resets read and identity',async()=>{const {flow:f,adapter:a}=setup({scenario:'failed'});await verify(f);await f.confirm();const id=f.snapshot().request.requestId;assert.equal(f.snapshot().unknown,false);a.setScenario('ready');await f.confirm();assert.equal(f.snapshot().receipt.requestId,id);f.panel(1);f.begin();assert.equal(f.snapshot().receipt,null);assert.equal(f.snapshot().read,null);await f.read();f.next();await f.confirm();assert.notEqual(f.snapshot().request.requestId,id);assert.equal(f.snapshot().receipt.uid,'NFC-DEMO-020');assert.equal(a.stats().mutations,2);});
test('read permission, unsupported, read error and locked are distinct',async()=>{for(const [scenario,reason] of [['permission','nfc-permission-denied'],['read-error','nfc-read-error']]){const {flow:f}=setup({scenario});f.begin();await f.read();assert.equal(f.snapshot().dependency.reason,reason);assert.equal(f.canContinue(),false);}const {flow:f,adapter:a}=setup({scenario:'locked'});f.begin();await f.read();assert.equal(f.next(),false);assert.equal(f.snapshot().dependency.reason,'tag-locked');assert.equal(a.stats().mutations,0);});
test('warehouse stop and capability denial gate handlers, keep UID/session',async()=>{const {flow:f,adapter:a,current}=setup();await verify(f);const uid=f.snapshot().read.uid;current.session.warehouse.active=false;assert.equal(await f.confirm(),false);assert.equal(f.snapshot().read.uid,uid);assert.equal(a.stats().mutations,0);current.session.warehouse.active=true;a.setScenario('link-denied');assert.equal(await f.confirm(),false);assert.equal(a.stats().mutations,0);});
test('P06 product selection carries exact independent fields and clears old UID',async()=>{const {flow:f}=setup();await verify(f);assert.equal(f.select('fixture-item-HN12345'),true);assert.equal(f.product().serial,null);assert.equal(f.product().code,'HN12345');assert.equal(f.snapshot().read,null);assert.equal(f.select('fixture-item-HN12346'),true);assert.equal(f.product().serial,'SN-XP420B-BK-0008');assert.equal(f.select('unverified'),false);assert.equal(f.snapshot().itemId,'fixture-item-HN12346');});
test('adapter search status and counts remain separate; no audit inferred from current tags',()=>{const {flow:f}=setup();assert.deepEqual(f.list().counts,{all:8,linked:5,unlinked:2});assert.equal(f.list().items.length,5);for(const q of ['TAG-002','NFC-3F7D9A','PAPER-80','Đầu in']){f.search(q);assert.equal(f.list().items.length,1);}f.search('');f.tab('unlinked');assert.equal(f.list().items.length,2);f.tab('other');assert.equal(f.snapshot().tab,'unlinked');assert.equal(f.list().items[0].events,undefined);assert.equal(f.detail('missing'),null);});
test('invalid/expired scope hides data and late receipt cannot revive disposed flow',async()=>{const t=setup({delay:20});await verify(t.flow);const pending=t.flow.confirm();t.flow.dispose();await pending;assert.equal(t.flow.snapshot().receipt,null);assert.equal(t.flow.list().items.length,0);const next=setup();next.setState({});assert.equal(next.flow.begin(),false);assert.equal(next.flow.list().items.length,0);assert.equal(next.flow.select(BOARD_PRODUCT.id),false);});
test('receipt must match UID/item/actor/warehouse/request; prepare or malformed cannot succeed',async()=>{for(const response of [{kind:'prepare'},{kind:'fixture-confirmed',namespace:'hn-scanner-nfc-fixture-v1',tagId:'wrong'}]){const a=createNfcFixtureAdapter({delay:0});a.link=async()=>response;const f=createNfcFlow({adapter:a,getState:state});await verify(f);await f.confirm();assert.equal(f.snapshot().receipt,null);assert.equal(f.snapshot().unknown,true);}});
test('five consecutive links keep product and create distinct requests, preserve existing tag IDs/labels',async()=>{
 const {flow:f,adapter:a}=setup({extended:true});const ids=[],uids=[];
 f.begin();f.select('fixture-item-HN12346');
 for(let i=0;i<5;i++){
  assert.equal(f.product().id,'fixture-item-HN12346');assert.equal(f.snapshot().read,null);
  await f.read();assert.equal(f.next(),true);assert.equal(await f.confirm(),true);
  const r=f.snapshot().receipt;ids.push(r.requestId);uids.push(r.uid);
  assert.equal(f.detail(r.tagId).uid,r.uid);assert.equal(f.detail(r.tagId).product.id,r.itemId);
  if(i>0)assert.equal(f.detail(r.tagId).label,`TAG-0${19+i}`);
  f.begin();
 }
 assert.equal(new Set(ids).size,5);assert.equal(new Set(uids).size,5);assert.equal(a.stats().mutations,5);
 assert.deepEqual(f.list().counts,{all:31,linked:21,unlinked:5});assert.match(f.snapshot().message,/cả 5 thẻ/);
 await f.read();assert.equal(f.next(),false);assert.match(f.snapshot().message,/đã liên kết/);assert.equal(a.stats().mutations,5);
});
test('changing demo UID invalidates prior read; busy/UNKNOWN cannot change it or product',async()=>{
 const {flow:f,adapter:a}=setup({delay:10,scenario:'unknown'});f.begin();await f.read();
 assert.equal(f.selectReadTag('NFC-DEMO-021'),true);assert.equal(f.snapshot().read,null);assert.equal(f.canContinue(),false);
 assert.equal(f.selectReadTag('not-allowed'),false);const reading=f.read();assert.equal(f.selectReadTag('NFC-DEMO-020'),false);await reading;
 assert.equal(f.snapshot().read.uid,'NFC-DEMO-021');f.next();const saving=f.confirm();assert.equal(f.selectReadTag('NFC-DEMO-020'),false);await saving;
 const request=f.snapshot().request;assert.equal(f.snapshot().unknown,true);assert.equal(f.selectReadTag('NFC-DEMO-020'),false);
 f.panel(1);f.begin();assert.equal(f.snapshot().panel,3);assert.deepEqual(f.snapshot().request,request);assert.equal(f.panel(3),true);
 await f.reconcile();assert.equal(f.snapshot().receipt.uid,'NFC-DEMO-021');assert.equal(a.stats().mutations,1);
});
test('scenario change at read step invalidates old UID; linked tag never fabricates a fresh success',async()=>{
 const {flow:f,adapter:a}=setup();await verify(f);await f.confirm();f.begin();
 f.selectReadTag('NFC-8A2F');await f.read();assert.equal(f.next(),false);assert.equal(f.snapshot().receipt,null);
 assert.equal(a.stats().mutations,1);a.setScenario('permission');f.scenarioChanged();assert.equal(f.snapshot().read,null);assert.equal(f.canContinue(),false);
 await f.read();assert.equal(f.snapshot().dependency.reason,'nfc-permission-denied');
});

test('UNKNOWN terminal reconciliation unlocks recovery without discarding the request',async()=>{
 for(const kind of ['failed','denied','conflict','locked','already-linked']){
  const {flow:f,adapter:a}=setup();a.link=async()=>({kind:'unknown'});await verify(f);await f.confirm();const request=f.snapshot().request;
  a.reconcile=async()=>({kind});await f.reconcile();assert.equal(f.snapshot().unknown,false,kind);assert.deepEqual(f.snapshot().request,request);
  assert.equal(f.panel(2),true);assert.equal(f.selectReadTag('NFC-DEMO-020'),true);
 }
});

test('known failure retries same request in place; begin from list creates a fresh attempt',async()=>{
 const {flow:f,adapter:a}=setup({scenario:'failed'});await verify(f);await f.confirm();const previous=f.snapshot().request.requestId;
 f.panel(1);f.begin();assert.equal(f.snapshot().read,null);assert.equal(f.snapshot().request,null);
 a.setScenario('ready');await f.read();f.next();await f.confirm();assert.notEqual(f.snapshot().receipt.requestId,previous);
});

test('late confirmation preserves list navigation and confirms mapping without stealing screen',async()=>{
 const {flow:f,adapter:a}=setup({delay:15});await verify(f);const pending=f.confirm();f.panel(1);await pending;
 assert.equal(f.snapshot().panel,1);assert.ok(f.snapshot().receipt);assert.equal(a.stats().mutations,1);
});

test('UNKNOWN can be reconciled while warehouse writes are stopped',async()=>{
 const {flow:f,current}=setup({scenario:'unknown'});await verify(f);await f.confirm();current.session.warehouse.active=false;
 assert.equal(await f.reconcile(),true);assert.equal(f.snapshot().panel,4);
});

test('receipt nested actor mismatch is UNKNOWN; late reconciliation cannot clear a changed session',async()=>{
 const t=setup();const link=t.adapter.link;t.adapter.link=async(...args)=>({...await link(...args),actor:{id:'wrong'}});
 await verify(t.flow);await t.flow.confirm();assert.equal(t.flow.snapshot().unknown,true);
 let finish;t.adapter.reconcile=()=>new Promise(resolve=>finish=resolve);const pending=t.flow.reconcile();t.current.session.actor.id='different';finish({kind:'failed'});await pending;
 assert.equal(t.flow.snapshot().unknown,true);assert.equal(t.flow.snapshot().receipt,null);
});

test('NFC search accepts product code and uppercase Vietnamese Đ',()=>{
 const {flow:f}=setup();f.search('HN12345');assert.ok(f.list().items.some(t=>t.id==='fixture-tag-001'));assert.ok(f.list().items.every(t=>t.product.code==='HN12345')); 
 f.search('ĐẦU IN');assert.equal(f.list().items.length,1);assert.equal(f.list().items[0].label,'TAG-003');
});

test('Clear NFC filters is atomic, read-only and session guarded',()=>{
 const t=setup();t.flow.search('missing');t.flow.tab('linked');
 const prior=t.flow.snapshot();assert.equal(t.flow.resetFilters(),true);
 assert.equal(t.flow.snapshot().query,'');assert.equal(t.flow.snapshot().tab,'all');
 assert.equal(t.flow.snapshot().selectedUid,prior.selectedUid);assert.equal(t.flow.snapshot().itemId,prior.itemId);
 assert.deepEqual(t.adapter.stats(),{reads:0,mutations:0});
 t.setState({});assert.equal(t.flow.resetFilters(),false);
});

test('M07 listening comes from adapter; stop read aborts and late UID cannot revive a session',async()=>{
 const {flow:f,adapter:a}=setup({delay:30});f.begin();const pending=f.read();
 assert.equal(f.snapshot().listening,true);assert.equal(f.stopRead(),true);await pending;
 assert.equal(f.snapshot().busy,false);assert.equal(f.snapshot().listening,false);assert.equal(f.snapshot().read,null);assert.equal(a.stats().mutations,0);
 await f.read();assert.ok(f.snapshot().read);assert.equal(f.snapshot().listening,false);
});

test('M07 permission rejection is never listening and cancelling feedback cannot cancel a write',async()=>{
 const {flow:f,adapter:a}=setup({delay:5,scenario:'permission'});f.begin();const read=f.read();assert.equal(f.snapshot().listening,false);await read;
 a.setScenario('ready');await f.read();f.next();const write=f.confirm();assert.equal(f.stopRead(),false);await write;assert.ok(f.snapshot().receipt);assert.equal(a.stats().mutations,1);
});

test('M07 late read callback after cancellation cannot create mapping or restore UID',async()=>{
 const {flow:f,adapter:a}=setup();let finish;
 a.read=async(_s,_uid,{onListening})=>{onListening(true);await new Promise(r=>finish=r);onListening(false);return {kind:'fixture-read',uid:'late',tagId:'late',readAt:'late',warehouseId:'fixture-hoa-nam'};};
 f.begin();const pending=f.read();f.stopRead();finish();await pending;
 assert.equal(f.snapshot().read,null);assert.equal(f.snapshot().listening,false);assert.equal(f.canContinue(),false);assert.equal(a.stats().mutations,0);
});
