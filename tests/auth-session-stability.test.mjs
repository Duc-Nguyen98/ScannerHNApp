import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthFlow } from '../docs/flows/auth-session/auth-flow.mjs';

const validSession = () => ({ namespace: 'test', actor: { id: 'a', name: 'Minh Anh', initials: 'MA', role: 'Kho' }, warehouse: { id: 'w', name: 'Kho Hoa Nam', active: true }, permissions: { warehouseOperations: true } });
const adapterFor = (session = validSession()) => ({ authenticate: async () => ({ kind: 'authenticated', session }), isValid: s => s === session, startShift: async () => ({ kind: 'preview-ready' }), logout() {} });

test('malformed authenticated payload cannot crash or leave login busy', async () => {
  for (const session of [{}, { actor: {} }, { ...validSession(), actor: null }]) {
    const flow = createAuthFlow(adapterFor(session));
    await flow.login({});
    assert.equal(flow.snapshot().screen, 'login');
    assert.equal(flow.snapshot().session, null);
    assert.equal(flow.snapshot().busy, false);
    assert.match(flow.snapshot().message, /Chưa xác định/);
  }
});
test('only literal true grants warehouse/permission access; role text cannot grant it', async () => {
  for (const field of ['warehouse', 'permissions']) for (const value of ['false', 1, undefined, null]) {
    const session = validSession();
    session[field][field === 'warehouse' ? 'active' : 'warehouseOperations'] = value;
    const adapter = adapterFor(session); let starts = 0;
    adapter.startShift = async () => { starts++; return { kind: 'preview-ready' }; };
    const flow = createAuthFlow(adapter); await flow.login({}); await flow.start();
    assert.equal(starts, 0); assert.equal(flow.snapshot().previewReady, false);
  }
});
test('access revoked while start is pending never opens Home', async () => {
  for (const field of ['warehouse', 'permissions']) {
    const session = validSession(); const adapter = adapterFor(session); let finish;
    adapter.startShift = () => new Promise(resolve => { finish = resolve; });
    const flow = createAuthFlow(adapter); await flow.login({}); const pending = flow.start();
    session[field][field === 'warehouse' ? 'active' : 'warehouseOperations'] = false;
    finish({ kind: 'preview-ready' }); await pending;
    assert.equal(flow.snapshot().previewReady, false); assert.equal(flow.snapshot().navigation, null);
    assert.ok(flow.snapshot().message);
  }
});
test('adapter validation exception fails closed and releases busy', async () => {
  const adapter = adapterFor(); adapter.isValid = () => { throw new Error('unavailable'); };
  const flow = createAuthFlow(adapter); await flow.login({});
  assert.equal(flow.snapshot().session, null); assert.equal(flow.snapshot().busy, false);
});
test('navigation intent is not replayed by hash/session revalidation', () => {
  const flow = createAuthFlow(adapterFor()); flow.recovery();
  assert.equal(flow.snapshot().navigation.target, 'P14');
  flow.enforceSession(); assert.equal(flow.snapshot().navigation, null);
});
test('same-screen logout signals input reset even without a screen transition', () => {
  const flow = createAuthFlow(adapterFor());
  const previous = flow.snapshot().credentialEpoch;
  flow.logout(); assert.equal(flow.snapshot().credentialEpoch, previous + 1);
});
test('local logout clears protected state even if adapter cleanup throws', async () => {
  const adapter = adapterFor(); const flow = createAuthFlow(adapter); await flow.login({});
  adapter.logout = () => { throw new Error('cleanup failed'); };
  flow.logout(); assert.equal(flow.snapshot().session, null); assert.equal(flow.snapshot().screen, 'login');
  assert.ok(flow.snapshot().message);
});
