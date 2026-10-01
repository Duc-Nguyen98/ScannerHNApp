import test from 'node:test';
import assert from 'node:assert/strict';
import { createInboundFlow } from '../docs/flows/inbound/inbound-flow.mjs';
import { createInboundFixtureAdapter } from '../docs/flows/inbound/fixture-adapter.mjs';
import { INBOUND_TYPES, INBOUND_SUPPLIERS, matchesOption } from '../docs/flows/inbound/catalogue.mjs';
import {scanListView,skuGroups} from '../docs/flows/inbound/scan-view.mjs';
import {recordedDocuments} from '../docs/flows/documents/document-model.mjs';
function setup(options = {}) {
  let auth = { previewReady: true, session: { actor: { id:'a', name:'Minh Anh', role:'Nhân viên kho' }, warehouse: { id:'w', name:'Kho Hoa Nam', active:true }, permissions:{ warehouseOperations:true } } };
  const adapter = options.adapter || createInboundFixtureAdapter({ delay:0 });
  let stopped = 0;
  const flow = createInboundFlow({ adapter, getState:() => auth, onStopped:() => stopped++, timeoutMs: options.timeoutMs || 20 });
  flow.start();
  return { flow, adapter, auth, stopped:() => stopped, ready() { flow.next(); flow.fixtureBatch(); flow.next(); } };
}
test('P04.A01 12 attempts = 11 valid + 1 duplicate, 5+4+2 quantities; manual same pipeline', () => {
  const {flow, adapter} = setup(); flow.next(); flow.fixtureBatch();
  const s = flow.snapshot(); assert.equal(s.attempts.length,12); assert.equal(s.accepted.length,11);
  assert.equal(s.attempts.filter(a=>a.kind==='duplicate').length,1);
  assert.deepEqual(s.accepted.reduce((a,l)=>(a[l.sku]=(a[l.sku]||0)+l.quantity,a),{}),{'XP-420B':5,'ZD421':4,'DS2208':2});
  assert.equal(flow.scan('HN12345'),'duplicate'); assert.equal(flow.scan(' hn12345 '),'invalid');
  assert.equal(flow.snapshot().attempts.at(-1).raw,' hn12345 '); assert.equal(adapter.metrics().inventoryDelta,0);
});
test('P04.A02 note/back retain document/session/version/codes; resume does not invent another document', () => {
  const s = setup(); s.ready(); const before=s.flow.snapshot(); s.flow.back(); s.flow.back(); s.flow.note('Ghi chú đã sửa');
  assert.equal(s.flow.snapshot().document.note,'Ghi chú đã sửa'); assert.deepEqual(s.flow.snapshot().accepted,before.accepted);
  for(const k of ['documentId','scanSessionId','version','number']) assert.equal(s.flow.snapshot().document[k],before.document[k]);
  assert.equal(s.flow.start({documentId:'PN-0001',codes:['saved']}),false);
});
test('P04.A03 record exactly once, receipt only success; no inventory mutation', async () => {
  const s=setup(); s.ready(); const sending=s.flow.send(); assert.equal(s.flow.snapshot().step,3); assert.equal(s.flow.snapshot().busy,true);
  assert.equal(await s.flow.send(),false); await sending; assert.equal(s.flow.snapshot().step,4);
  assert.equal(await s.flow.send(),false); assert.deepEqual(s.adapter.metrics(),{recordCalls:1,inventoryDelta:0});
});
test('P04.A04 unknown retains frozen payload, no blind retry, check receipt completes', async () => {
  const s=setup(); s.ready(); s.adapter.setOutcome('timeout-recorded'); await s.flow.send(); const before=s.flow.snapshot();
  assert.equal(before.unknown,true); assert.equal(before.step,3); assert.equal(s.flow.back(),false); assert.equal(s.flow.note('changed'),false);
  assert.equal(await s.flow.send(),false); assert.equal(s.flow.scan('HN12346'),false); await s.flow.check();
  assert.equal(s.flow.snapshot().step,4); assert.deepEqual(s.flow.snapshot().request,before.request); assert.equal(s.adapter.metrics().recordCalls,1);
});
test('actual timeout and late record require explicit reconciliation', async () => {
  const adapter=createInboundFixtureAdapter({delay:35}); const s=setup({adapter,timeoutMs:10}); s.ready(); await s.flow.send();
  assert.equal(s.flow.snapshot().unknown,true); await new Promise(r=>setTimeout(r,40)); assert.equal(s.flow.snapshot().step,3);
  // check also has a deadline; delayed status remains uncertain instead of hanging.
  await s.flow.check(); assert.equal(s.flow.snapshot().unknown,true); assert.equal(s.flow.snapshot().busy,false);
});
test('not-recorded reconciliation permits retry with same request and document', async () => {
  const s=setup(); s.ready(); s.adapter.setOutcome('unknown'); await s.flow.send(); const req=s.flow.snapshot().request;
  await s.flow.check(); assert.equal(s.flow.snapshot().unknown,true); s.adapter.setOutcome('not-recorded'); await s.flow.check();
  assert.equal(s.flow.snapshot().unknown,false); s.adapter.setOutcome('confirmed'); await s.flow.send(); assert.equal(s.flow.snapshot().step,4);
  assert.deepEqual(s.flow.snapshot().request,req);
});
test('rejection retains data and explicit retry, metadata cannot be relaxed by proposal', async () => {
  const s=setup(); s.ready(); s.adapter.setOutcome('failed'); const before=s.flow.snapshot(); await s.flow.send();
  assert.equal(s.flow.snapshot().recorded,false); assert.deepEqual(s.flow.snapshot().accepted,before.accepted);
  const adapter=createInboundFixtureAdapter({delay:0}); const make=adapter.makeDocument; adapter.makeDocument=a=>({...make(a),supplier:''});
  const bad=setup({adapter}); assert.equal(bad.flow.next(),false); assert.equal(await bad.flow.send(),false); assert.equal(adapter.metrics().recordCalls,0);
});
test('warehouse stop/unknown guard scan and record; confirmed auth is retained', async () => {
  const s=setup(); s.ready(); for(const value of [false,null]) { s.auth.session.warehouse.active=value; assert.equal(await s.flow.send(),false); }
  assert.equal(s.stopped(),2); assert.equal(s.adapter.metrics().recordCalls,0); assert.equal(s.auth.previewReady,true);
});
test('session change, missing permission, mismatch receipt, disposal cannot manufacture success', async () => {
  const s=setup(); s.ready(); s.auth.session.permissions.warehouseOperations=false; assert.equal(await s.flow.send(),false);
  s.auth.session.permissions.warehouseOperations=true; s.auth.session.actor.id='other'; assert.equal(await s.flow.send(),false);
  const adapter=createInboundFixtureAdapter({delay:0}); adapter.record=async req=>({kind:'recorded',request:{...req,requestId:'wrong'}});
  const bad=setup({adapter}); bad.ready(); await bad.flow.send(); assert.equal(bad.flow.snapshot().unknown,true);
  const late=setup({adapter:createInboundFixtureAdapter({delay:5})}); late.ready(); const pending=late.flow.send(); late.flow.dispose(); await pending; assert.equal(late.flow.snapshot().recorded,false);
});
test('production adapter blocked without approved contract; blank scan/review cannot send', async () => {
  const s=setup(); assert.equal(await s.flow.send(),false); s.flow.next(); assert.equal(s.flow.next(),false);
  s.flow.fixtureBatch(); s.flow.next(); s.adapter.fixture=false; assert.equal(await s.flow.send(),false); assert.equal(s.adapter.metrics().recordCalls,0);
});

