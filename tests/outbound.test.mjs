import { fixtureGeography, chooseFixtureAddress } from './fixtures/outbound-geography.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createOutboundFlow} from '../docs/flows/outbound/outbound-flow.mjs';
import {createOutboundFixtureAdapter,EXTRA_CODES} from '../docs/flows/outbound/fixture-adapter.mjs';
import {validVietnamPhone, outboundFieldErrors} from '../docs/flows/outbound/validation.mjs';

test('P05 new quantity defaults to1; strict integer input rejects malformed values at next, scan and send',async()=>{
 assert.equal(setup({fresh:true}).flow.snapshot().document.planned,1);
 for(const value of ['', '0','-1','100','99999999999999999999','1.5','1e1','+1','01',' 1','1 ','1\n','NaN','Infinity','１','1a','1,0','0x10']) {
  const s=setup({fresh:true});s.flow.field('planned',value);assert.equal(s.flow.next(),false,value);assert.ok(s.flow.fieldErrors().planned,value);
  const t=setup();t.full();t.flow.field('planned',value);assert.equal(await t.flow.send(),false,value);assert.equal(t.adapter.metrics().recordCalls,0);
 }
 for(const value of ['1','9','10','99']) {const s=setup({fresh:true});s.flow.field('planned',value);assert.equal(s.flow.next(),true);assert.equal(s.flow.snapshot().document.planned,Number(value));}
});

test('P05 walk-in details required, captured on receipt, no customer entity invented',async()=>{
 const s=setup({fresh:true});assert.equal(s.flow.select('recipient','walk-in'),true);assert.equal(s.flow.next(),false);assert.deepEqual(Object.keys(s.flow.fieldErrors()).sort(),['address','district','phone','province','recipient']);
 chooseFixtureAddress(s.flow);s.flow.field('recipient','Khách Nguyễn Văn A');s.flow.field('phone','0901234567');s.flow.field('address','12 Đường A');assert.equal(s.flow.next(),true);s.flow.scan('HN12345');s.flow.next();await s.flow.send();
 const d=s.flow.snapshot().request.document;assert.equal(d.recipientType,'walk-in');assert.equal(d.recipientId,null);assert.equal(d.recipient,'Khách Nguyễn Văn A');assert.equal(s.flow.select('recipient','an-binh'),false);
});

test('P05 source and group options validate IDs; group filters scans; scans lock source/group',()=>{
 const s=setup({fresh:true});const id=s.flow.snapshot().document.documentId;
 for(const name of ['source','recipient','group'])assert.equal(s.flow.select(name,'injected'),false);
 assert.equal(s.flow.select('source','demo-0006'),true);assert.notEqual(s.flow.snapshot().document.documentId,id);assert.equal(s.flow.snapshot().document.planned,2);assert.equal(s.flow.snapshot().document.recipientId,'an-binh');chooseFixtureAddress(s.flow);
 s.flow.next();assert.equal(s.flow.scan('HN12345'),'invalid');assert.equal(s.flow.scan('HN12346'),'valid');s.flow.back();const before=s.flow.snapshot();assert.equal(s.flow.select('source','new'),false);assert.equal(s.flow.select('group','printers'),false);assert.deepEqual(s.flow.snapshot().document,before.document);assert.deepEqual(s.flow.snapshot().accepted,before.accepted);
});

test('P05 quantity cannot fall below accepted; correction preserves all scans; upper bound prevents extra scans',()=>{
 const s=setup();s.seven();s.flow.back();s.flow.back();const accepted=s.flow.snapshot().accepted;s.flow.field('planned','6');assert.equal(s.flow.next(),false);assert.deepEqual(s.flow.snapshot().accepted,accepted);s.flow.field('planned','7');assert.equal(s.flow.next(),true);assert.equal(s.flow.scan('HN12352'),'invalid');assert.deepEqual(s.flow.snapshot().accepted,accepted);
});

test('P05 phone format accepts VN mobile/landline, rejects malformed input without rewriting',()=>{
 for(const phone of ['0901234567','0901 234 567','+84901234567','+84 901 234 567','0901.234.567','0901-234-567','028 3822 1234','+84 28 3822 1234',' 0901234567 ']) {
  assert.equal(validVietnamPhone(phone),true,phone);const s=setup();s.flow.field('phone',phone);assert.equal(s.flow.next(),true);assert.equal(s.flow.snapshot().document.phone,phone);
 }
 for(const phone of ['', '   ', 'abcdef', '1234567890','090123456','09012345678','01234567890','+840901234567','84901234567','+1 901234567','0901+234567','0901--234567','0901 234 567 ext 1','0901\n234567','０９０１２３４５６７']) {
  assert.equal(validVietnamPhone(phone),false,phone);const s=setup();s.flow.field('phone',phone);assert.equal(s.flow.next(),false);assert.equal(s.flow.snapshot().step,1);
 }
});

