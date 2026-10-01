import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthFlow } from '../docs/flows/auth-session/auth-flow.mjs';
import { createFixtureAdapter } from '../docs/flows/auth-session/fixture-adapter.mjs';
import { resolveNavigation, sessionGuard, parseRoute, routeHash } from '../docs/flows/home/home-flow.mjs';
import { readHomeFixture } from '../docs/flows/home/fixture-adapter.mjs';

async function login(scenario = 'valid') {
  const flow = createAuthFlow(createFixtureAdapter({ scenario, delay: 0 }));
  await flow.login({ username: 'minhanh', password: 'preview' });
  await flow.start();
  return flow;
}
test('P01 fixture session supplies Home identity and warehouse, only after start', async () => {
  const flow = createAuthFlow(createFixtureAdapter({ delay: 0 }));
  assert.ok(sessionGuard(flow.snapshot()));
  await flow.login({ username: 'minhanh', password: 'preview' });
  assert.equal(resolveNavigation('home', null, flow.snapshot()).kind, 'blocked');
  await flow.start();
  assert.equal(sessionGuard(flow.snapshot()), '');
  const other = await login('other-user');
  assert.equal(resolveNavigation('history', null, other.snapshot()).context.actorId, 'fixture-lan');
});
test('every Home destination keeps its prompt mapping; history uses the existing hub', async () => {
  const state = (await login()).snapshot();
  for (const [key, prompt] of Object.entries({ inbound: 'P04', outbound: 'P05', lookup: 'P06', nfc: 'P07', warranty: 'P09', profile: 'P10', documents: 'P12', notifications: 'P13' })) {
    const route = resolveNavigation(key, null, state);
    assert.equal(route.target, prompt); assert.equal(route.kind, 'pending');
    assert.equal(route.context.warehouseId, 'fixture-hoa-nam');
  }
  const history = resolveNavigation('history', null, state);
  assert.equal(history.target, 'P22'); assert.equal(history.kind, 'available');
  assert.match(history.url, /scene=history-hub/);
});
test('recent document and case IDs cannot be dropped, swapped or invented', async () => {
  const state = (await login()).snapshot();
  for (const [route, id, field] of [['inbound', 'PN-0001', 'documentId'], ['outbound', 'PX-0004', 'documentId'], ['warranty', 'BH-001', 'caseId']]) {
    const navigation = resolveNavigation(route, id, state);
    assert.equal(navigation.context[field], id);
    assert.equal(navigation.kind, 'pending');
    assert.deepEqual(parseRoute(routeHash(route, id)), { key: route, id });
  }
  assert.equal(resolveNavigation('inbound', 'PX-0004', state).kind, 'blocked');
  assert.equal(resolveNavigation('profile', 'PN-0001', state).kind, 'blocked');
  assert.equal(resolveNavigation('warranty', 'BH-999', state).kind, 'blocked');
});
test('direct routes and actions fail closed for denied, stopped, expired, unknown and logged-out sessions', async () => {
  for (const scenario of ['denied', 'warehouse-stopped', 'expired', 'start-unknown', 'auth-unknown']) {
    const flow = await login(scenario);
    for (const key of ['home', 'inbound', 'history']) assert.equal(resolveNavigation(key, null, flow.snapshot()).kind, 'blocked', scenario);
    assert.equal(readHomeFixture(flow.snapshot()), null);
  }
  const flow = await login(); flow.logout(); flow.enforceSession();
  assert.equal(resolveNavigation('history', null, flow.snapshot()).kind, 'blocked');
  const state = (await login()).snapshot();
  state.session.permissions.warehouseOperations = undefined;
  assert.equal(resolveNavigation('inbound', null, state).kind, 'blocked');
});

test('active session can reopen NFC for inspection/reconciliation while warehouse writes are stopped',async()=>{
 const state=(await login()).snapshot();state.session.warehouse.active=false;
 assert.equal(resolveNavigation('nfc',null,state).kind,'pending');
 for(const key of ['inbound','outbound'])assert.equal(resolveNavigation(key,null,state).kind,'warehouse-stopped');
 state.session.permissions.warehouseOperations=false;
 assert.equal(resolveNavigation('nfc',null,state).kind,'blocked');
});
test('UNKNOWN KPI/badge never falls back to board numbers or inferred recent counts', async () => {
  const state = (await login()).snapshot();
  const known = readHomeFixture(state);
  assert.equal(known.pendingDocuments, 5); assert.equal(known.openWarranties, 4);
  assert.equal(known.recent.length, 3); assert.equal(known.shiftStartedAt, state.shiftStartedAt);
  assert.ok(Number.isFinite(Date.parse(known.shiftStartedAt)));
  const unknown = readHomeFixture(state, { unknown: true });
  for (const key of ['pendingDocuments', 'openWarranties', 'notifications', 'recent']) assert.equal(unknown[key], null);
  assert.equal(unknown.shiftStartedAt, state.shiftStartedAt, 'Confirmed shift remains known independently of KPI source');
  assert.equal(unknown.source, 'UNKNOWN');
});
test('navigation rejects inherited keys/malformed routes and carries no credential/session token', async () => {
  const state = (await login()).snapshot();
  for (const key of ['__proto__', 'constructor', 'no-such-route']) assert.equal(resolveNavigation(key, null, state).kind, 'blocked');
  assert.equal(parseRoute('#p02/%ZZ').key, 'invalid');
  const route = resolveNavigation('history', null, state);
  assert.deepEqual(Object.keys(route.context).sort(), ['actorId', 'namespace', 'returnTo', 'warehouseId']);
});