test('completed run re-entry starts clean with unique identities, retains prior record receipt', async () => {
  const s=setup(); s.flow.note('old note'); s.ready(); await s.flow.send(); const done=s.flow.snapshot();
  s.flow.start(); assert.equal(s.flow.snapshot().step,4,'duplicate route/render must not reset result');
  s.flow.leave(); s.flow.start(); const fresh=s.flow.snapshot();
  assert.equal(fresh.step,1); assert.equal(fresh.document.note,''); assert.deepEqual(fresh.attempts,[]); assert.deepEqual(fresh.accepted,[]);
  assert.equal(fresh.request,null); assert.equal(fresh.recorded,false); assert.equal(fresh.busy,false); assert.equal(fresh.unknown,false); assert.equal(fresh.message,'');
  assert.notEqual(fresh.document.documentId,done.document.documentId); assert.notEqual(fresh.document.scanSessionId,done.document.scanSessionId);
  assert.deepEqual(s.flow.finishedRuns(),[done]);
  s.ready(); await s.flow.send(); const second=s.flow.snapshot(); assert.notEqual(second.request.requestId,done.request.requestId);
  assert.equal((await s.adapter.check(done.request)).kind,'recorded'); assert.deepEqual((await s.adapter.check(done.request)).request,done.request);
  assert.deepEqual(s.adapter.metrics(),{recordCalls:2,inventoryDelta:0});
});
test('confirmed rejection and confirmed not-recorded can start fresh after exit, never on same-page retry', async () => {
  for(const outcome of ['failed','unknown']) {
    const s=setup(); s.ready(); s.adapter.setOutcome(outcome); await s.flow.send();
    if(outcome==='unknown'){s.adapter.setOutcome('not-recorded');await s.flow.check();}
    const failed=s.flow.snapshot(); assert.equal(failed.outcome,'not-recorded');
    s.flow.start(); assert.deepEqual(s.flow.snapshot().request,failed.request);
    s.flow.leave(); s.flow.start(); assert.equal(s.flow.snapshot().step,1); assert.equal(s.flow.snapshot().outcome,null);
    assert.deepEqual(s.flow.finishedRuns()[0].accepted,failed.accepted);
  }
});
test('draft and UNKNOWN re-entry preserve data and refuse blind new record', async () => {
  const s=setup(); s.flow.note('draft');s.ready();const draft=s.flow.snapshot();s.flow.leave();s.flow.start();assert.deepEqual(s.flow.snapshot(),draft);
  s.adapter.setOutcome('unknown');await s.flow.send();const unknown=s.flow.snapshot();s.flow.leave();s.flow.start();assert.deepEqual(s.flow.snapshot(),unknown);
  assert.equal(await s.flow.send(),false);assert.deepEqual(s.flow.finishedRuns(),[]);assert.equal(s.adapter.metrics().recordCalls,1);
});
test('exit while sending preserves in-flight run; later confirmed completion permits fresh re-entry', async () => {
  const s=setup({adapter:createInboundFixtureAdapter({delay:5}),timeoutMs:100});s.ready();const sending=s.flow.send();s.flow.leave();s.flow.start();
  const pending=s.flow.snapshot();assert.equal(pending.busy,true);assert.equal(pending.step,3);assert.equal(await s.flow.send(),false);
  s.flow.leave();await sending;assert.equal(s.flow.snapshot().step,4);s.flow.start();assert.equal(s.flow.snapshot().step,1);
  assert.equal(s.flow.finishedRuns()[0].request.requestId,pending.request.requestId);
});
test('explicit document context never becomes new run; guards cannot clear completed data', async () => {
  const s=setup();s.ready();await s.flow.send();const done=s.flow.snapshot();s.flow.leave();
  assert.equal(s.flow.start({documentId:'foreign'}),false);assert.deepEqual(s.flow.snapshot(),done);
  assert.equal(s.flow.start({documentId:done.document.documentId}),true);assert.equal(s.flow.snapshot().step,4);
  s.flow.leave();s.auth.session.warehouse.active=false;assert.equal(s.flow.start(),false);assert.deepEqual(s.flow.snapshot(),done);
  s.auth.session.warehouse.active=true;s.auth.session.permissions.warehouseOperations=false;assert.equal(s.flow.start(),false);assert.deepEqual({...s.flow.snapshot(),message:''},done);assert.match(s.flow.snapshot().message,/Phiên/);
});
test('old receipt cannot confirm a subsequent run with a different request or scan session', async () => {
  const s=setup();s.ready();await s.flow.send();const old=s.flow.snapshot();s.flow.leave();s.flow.start();s.ready();
  s.adapter.record=async()=>({kind:'recorded',request:old.request});await s.flow.send();
  assert.equal(s.flow.snapshot().step,3);assert.equal(s.flow.snapshot().unknown,true);assert.equal(s.flow.snapshot().recorded,false);
});