test('P05 required source fields are null-safe, whitespace-only address rejected and notes bounded',()=>{
 for(const [field,value] of [['recipient',null],['recipient','  '],['number',' '],['group',' '],['phone',null],['note','a'.repeat(201)]]) {
  const adapter=createOutboundFixtureAdapter({delay:0}),make=adapter.makeDocument;adapter.makeDocument=a=>({...make(a),[field]:value});const s=setup({adapter});assert.equal(s.flow.next(),false,field);assert.ok(outboundFieldErrors(s.flow.snapshot().document)[field]);
 }
 const s=setup();s.flow.note('a'.repeat(201));assert.equal(s.flow.snapshot().document.note.length,201);assert.equal(s.flow.next(),false);s.flow.note('a'.repeat(200));assert.equal(s.flow.next(),true);
});

test('P05 send revalidates metadata before making a request; correction preserves draft codes',async()=>{
 const s=setup();s.full();const before=s.flow.snapshot();s.flow.field('phone','abc');assert.equal(await s.flow.send(),false);assert.equal(s.adapter.metrics().recordCalls,0);assert.equal(s.flow.snapshot().request,null);
 s.flow.field('phone','0901234567');await s.flow.send();assert.equal(s.flow.snapshot().step,4);assert.deepEqual(s.flow.snapshot().accepted,before.accepted);
});

