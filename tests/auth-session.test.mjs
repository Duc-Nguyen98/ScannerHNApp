import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthFlow } from '../docs/flows/auth-session/auth-flow.mjs';
import { createFixtureAdapter } from '../docs/flows/auth-session/fixture-adapter.mjs';

const credentials = { username: 'minhanh', password: 'preview' };
const make = scenario => createAuthFlow(createFixtureAdapter({ scenario, delay: 0 }));
test('valid fixture always stops at confirmation before the P02 boundary', async () => {
  const flow = make('valid');
  await flow.login(credentials);
  assert.equal(flow.snapshot().screen, 'confirmation');
  assert.equal(flow.snapshot().navigation, null);
  assert.equal(flow.snapshot().session.actor.name, 'Minh Anh');
  await flow.start();
  assert.equal(flow.snapshot().navigation.target, 'P02');
  assert.match(flow.snapshot().message, /chưa tạo ca làm việc thật/);
});
test('credentials are passed byte-for-byte; no trim, casefold or password policy', async () => {
  let actual;
  const adapter = { authenticate: async value => { actual = value; return { kind: 'rejected' }; } };
  const flow = createAuthFlow(adapter);
  const supplied = { username: '  A\u0301Nh  ', password: ' \u0000Ab🔐  ' };
  await flow.login(supplied);
  assert.deepEqual(actual, supplied);
  assert.equal(flow.snapshot().screen, 'login');
});
test('invalid and empty credentials never expose confirmation or Home', async () => {
  for (const input of [{ username: '', password: '' }, { ...credentials, password: 'wrong' }, { ...credentials, username: ' MINHANH ' }]) {
    const flow = make('valid'); await flow.login(input);
    assert.equal(flow.snapshot().screen, 'login'); assert.equal(flow.snapshot().session, null);
  }
});
test('repeated login has a single in-flight adapter request', async () => {
  let calls = 0, finish;
  const flow = createAuthFlow({ authenticate: () => { calls++; return new Promise(resolve => { finish = resolve; }); } });
  const first = flow.login(credentials);
  await flow.login(credentials);
  assert.equal(calls, 1); assert.equal(flow.snapshot().busy, true);
  finish({ kind: 'rejected' }); await first;
  assert.equal(flow.snapshot().busy, false);
});
test('session identity is supplied by adapter, not hardcoded role/name UI', async () => {
  const flow = make('other-user'); await flow.login(credentials);
  assert.equal(flow.snapshot().session.actor.name, 'Lan Nguyễn');
  assert.equal(flow.snapshot().session.actor.initials, 'LN');
});
test('permission and warehouse guards block start even when called directly', async () => {
  for (const scenario of ['denied', 'warehouse-stopped']) {
    const flow = make(scenario); await flow.login(credentials); await flow.start();
    assert.equal(flow.snapshot().navigation, null); assert.equal(flow.snapshot().previewReady, false);
    assert.ok(flow.snapshot().message);
  }
});
test('unknown login, unknown shift and thrown request never produce success', async () => {
  const login = make('auth-unknown'); await login.login(credentials);
  assert.equal(login.snapshot().session, null);
  const start = make('start-unknown'); await start.login(credentials); await start.start();
  const prior = start.snapshot(); await start.start();
  assert.deepEqual(start.snapshot(), prior); assert.equal(prior.startUnknown, true); assert.equal(prior.navigation, null);
  const broken = createAuthFlow({ authenticate: async () => { throw new Error('offline'); } });
  await broken.login(credentials); assert.match(broken.snapshot().message, /Chưa xác định/);
});
test('expired start returns to login', async () => {
  const flow = make('expired'); await flow.login(credentials); await flow.start();
  assert.equal(flow.snapshot().screen, 'login'); assert.equal(flow.snapshot().session, null);
});
test('logout and back/hash guard cannot restore protected screen', async () => {
  const flow = make('valid'); await flow.login(credentials); flow.logout(); flow.enforceSession();
  assert.equal(flow.snapshot().screen, 'login'); assert.equal(flow.snapshot().session, null);
});
test('late login response after logout is ignored and fixture is revoked', async () => {
  const adapter = createFixtureAdapter({ delay: 10 }); const flow = createAuthFlow(adapter);
  const pending = flow.login(credentials); flow.logout(); await pending;
  assert.equal(flow.snapshot().screen, 'login'); assert.equal(flow.snapshot().session, null);
});
test('late start response cannot recreate logout session; start double-click guarded', async () => {
  const adapter = createFixtureAdapter({ delay: 0 }); let calls = 0, finish;
  adapter.startShift = () => { calls++; return new Promise(resolve => { finish = resolve; }); };
  const flow = createAuthFlow(adapter); await flow.login(credentials);
  const first = flow.start(); await flow.start(); assert.equal(calls, 1);
  flow.logout(); finish({ kind: 'preview-ready' }); await first;
  assert.equal(flow.snapshot().screen, 'login'); assert.equal(flow.snapshot().navigation, null);
});
test('recovery is a P14 pending boundary only', () => {
  const flow = make('valid'); flow.recovery();
  assert.deepEqual(flow.snapshot().navigation, { target: 'P14', returnTo: 'P01' });
  assert.match(flow.snapshot().message, /Chưa gửi/);
});