test('P05 parity: whitespace code is not an attempt; long note is retained and blocked, never truncated', async()=>{
 const s=setup();s.flow.note('x'.repeat(201));assert.equal(s.flow.snapshot().document.note.length,201);assert.ok(s.flow.fieldErrors().note);assert.equal(s.flow.next(),false);
 s.flow.note('x'.repeat(200));assert.equal(s.flow.next(),true);for(const code of ['', '   ',null])assert.equal(s.flow.scan(code),false);assert.equal(s.flow.snapshot().attempts.length,0);
 s.flow.scan('HN12345');s.flow.next();s.flow.note('y'.repeat(201));assert.equal(await s.flow.send(),false);assert.equal(s.adapter.metrics().recordCalls,0);
});
test('P05 parity: explicit picker starts new run on same terminal route but preserves UNKNOWN and drafts',async()=>{
 const s=setup();s.ready();const draft=s.flow.snapshot();s.flow.start({}, {newAttempt:true});assert.deepEqual(s.flow.snapshot(),draft);
 s.adapter.setOutcome('unknown');await s.flow.send();const uncertain=s.flow.snapshot();s.flow.start({}, {newAttempt:true});assert.deepEqual(s.flow.snapshot(),uncertain);
 s.adapter.setOutcome('not-recorded');await s.flow.check();s.flow.start({}, {newAttempt:true});assert.equal(s.flow.snapshot().step,1);s.ready();s.adapter.setOutcome('confirmed');await s.flow.send();const done=s.flow.snapshot();
 s.flow.start();assert.equal(s.flow.snapshot().step,4);s.flow.start({}, {newAttempt:true});assert.equal(s.flow.snapshot().step,1);assert.notEqual(s.flow.snapshot().document.documentId,done.document.documentId);
});
test('metadata whitespace/malformed note blocks next and scan at controller boundary',()=>{
 for(const patch of [{supplier:'   '},{type:' '},{number:' '},{note:null}]){const adapter=createInboundFixtureAdapter({delay:0});const make=adapter.makeDocument;adapter.makeDocument=a=>({...make(a),...patch});const s=setup({adapter});assert.equal(s.flow.next(),false);assert.ok(Object.keys(s.flow.fieldErrors()).length);}
});

