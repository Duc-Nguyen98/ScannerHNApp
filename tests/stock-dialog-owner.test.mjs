import test from 'node:test';
import assert from 'node:assert/strict';
import {createStockDialogAdapter} from '../docs/flows/scanner-dialogs/stock-owner-adapter.mjs';
import {createDialogFlow} from '../docs/flows/scanner-dialogs/dialog-flow.mjs';
import {createInboundFlow} from '../docs/flows/inbound/inbound-flow.mjs';
import {createInboundFixtureAdapter} from '../docs/flows/inbound/fixture-adapter.mjs';
import {createOutboundFlow} from '../docs/flows/outbound/outbound-flow.mjs';
import {createOutboundFixtureAdapter} from '../docs/flows/outbound/fixture-adapter.mjs';
import {fixtureGeography,chooseFixtureAddress} from './fixtures/outbound-geography.mjs';

function setup() {
  const auth={previewReady:true,session:{actor:{id:'a',name:'Minh Anh'},warehouse:{id:'w',name:'Kho Hoa Nam',active:true},permissions:{warehouseOperations:true}}};
  const stockAdapter=createInboundFixtureAdapter({delay:0});
  const owner=createInboundFlow({adapter:stockAdapter,getState:()=>auth});
  owner.start();owner.next();owner.scan('HN12345');
  const adapter=createStockDialogAdapter({getState:()=>auth,getOwner:op=>op==='inbound'?owner:null,getOperation:()=> 'inbound'});
  const navigations=[];
  const flow=createDialogFlow({adapter,getState:()=>auth,onNavigate:n=>navigations.push(n)});
  flow.openPicker();
  return {auth,owner,stockAdapter,adapter,flow,navigations};
}
test('P03 projects the live stock owner and resumes identical data without a write',()=>{
  const {owner,flow,navigations,stockAdapter}=setup(),before=owner.snapshot();
  assert.equal(flow.snapshot().panel,'P03.S02');assert.equal(flow.resume(),true);
  assert.equal(navigations[0].context.resumeExisting,true);
  for(const key of ['documentId','scanSessionId','version'])assert.equal(navigations[0].context[key],before.document[key]);
  assert.deepEqual(navigations[0].context.codes,before.accepted.map(r=>r.raw));
  assert.deepEqual(owner.snapshot(),before);assert.equal(stockAdapter.metrics().recordCalls,0);
});
test('P03 stale owner content, scope and UNKNOWN cannot be discarded or saved blindly',async()=>{
  const {auth,owner,flow}=setup(),stale=flow.snapshot().document;owner.note('changed after dialog opened');
  assert.equal(owner.start({documentId:stale.documentId,ownerFingerprint:stale.ownerFingerprint}),false);
  assert.equal(flow.resume(),false);flow.requestDiscard();assert.equal(flow.confirmDiscard(),false);
  assert.notEqual(owner.snapshot().document,null);
  flow.cancel();flow.cancel();flow.openPicker();auth.session.warehouse.id='another';
  assert.equal(flow.resume(),false);assert.equal(await flow.save(),false);
});
test('P03 cancel retains live data; confirmed discard removes only exact local owner',()=>{
  const {owner,flow}=setup(),before=owner.snapshot();flow.requestDiscard();flow.cancel();assert.deepEqual(owner.snapshot(),before);
  flow.requestDiscard();assert.equal(flow.confirmDiscard(),true);assert.equal(owner.snapshot().document,null);assert.equal(flow.snapshot().document,null);
});
test('P03 save keeps owner data in memory and cannot be mistaken for WMS record',async()=>{
  const {owner,flow,stockAdapter}=setup(),before=owner.snapshot();await flow.save();
  assert.deepEqual(owner.snapshot(),before);assert.equal(flow.snapshot().document.unsaved,false);assert.equal(stockAdapter.metrics().recordCalls,0);
  flow.openUnfinished();flow.requestDiscard();assert.equal(flow.confirmDiscard(),false);
});
test('Legacy P03 fixture is retained separately and never imported into a stock owner',()=>{
  const {adapter,auth,flow,owner}=setup(),before=owner.snapshot();const legacy=adapter.makeDocument(auth);
  flow.cancel();assert.equal(flow.loadFixtureDocument(legacy),true);flow.openPicker();assert.deepEqual(flow.snapshot().document,legacy);assert.deepEqual(owner.snapshot(),before);
});
test('UNKNOWN owner resumes reconciliation with same request but blocks discard',async()=>{
  const {owner,stockAdapter,flow,navigations}=setup();owner.next();stockAdapter.setOutcome('timeout-recorded');await owner.send();
  flow.cancel();flow.openPicker();assert.equal(flow.resume(),true);assert.equal(navigations[0].context.documentId,owner.snapshot().document.documentId);
  flow.openPicker();flow.requestDiscard();assert.equal(flow.confirmDiscard(),false);assert.equal(owner.snapshot().unknown,true);
});
test('Discarding selected outbound owner clears its location cache without touching inbound',()=>{
  const {owner:inbound,auth}=setup(),before=inbound.snapshot();
  const outbound=createOutboundFlow({adapter:createOutboundFixtureAdapter({delay:0}),getState:()=>auth,geography:fixtureGeography()});
  outbound.start();chooseFixtureAddress(outbound);outbound.note('outbound draft');assert.ok(outbound.snapshot().geography.districts.length);
  const adapter=createStockDialogAdapter({getState:()=>auth,getOperation:()=> 'outbound',getOwner:op=>op==='outbound'?outbound:inbound});
  const flow=createDialogFlow({adapter,getState:()=>auth});flow.openPicker();assert.equal(flow.snapshot().document.operation,'outbound');flow.requestDiscard();assert.equal(flow.confirmDiscard(),true);
  assert.equal(outbound.snapshot().document,null);assert.deepEqual(outbound.snapshot().geography.districts,[]);assert.equal(outbound.snapshot().geography.districtStatus,'idle');assert.deepEqual(inbound.snapshot(),before);
});
