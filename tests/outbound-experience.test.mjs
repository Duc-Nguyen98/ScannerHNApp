import test from 'node:test';
import assert from 'node:assert/strict';
import {createOutboundFlow} from '../docs/flows/outbound/outbound-flow.mjs';
import {createOutboundFixtureAdapter} from '../docs/flows/outbound/fixture-adapter.mjs';
import {fixtureGeography,chooseFixtureAddress} from './fixtures/outbound-geography.mjs';
import {filterAttempts,deliveryIsValid,createDraftExitGuard} from '../docs/flows/outbound/experience.mjs';
const auth={previewReady:true,session:{actor:{id:'a',name:'A'},warehouse:{id:'w',name:'Kho Hoa Nam',active:true},permissions:{warehouseOperations:true}}};
function setup(){const adapter=createOutboundFixtureAdapter({delay:0}),flow=createOutboundFlow({adapter,geography:fixtureGeography(),getState:()=>auth});flow.start();return{flow,adapter,review(){chooseFixtureAddress(flow);flow.next();flow.scan('HN12345');flow.next();}};}
test('direct edit from review preserves identity/scans, validates before return; frozen request cannot edit',async()=>{
 const {flow,adapter,review}=setup();assert.equal(flow.editDelivery(),false);review();const before=flow.snapshot();assert.equal(flow.editDelivery(),true);assert.equal(flow.snapshot().step,1);assert.equal(flow.snapshot().returnToReview,true);
 flow.field('phone','abc');assert.equal(flow.next(),false);assert.equal(flow.snapshot().step,1);flow.field('phone','0901234567');assert.equal(flow.next(),true);assert.equal(flow.snapshot().step,3);assert.equal(flow.snapshot().returnToReview,false);assert.equal(flow.snapshot().document.documentId,before.document.documentId);assert.deepEqual(flow.snapshot().attempts,before.attempts);assert.deepEqual(flow.snapshot().accepted,before.accepted);
 adapter.setOutcome('unknown');await flow.send();assert.equal(flow.editDelivery(),false);assert.deepEqual(flow.snapshot().request.document.phone,'0901234567');
});
test('dirty draft excludes initial view/geography reads, includes edits/scan/UNKNOWN and clears on success/new/dispose',async()=>{
 const {flow,adapter,review}=setup();assert.equal(flow.hasUnfinishedWork(),false);await flow.loadProvinces();assert.equal(flow.hasUnfinishedWork(),false);flow.note('abc');assert.equal(flow.hasUnfinishedWork(),true);flow.note('');assert.equal(flow.hasUnfinishedWork(),false);review();assert.equal(flow.hasUnfinishedWork(),true);flow.leave();assert.equal(flow.hasUnfinishedWork(),true);adapter.setOutcome('timeout-recorded');const pending=flow.send();assert.equal(flow.hasUnfinishedWork(),true);await pending;assert.equal(flow.hasUnfinishedWork(),true);await flow.check();assert.equal(flow.hasUnfinishedWork(),false);flow.start({}, {newAttempt:true});assert.equal(flow.hasUnfinishedWork(),false);flow.note('abc');flow.dispose();assert.equal(flow.hasUnfinishedWork(),false);
});
test('filters preserve audit/raw and counts, invalid+blocked belong to errors, indices stable for details',()=>{
 const audit=[{raw:'A',kind:'valid'},{raw:'A',kind:'duplicate'},{raw:'<script>',kind:'invalid'},{raw:'HN99999',kind:'blocked'}];const before=structuredClone(audit);
 assert.deepEqual(filterAttempts(audit,'duplicate').map(a=>a.index),[1]);assert.deepEqual(filterAttempts(audit,'error').map(a=>a.index),[3,2]);assert.deepEqual(filterAttempts(audit).map(a=>a.index),[3,2,1,0]);assert.deepEqual(audit,before);
 assert.equal(deliveryIsValid({planned:'bad'}),true);assert.equal(deliveryIsValid({address:'required'}),false);
});
test('exit guard adds one listener only while dirty and removes on dispose',()=>{
 const target=new EventTarget(),guard=createDraftExitGuard(target);const event=()=>new Event('beforeunload',{cancelable:true});let e=event();target.dispatchEvent(e);assert.equal(e.defaultPrevented,false);guard.update(true);guard.update(true);e=event();target.dispatchEvent(e);assert.equal(e.defaultPrevented,true);guard.dispose();e=event();target.dispatchEvent(e);assert.equal(e.defaultPrevented,false);
});