test('inbound catalogue has three types and fifteen unique searchable supplier fixtures',()=>{
 assert.deepEqual(INBOUND_TYPES.map(t=>t.name),['Nhập sản phẩm','Nhập linh kiện','Khác']);
 assert.equal(INBOUND_SUPPLIERS.length,15);assert.equal(new Set(INBOUND_SUPPLIERS.map(s=>s.id)).size,15);assert.equal(new Set(INBOUND_SUPPLIERS.map(s=>s.code)).size,15);
 const hai=INBOUND_SUPPLIERS[7];for(const query of ['HAI DANG','hải đăng','dang hai',' NCC-008 ','008'])assert.ok(matchesOption(hai,query));
 assert.equal(matchesOption(hai,'minh phat'),false);assert.ok(matchesOption(hai,''));
});
test('type and supplier selection persists through review/request with unchanged draft identity',async()=>{
 const s=setup(),before=s.flow.snapshot().document;
 for(const t of INBOUND_TYPES) {assert.equal(s.flow.select('type',t.id),true);assert.equal(s.flow.snapshot().document.type,t.name);}
 for(const supplier of INBOUND_SUPPLIERS)assert.equal(s.flow.select('supplier',supplier.id),true);
 s.flow.note('Giữ ghi chú');s.ready();const review=s.flow.snapshot();
 assert.equal(review.document.documentId,before.documentId);assert.equal(review.document.scanSessionId,before.scanSessionId);
 assert.equal(review.document.type,'Khác');assert.equal(review.document.supplierCode,'NCC-015');assert.equal(review.document.note,'Giữ ghi chú');
 await s.flow.send();assert.deepEqual(s.flow.snapshot().request.document,review.document);
});
test('catalogue rejects forged identities and locks type after scan and all metadata after request',async()=>{
 const s=setup(),before=s.flow.snapshot();assert.equal(s.flow.select('type','rogue'),false);assert.equal(s.flow.select('supplier','NCC-999'),false);assert.deepEqual(s.flow.snapshot(),before);
 s.ready();s.flow.back();s.flow.back();assert.equal(s.flow.select('type','components'),false);assert.equal(s.flow.select('supplier',INBOUND_SUPPLIERS[1].id),true);assert.equal(s.flow.snapshot().accepted.length,11);
 s.flow.next();s.flow.next();s.adapter.setOutcome('unknown');await s.flow.send();const unknown=s.flow.snapshot();
 assert.equal(s.flow.select('supplier',INBOUND_SUPPLIERS[2].id),false);assert.equal(s.flow.select('type','other'),false);assert.deepEqual(s.flow.snapshot(),unknown);
});
test('new attempt resets catalogue defaults; mismatched catalogue name/id cannot validate',async()=>{
 const s=setup();s.flow.select('type','components');s.flow.select('supplier',INBOUND_SUPPLIERS[8].id);s.ready();await s.flow.send();s.flow.leave();s.flow.start();
 assert.equal(s.flow.snapshot().document.typeId,'products');assert.equal(s.flow.snapshot().document.supplierId,INBOUND_SUPPLIERS[0].id);
 const adapter=createInboundFixtureAdapter();const make=adapter.makeDocument;adapter.makeDocument=a=>({...make(a),supplier:'Forged display'});const bad=setup({adapter});assert.ok(bad.flow.fieldErrors().supplier);assert.equal(bad.flow.next(),false);
});