test('P05 empty manual/camera input is not a scan; padded nonempty codes remain exact invalid attempts',()=>{
 const s=setup();s.flow.next();for(const source of ['manual','camera-fixture']) for(const code of ['', ' \t ']) assert.equal(s.flow.scan(code,source),false);
 assert.equal(s.flow.snapshot().attempts.length,0);assert.equal(s.flow.scan(' HN12345 '),'invalid');assert.equal(s.flow.snapshot().attempts[0].raw,' HN12345 ');assert.equal(s.flow.snapshot().accepted.length,0);
});
function setup(options={}) {
 const auth={previewReady:true,session:{actor:{id:'a',name:'Minh Anh'},warehouse:{id:'w',name:'Kho Hoa Nam',active:true},permissions:{warehouseOperations:true}}};
 const adapter=options.adapter||createOutboundFixtureAdapter({delay:0}); let stopped=0;
 const flow=createOutboundFlow({adapter,geography:fixtureGeography(),getState:()=>auth,onStopped:()=>stopped++,timeoutMs:options.timeoutMs||50}); flow.start(); chooseFixtureAddress(flow); if (!options.fresh) flow.field('planned','10');
 return {auth,adapter,flow,stopped:()=>stopped,seven(){flow.next();flow.fixtureBatch();flow.next();},full(){flow.next();flow.fixtureBatch();EXTRA_CODES.forEach(c=>flow.scan(c));flow.next();}};
}
test('P05.A01 seven of ten: duplicate unchanged, groups 5+2, cannot send incomplete or reduce below accepted',async()=>{
 const s=setup();s.seven();const before=s.flow.snapshot();assert.equal(before.accepted.length,7);assert.equal(before.document.planned,10);assert.equal(before.attempts.length,8);
 assert.deepEqual(before.accepted.reduce((r,l)=>(r[l.sku]=(r[l.sku]||0)+l.quantity,r),{}),{'XP-420B':5,ZD421:2});
 assert.equal(await s.flow.send(),false);assert.equal(s.flow.field('planned','6'),true);assert.ok(s.flow.fieldErrors().planned);s.flow.field('planned','10');s.flow.back();assert.equal(s.flow.scan('HN12345'),'duplicate');assert.equal(s.flow.snapshot().accepted.length,7);assert.equal(s.adapter.metrics().recordCalls,0);
});
test('P05.A02/A03 only explicit additional scans and confirmed receipt unlock waiting Web; inventory unchanged',async()=>{
 const s=setup();s.seven();s.flow.back();EXTRA_CODES.forEach(c=>assert.equal(s.flow.scan(c),'valid'));s.flow.next();const pending=s.flow.send();assert.equal(s.flow.snapshot().step,3);assert.equal(s.flow.snapshot().recorded,false);await pending;
 assert.equal(s.flow.snapshot().step,4);assert.equal(s.flow.snapshot().accepted.length,10);assert.equal(s.adapter.metrics().inventoryDelta,0);assert.equal(s.adapter.metrics().records,1);assert.equal(s.flow.snapshot().sentAt,'09/09/2026 14:32');
});
test('P05.A04 cannot-export opens contextual P17.S02, preserves exact draft, scans blocked until dismissed',()=>{
 const s=setup();s.seven();s.flow.back();const before=s.flow.snapshot();assert.equal(s.flow.scan('HN99999'),'blocked');const after=s.flow.snapshot();assert.equal(after.exception.panel,'P17.S02');assert.deepEqual(after.accepted,before.accepted);assert.deepEqual(after.document,before.document);assert.equal(s.flow.scan('HN12352'),false);s.flow.dismissException();assert.equal(s.flow.scan('HN12352'),'valid');
});
test('P05.A05 double send + timeout preserve frozen request and reconcile one receipt',async()=>{
 const s=setup();s.full();s.adapter.setOutcome('timeout-recorded');const pending=s.flow.send();assert.equal(await s.flow.send(),false);await pending;const before=s.flow.snapshot();assert.equal(before.unknown,true);assert.equal(await s.flow.send(),false);assert.equal(s.flow.back(),false);assert.equal(s.flow.field('address','changed'),false);await s.flow.check();assert.equal(s.flow.snapshot().step,4);assert.deepEqual(s.flow.snapshot().request,before.request);assert.equal(s.adapter.metrics().recordCalls,1);assert.equal(s.adapter.metrics().records,1);
});
test('unknown then authoritative not-recorded can retry only same request',async()=>{
 const s=setup();s.full();s.adapter.setOutcome('unknown');await s.flow.send();const req=s.flow.snapshot().request;await s.flow.check();assert.equal(s.flow.snapshot().unknown,true);s.adapter.setOutcome('not-recorded');await s.flow.check();s.adapter.setOutcome('confirmed');await s.flow.send();assert.deepEqual(s.flow.snapshot().request,req);assert.equal(s.adapter.metrics().records,1);
});
test('real timeout and late result cannot manufacture success',async()=>{
 const s=setup({adapter:createOutboundFixtureAdapter({delay:20}),timeoutMs:5});s.full();await s.flow.send();assert.equal(s.flow.snapshot().unknown,true);await new Promise(r=>setTimeout(r,30));assert.equal(s.flow.snapshot().step,3);assert.equal(s.flow.snapshot().recorded,false);
});
test('required metadata stays required, notes/back preserve identity and quantity',()=>{
 for(const field of ['phone','address']){const s=setup();assert.equal(s.flow.field(field,''),true);assert.equal(s.flow.next(),false);}
 const adapter=createOutboundFixtureAdapter({delay:0}),make=adapter.makeDocument;adapter.makeDocument=a=>({...make(a),recipient:''});assert.equal(setup({adapter}).flow.next(),false);
 const s=setup();s.seven();const d=s.flow.snapshot().document;s.flow.back();s.flow.back();s.flow.note('Ghi chú mới');s.flow.next();s.flow.next();assert.equal(s.flow.snapshot().accepted.length,7);assert.equal(s.flow.snapshot().document.documentId,d.documentId);assert.equal(s.flow.snapshot().document.planned,10);assert.equal(s.flow.snapshot().document.note,'Ghi chú mới');
});
test('wrong warehouse/unknown/raw codes never enter accepted; manual and fixture share validation',()=>{
 const s=setup();s.flow.next();for(const code of ['HN-WRONG-WAREHOUSE',' hn12345 ','<script>'])assert.equal(s.flow.scan(code),'invalid');assert.equal(s.flow.snapshot().accepted.length,0);assert.equal(s.flow.snapshot().attempts[1].raw,' hn12345 ');assert.equal(s.flow.scan('HN12345','camera-fixture'),'valid');assert.equal(s.flow.scan('HN12345','manual'),'duplicate');
});
test('warehouse stopped, revoked permission, actor mismatch guard writes without clearing draft',async()=>{
 const s=setup();s.full();const d=s.flow.snapshot().document;s.auth.session.warehouse.active=false;assert.equal(await s.flow.send(),false);assert.equal(s.stopped(),1);s.auth.session.warehouse.active=true;s.auth.session.permissions.warehouseOperations=false;assert.equal(await s.flow.send(),false);s.auth.session.permissions.warehouseOperations=true;s.auth.session.actor.id='b';assert.equal(await s.flow.send(),false);assert.deepEqual(s.flow.snapshot().document,d);assert.equal(s.adapter.metrics().recordCalls,0);
});
test('mismatched receipt and adapter exception remain UNKNOWN, real adapter disabled',async()=>{
 for(const record of [async r=>({kind:'recorded',request:{...r,requestId:'wrong'}}),async()=>{throw Error('network');}]){const adapter=createOutboundFixtureAdapter({delay:0});adapter.record=record;const s=setup({adapter});s.full();await s.flow.send();assert.equal(s.flow.snapshot().unknown,true);}
 const s=setup();s.full();s.adapter.fixture=false;assert.equal(await s.flow.send(),false);assert.equal(s.adapter.metrics().recordCalls,0);
});
test('Home/picker lifecycle retains draft/UNKNOWN/sending; terminal reentry creates distinct clean run',async()=>{
 const s=setup();s.seven();let before=s.flow.snapshot();s.flow.leave();s.flow.start();assert.deepEqual(s.flow.snapshot(),before);s.flow.back();EXTRA_CODES.forEach(c=>s.flow.scan(c));s.flow.next();s.adapter.setOutcome('timeout-recorded');let pending=s.flow.send();s.flow.leave();s.flow.start();assert.equal(s.flow.snapshot().busy,true);await pending;before=s.flow.snapshot();s.flow.leave();s.flow.start();assert.deepEqual(s.flow.snapshot(),before);await s.flow.check();const id=s.flow.snapshot().document.documentId;s.flow.leave();s.flow.start();assert.notEqual(s.flow.snapshot().document.documentId,id);assert.equal(s.flow.snapshot().step,1);assert.equal(s.flow.snapshot().accepted.length,0);assert.equal(s.flow.snapshot().request,null);
});
test('confirmed failure preserved for explicit retry or archived on fresh reentry; resume mismatch refused',async()=>{
 const s=setup();s.full();s.adapter.setOutcome('failed');await s.flow.send();const before=s.flow.snapshot();assert.equal(before.outcome,'not-recorded');assert.equal(before.accepted.length,10);assert.equal(s.flow.start({documentId:'PX-0004'}),false);s.flow.leave();s.flow.start();assert.equal(s.flow.snapshot().step,1);assert.equal(s.flow.finishedRuns()[0].document.documentId,before.document.documentId);
});
test('explicit next outbound attempt resets terminal even when previous screen stayed active', async()=>{
 for(const outcome of ['confirmed','failed']) {
  const s=setup();s.full();s.adapter.setOutcome(outcome);await s.flow.send();const previous=s.flow.snapshot();
  s.flow.start({}, {newAttempt:true});
  assert.equal(s.flow.snapshot().step,1);assert.notEqual(s.flow.snapshot().document.documentId,previous.document.documentId);
  assert.equal(s.flow.snapshot().accepted.length,0);assert.equal(s.flow.snapshot().request,null);assert.equal(s.flow.snapshot().outcome,null);
  assert.equal(s.flow.finishedRuns().length,1);assert.deepEqual(s.flow.finishedRuns()[0],previous);
  const fresh=s.flow.snapshot();s.flow.start({}, {newAttempt:true});assert.deepEqual(s.flow.snapshot(),fresh);
 }
});
test('explicit next attempt never resets draft, pending, UNKNOWN or explicit document resume',async()=>{
 const s=setup();s.seven();const draft=s.flow.snapshot();s.flow.start({}, {newAttempt:true});assert.deepEqual(s.flow.snapshot(),draft);
 s.flow.back();EXTRA_CODES.forEach(c=>s.flow.scan(c));s.flow.next();s.adapter.setOutcome('timeout-recorded');const sending=s.flow.send();const pending=s.flow.snapshot();s.flow.start({}, {newAttempt:true});assert.deepEqual(s.flow.snapshot(),pending);await sending;
 const unknown=s.flow.snapshot();s.flow.start({}, {newAttempt:true});assert.deepEqual(s.flow.snapshot(),unknown);
 await s.flow.check();const done=s.flow.snapshot();s.flow.start({documentId:done.document.documentId},{newAttempt:true});assert.deepEqual(s.flow.snapshot(),done);
});
