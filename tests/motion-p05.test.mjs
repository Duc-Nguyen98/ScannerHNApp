import test from 'node:test';
import assert from 'node:assert/strict';
import {createOutboundFlow} from '../docs/flows/outbound/outbound-flow.mjs';
import {createOutboundFixtureAdapter} from '../docs/flows/outbound/fixture-adapter.mjs';
import {createInboundFlow} from '../docs/flows/inbound/inbound-flow.mjs';
import {createInboundFixtureAdapter} from '../docs/flows/inbound/fixture-adapter.mjs';
import {fixtureGeography,chooseFixtureAddress} from './fixtures/outbound-geography.mjs';
const auth={previewReady:true,session:{actor:{id:'a'},warehouse:{id:'w',name:'Kho Hoa Nam',active:true},permissions:{warehouseOperations:true}}};
function setup(){const flow=createOutboundFlow({adapter:createOutboundFixtureAdapter({delay:0}),geography:fixtureGeography(),getState:()=>auth});flow.start();chooseFixtureAddress(flow);flow.field('planned','10');flow.next();return flow;}
test('M05 stable scan event IDs are allocated only on attempts and not replay/repaint/resume',()=>{
 const f=setup();f.fixtureBatch();const s=f.snapshot();assert.equal(s.accepted.length,7);assert.equal(s.attempts.length,8);assert.equal(new Set(s.attempts.map(a=>a.eventId)).size,8);assert.ok(s.attempts.every(a=>a.eventId.startsWith(s.document.scanSessionId+':event:')));f.leave();f.start();assert.deepEqual(f.snapshot().attempts,s.attempts);f.next();assert.equal(f.snapshot().accepted.length,7);
});
test('M05 old input/camera callbacks cannot append after review/back/leave/new attempt/dispose',async()=>{
 const f=setup(),scan=f.bindScan('camera-fixture');assert.equal(scan('HN12345'),'valid');f.next();f.back();assert.equal(scan('HN12346'),false);const current=f.bindScan();f.leave();assert.equal(current('HN12346'),false);f.start();assert.equal(current('HN12346'),false);assert.equal(f.bindScan()('HN12346'),'valid');f.back();f.field('planned','2');f.next();f.next();await f.send();f.start({}, {newAttempt:true});chooseFixtureAddress(f);f.next();assert.equal(current('HN12347'),false);assert.equal(f.snapshot().accepted.length,0);const last=f.bindScan();f.dispose();assert.equal(last('HN12347'),false);
});
test('M05 switching inbound to outbound keeps separate identities/codes and rejects stale callbacks',()=>{
 const inbound=createInboundFlow({adapter:createInboundFixtureAdapter({delay:0}),getState:()=>auth});inbound.start();inbound.next();const old=inbound.bindScan('camera-fixture');old('HN12345');inbound.leave();const outbound=setup();assert.equal(old('HN12346'),false);assert.equal(outbound.snapshot().accepted.length,0);outbound.bindScan()('HN12346');assert.equal(outbound.snapshot().accepted[0].raw,'HN12346');assert.notEqual(inbound.snapshot().document.scanSessionId,outbound.snapshot().document.scanSessionId);assert.equal(inbound.snapshot().accepted.length,1);
});

test('M05 restoring an existing draft preserves event IDs and reserves their sequence',async()=>{
 const original=setup();original.fixtureBatch();const saved=original.snapshot();
 const restoredAuth=structuredClone(auth);restoredAuth.session.namespace='fixture-auth';
 const restored=createOutboundFlow({adapter:createOutboundFixtureAdapter({delay:0}),geography:fixtureGeography(),getState:()=>restoredAuth});
 assert.equal(restored.restorePreview(saved),true);await new Promise(r=>setTimeout(r,0));assert.equal(restored.start({documentId:saved.document.documentId}),true);
 assert.deepEqual(restored.snapshot().attempts,saved.attempts);assert.equal(restored.bindScan()('HN12352'),'valid');
 const attempts=restored.snapshot().attempts;assert.equal(new Set(attempts.map(a=>a.eventId)).size,9);assert.match(attempts.at(-1).eventId,/:event:9$/);
});