test('rejected record freezes step changes as well as payload; retry and new run remain explicit',async()=>{
 const s=setup();s.ready();s.adapter.setOutcome('failed');await s.flow.send();const failed=s.flow.snapshot();
 assert.equal(s.flow.back(),false);assert.equal(s.flow.select('supplier',INBOUND_SUPPLIERS[2].id),false);assert.equal(s.flow.note('changed'),false);assert.equal(s.flow.scan('HN12346'),false);
 assert.deepEqual(s.flow.snapshot(),failed);s.adapter.setOutcome('confirmed');await s.flow.send();assert.deepEqual(s.flow.snapshot().request,failed.request);
 s.flow.leave();s.flow.start();assert.equal(s.flow.snapshot().step,1);assert.equal(s.flow.snapshot().request,null);
});
test('throwing or malformed product validation never crashes or accepts a corrupt line',()=>{
 const invalid=[null,undefined,{kind:'unknown'},{kind:'valid',raw:'wrong',sku:'SKU',quantity:1},{kind:'valid',raw:'HN12345',sku:' ',quantity:1},
  ...[0,-1,NaN,Infinity,1.5,'1',Number.MAX_SAFE_INTEGER+1].map(quantity=>({kind:'valid',raw:'HN12345',sku:'SKU',quantity}))];
 for(const result of invalid){const adapter=createInboundFixtureAdapter({delay:0});adapter.validate=()=>result;const s=setup({adapter});s.flow.next();assert.equal(s.flow.scan('HN12345'),'invalid');assert.equal(s.flow.snapshot().accepted.length,0);assert.equal(s.flow.snapshot().attempts[0].raw,'HN12345');assert.match(s.flow.snapshot().message,/Chưa xác minh/);assert.equal(s.flow.next(),false);}
 const adapter=createInboundFixtureAdapter({delay:0});adapter.validate=()=>{throw Error('fixture broken');};const s=setup({adapter});s.flow.next();assert.equal(s.flow.scan('HN12345'),'invalid');assert.equal(s.flow.snapshot().accepted.length,0);
});
test('late receipt after timeout cannot create success until checked; disposed generation cannot update UI',async()=>{
 let resolveRecord;const adapter=createInboundFixtureAdapter({delay:0});adapter.record=()=>new Promise(r=>{resolveRecord=r;});let changes=0;
 const auth={previewReady:true,session:{actor:{id:'a',name:'A'},warehouse:{id:'w',name:'Kho Hoa Nam',active:true},permissions:{warehouseOperations:true}}};
 const flow=createInboundFlow({adapter,getState:()=>auth,timeoutMs:8,onChange:()=>changes++});flow.start();flow.next();flow.scan('HN12345');flow.next();await flow.send();const uncertain=flow.snapshot();assert.equal(uncertain.unknown,true);
 flow.dispose();const prior=changes;resolveRecord({kind:'recorded',request:uncertain.request});await new Promise(r=>setTimeout(r,2));assert.equal(changes,prior);assert.equal(flow.snapshot().recorded,false);
});

