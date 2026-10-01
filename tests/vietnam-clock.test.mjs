import test from 'node:test';
import assert from 'node:assert/strict';
import { vietnamTime } from '../docs/flows/home/vietnam-clock.mjs';
import { createAuthFlow } from '../docs/flows/auth-session/auth-flow.mjs';
import { createFixtureAdapter } from '../docs/flows/auth-session/fixture-adapter.mjs';
const credentials = {username:'minhanh', password:'preview'};

test('Vietnam clock uses UTC+7, 24 hours and seconds including midnight/day rollover', () => {
  assert.equal(vietnamTime(Date.parse('2026-09-28T01:30:09Z')), '08:30:09');
  assert.equal(vietnamTime(Date.parse('2026-09-28T16:59:59Z')), '23:59:59');
  assert.equal(vietnamTime(Date.parse('2026-09-28T17:00:00Z')), '00:00:00');
  assert.equal(vietnamTime(Date.parse('2026-12-31T17:00:01Z')), '00:00:01');
});
test('Shift timestamp is captured on confirmation, remains fixed, and resets on logout/new shift', async () => {
  let instant = Date.parse('2026-09-28T01:30:09.250Z');
  const adapter = createFixtureAdapter({delay:0,now:()=>instant});
  const flow = createAuthFlow(adapter);
  await flow.login(credentials); assert.equal(flow.snapshot().shiftStartedAt,null);
  const pending=flow.start(); assert.equal(flow.snapshot().shiftStartedAt,null);
  instant += 10000; await pending;
  const receipt=new Date(instant).toISOString();
  assert.equal(flow.snapshot().shiftStartedAt,receipt);
  instant += 3600000; await flow.start(); flow.enforceSession();
  assert.equal(flow.snapshot().shiftStartedAt,receipt);
  flow.logout(); assert.equal(flow.snapshot().shiftStartedAt,null);
  await flow.login(credentials); await flow.start();
  assert.equal(flow.snapshot().shiftStartedAt,new Date(instant).toISOString());
  assert.notEqual(flow.snapshot().shiftStartedAt,receipt);
});
test('The fixture returns one immutable start receipt per session', async () => {
  let instant=Date.parse('2026-09-28T01:30:00Z');
  const adapter=createFixtureAdapter({delay:0,now:()=>instant});
  const {session}=await adapter.authenticate(credentials);
  const first=await adapter.startShift(session);instant+=5000;
  assert.deepEqual(await adapter.startShift(session),first);
});
test('Denied/UNKNOWN/expired/malformed confirmation never creates a start time', async () => {
  for(const scenario of ['denied','warehouse-stopped','start-unknown','expired']){
    const flow=createAuthFlow(createFixtureAdapter({scenario,delay:0}));
    await flow.login(credentials);await flow.start();assert.equal(flow.snapshot().shiftStartedAt,null);
  }
  for(const startedAt of [undefined,'invalid','2026-02-31T08:00:00.000Z']){
    const adapter=createFixtureAdapter({delay:0});adapter.startShift=async()=>({kind:'preview-ready',startedAt});
    const flow=createAuthFlow(adapter);await flow.login(credentials);await flow.start();
    assert.equal(flow.snapshot().previewReady,false);assert.equal(flow.snapshot().startUnknown,true);assert.equal(flow.snapshot().shiftStartedAt,null);
  }
});
test('Late confirmation after logout cannot resurrect the prior start time', async()=>{
  const adapter=createFixtureAdapter({delay:0});let finish;
  adapter.startShift=()=>new Promise(resolve=>{finish=resolve;});
  const flow=createAuthFlow(adapter);await flow.login(credentials);const pending=flow.start();flow.logout();
  finish({kind:'preview-ready',startedAt:'2026-09-28T01:30:00.000Z'});await pending;
  assert.equal(flow.snapshot().shiftStartedAt,null);assert.equal(flow.snapshot().session,null);
});