test('Explicit next-run CTA only resets confirmed outcomes, archives prior receipt and never resends',async()=>{
 for(const outcome of ['confirmed','failed']){const s=setup();assert.equal(s.flow.newRun(),false);s.ready();s.adapter.setOutcome(outcome);const pending=s.flow.send();assert.equal(s.flow.newRun(),false);await pending;const old=s.flow.snapshot();assert.equal(s.flow.newRun(),true);const fresh=s.flow.snapshot();assert.equal(fresh.step,1);assert.equal(fresh.request,null);assert.equal(fresh.attempts.length,0);assert.notEqual(fresh.document.documentId,old.document.documentId);assert.deepEqual(s.flow.finishedRuns(),[old]);assert.equal(s.flow.newRun(),false);assert.equal(s.adapter.metrics().recordCalls,1);}
 const s=setup();s.ready();s.adapter.setOutcome('unknown');await s.flow.send();const before=s.flow.snapshot();assert.equal(s.flow.newRun(),false);assert.deepEqual(s.flow.snapshot(),before);
});
test('Next-run CTA respects warehouse/permission guards and preserves P12-seeded document before completion',async()=>{
 const s=setup();s.ready();await s.flow.send();const before=s.flow.snapshot();s.auth.session.warehouse.active=false;assert.equal(s.flow.newRun(),false);assert.deepEqual(s.flow.snapshot(),before);s.auth.session.warehouse.active=true;s.flow.newRun();const fresh=s.flow.snapshot();assert.equal(s.flow.start({documentEntry:{supplierId:INBOUND_SUPPLIERS[1].id,note:'must not overwrite'}}),true);assert.deepEqual(s.flow.snapshot(),fresh);
});
test('Scan filters are read-only views: counts, reverse order, invalid filter fallback and empty',()=>{
 const s=setup();s.ready();s.flow.back();s.flow.scan('<raw-error>');const before=s.flow.snapshot();
 for(const [filter,total]of [['all',13],['valid',11],['duplicate',1],['invalid',1],['rogue',13]]){const v=scanListView(before.attempts,filter);assert.equal(v.rows.length,total);assert.deepEqual(v.counts,{all:13,valid:11,duplicate:1,invalid:1});}
 assert.equal(scanListView(before.attempts,'all').rows[0].attempt.raw,'<raw-error>');assert.equal(scanListView(before.attempts,'invalid').rows[0].index,12);assert.deepEqual(s.flow.snapshot(),before);assert.deepEqual(scanListView([],'invalid').rows,[]);
});
test('SKU disclosure groups only accepted serials; distinct serial count is not quantity',()=>{
 const s=setup();s.ready();const before=s.flow.snapshot(),g=skuGroups(before.accepted);assert.deepEqual(g.map(x=>[x.sku,x.quantity,x.serials.length]),[['XP-420B',5,5],['ZD421',4,4],['DS2208',2,2]]);assert.equal(g.flatMap(x=>x.serials).filter(x=>x.raw==='HN12345').length,1);assert.deepEqual(s.flow.snapshot(),before);
 assert.deepEqual(skuGroups([{raw:'BOX',sku:'SKU',quantity:3}]),[{sku:'SKU',quantity:3,serialCount:0,serials:[{raw:'BOX',serial:null,quantity:3}]}]);
});

test('New run keeps prior recorded document available to P12, without promoting draft or failed runs',async()=>{
 const s=setup();s.ready();await s.flow.send();const done=s.flow.snapshot();s.flow.newRun();
 const records=()=>recordedDocuments([{type:'inbound',runs:[...s.flow.finishedRuns(),s.flow.snapshot()]}],s.auth.session);
 assert.equal(records().length,1);assert.equal(records()[0].id,done.document.documentId);
 s.ready();s.adapter.setOutcome('failed');await s.flow.send();s.flow.newRun();assert.equal(records().length,1);assert.equal(records()[0].id,done.document.documentId);
});

test('M04 scan event identities are unique and remain unchanged on snapshots/resume',()=>{
 const s=setup();s.flow.next();s.flow.fixtureBatch();const before=s.flow.snapshot();assert.equal(new Set(before.attempts.map(a=>a.eventId)).size,12);assert.equal(before.accepted.length,11);
 s.flow.leave();s.flow.start();assert.deepEqual(s.flow.snapshot().attempts,before.attempts);
});
test('M04 pending scan callbacks cannot write after leave, review, or into a new document',async()=>{
 const s=setup();s.flow.next();const old=s.flow.bindScan('camera-fixture');old('HN12345');s.flow.leave();assert.equal(old('HN12346'),false);
 s.flow.start();assert.equal(old('HN12346'),false);const current=s.flow.bindScan('camera-fixture');current('HN12346');s.flow.next();assert.equal(current('HN12347'),false);await s.flow.send();s.flow.newRun();s.flow.next();assert.equal(current('HN12347'),false);assert.equal(s.flow.snapshot().attempts.length,0);
 const next=s.flow.bindScan('manual');assert.equal(next('HN12347'),'valid');s.flow.dispose();assert.equal(next('HN12348'),false);
});
