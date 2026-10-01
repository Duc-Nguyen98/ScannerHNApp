import test from 'node:test';
import assert from 'node:assert/strict';
import { createDialogFixtureAdapter } from '../docs/flows/scanner-dialogs/fixture-adapter.mjs';
import { createDialogFlow } from '../docs/flows/scanner-dialogs/dialog-flow.mjs';
import { resolveNavigation } from '../docs/flows/home/home-flow.mjs';

function setup(options = {}) {
  let sessionState = { previewReady: true, startUnknown: false, session: { actor: { id: 'fixture-minhanh' }, warehouse: { id: 'fixture-hoa-nam', active: true }, permissions: { warehouseOperations: true } } };
  const adapter = createDialogFixtureAdapter({ delay: 0 });
  const navigations = [];
  const flow = createDialogFlow({ adapter, getState: () => sessionState, onNavigate: nav => navigations.push(nav), ...options });
  const load = (kind = 'local') => { flow.loadFixtureDocument(adapter.makeDocument(sessionState, kind)); flow.openUnfinished(); return flow.snapshot().document; };
  return { adapter, flow, load, navigations, state: () => sessionState, setState: value => { sessionState = value; } };
}
test('P03 operation chooser has no default and passes exact operation/actor/warehouse', () => {
  for (const [operation, target] of [['inbound', 'P04'], ['outbound', 'P05'], ['warranty', 'P09'], ['lookup', 'P06']]) {
    const { flow, navigations } = setup(); flow.openPicker();
    assert.equal(navigations.length, 0); assert.equal(flow.choose('__proto__'), false);
    assert.equal(flow.choose(operation), true);
    assert.equal(navigations[0].target, target); assert.equal(navigations[0].context.operation, operation);
    assert.equal(navigations[0].context.actorId, 'fixture-minhanh');
    assert.equal(navigations[0].context.warehouseId, 'fixture-hoa-nam');
  }
});
test('Resume retains exact document, scan session, version and codes', () => {
  const { load, flow, navigations } = setup(); const original = load(); flow.resume();
  const context = navigations[0].context;
  for (const key of ['documentId', 'scanSessionId', 'version', 'codes']) assert.deepEqual(context[key], original[key]);
  assert.deepEqual(flow.snapshot().document, original);
});
test('Unfinished document precedes picker and close/cancel never discards it', () => {
  const { flow, load } = setup(); const original = load();
  flow.cancel(); flow.openPicker(); assert.equal(flow.snapshot().panel, 'P03.S02');
  flow.requestDiscard(); assert.equal(flow.snapshot().panel, 'P03.S04');
  assert.equal(flow.cancel('backdrop'), false); flow.cancel('escape');
  assert.equal(flow.snapshot().panel, 'P03.S02'); assert.deepEqual(flow.snapshot().document, original);
});

test('Backdrop is a no-op on every panel, including failed and UNKNOWN saves', async () => {
  for (const kind of ['picker', 'local', 'discard', 'stopped', 'failed', 'unknown']) {
    const { flow, load, adapter, navigations } = setup();
    if (kind === 'picker') flow.openPicker();
    else if (kind === 'stopped') flow.showStopped();
    else {
      load();
      if (kind === 'discard') flow.requestDiscard();
      if (['failed', 'unknown'].includes(kind)) { adapter.setSaveOutcome(kind); await flow.save(); }
    }
    const original = flow.snapshot();
    for (let i = 0; i < 3; i++) assert.equal(flow.cancel('backdrop'), false);
    assert.deepEqual(flow.snapshot(), original);
    assert.equal(navigations.length, 0);
  }
});

test('Explicit footer navigation preserves document/UNKNOWN and rejects invalid or busy navigation', async () => {
  const { flow, load, adapter } = setup();
  const original = load('unknown');
  assert.equal(flow.dismissForMenu('inbound'), false);
  for (const key of ['home', 'documents', 'history', 'profile']) {
    flow.openUnfinished();
    assert.equal(flow.dismissForMenu(key), true);
    assert.equal(flow.snapshot().panel, null);
    assert.deepEqual(flow.snapshot().document, original);
    assert.equal(flow.snapshot().saveUnknown, true);
  }
  assert.equal(flow.dismissForMenu('lookup'), true);
  assert.equal(flow.snapshot().panel, 'P03.S02');
  const clean = setup(); clean.load();
  let settle;
  clean.adapter.saveDraft = () => new Promise(resolve => { settle = resolve; });
  const saving = clean.flow.save();
  const busyState = clean.flow.snapshot();
  for (const key of ['home', 'documents', 'lookup', 'history', 'profile']) assert.equal(clean.flow.dismissForMenu(key), false);
  assert.deepEqual(clean.flow.snapshot(), busyState);
  settle({ kind: 'failed' }); await saving;
});
test('Only confirmed discard removes permitted unsaved local fixture; other namespaces untouched', () => {
  const { flow, load } = setup(); load();
  assert.equal(flow.confirmDiscard(), false); flow.requestDiscard(); assert.equal(flow.confirmDiscard(), true);
  assert.equal(flow.snapshot().document, null);
});
test('Server-recorded, posted, uncertain, saved and foreign documents cannot be discarded', async () => {
  for (const kind of ['server', 'posted', 'unknown']) {
    const { flow, load } = setup(); const original = load(kind); flow.requestDiscard();
    assert.equal(flow.confirmDiscard(), false); assert.deepEqual(flow.snapshot().document, original);
  }
  const { flow, load, adapter, state } = setup(); load(); await flow.save();
  flow.openUnfinished(); flow.requestDiscard(); assert.equal(flow.confirmDiscard(), false);
  const foreign = adapter.makeDocument(state()); foreign.actorId = 'different-actor';
  assert.equal(flow.loadFixtureDocument(foreign), false);
  foreign.actorId = state().session.actor.id; foreign.namespace = 'live-data';
  assert.equal(flow.loadFixtureDocument(foreign), false);
});
test('Save waits for receipt, rejects double submit and blocks dismiss while saving', async () => {
  const { adapter, flow, load, navigations } = setup(); const original = load();
  let settle; let calls = 0;
  adapter.saveDraft = () => { calls++; return new Promise(resolve => { settle = resolve; }); };
  const saving = flow.save(); await flow.save();
  assert.equal(calls, 1); assert.equal(navigations.length, 0); assert.equal(flow.cancel(), false);
  assert.equal(flow.snapshot().panel, 'P03.S02'); assert.equal(flow.snapshot().busy, true);
  settle({ kind: 'fixture-saved', document: { ...original, unsaved: false } }); await saving;
  assert.equal(flow.snapshot().panel, null); assert.equal(navigations[0].target, 'P02');
  assert.equal(flow.snapshot().document.unsaved, false);
});
test('Failed save retains data and permits explicit retry', async () => {
  const { flow, load, adapter } = setup(); const original = load();
  adapter.setSaveOutcome('failed'); await flow.save();
  assert.deepEqual(flow.snapshot().document, original); assert.equal(flow.snapshot().panel, 'P03.S02');
  adapter.setSaveOutcome('confirmed'); await flow.save(); assert.equal(flow.snapshot().document.unsaved, false);
});
test('Timeout retains data and prevents blind retry/discard; late receipt is reconciled', async () => {
  const { flow, adapter, load, navigations } = setup({ timeoutMs: 5 }); const original = load();
  let resolve; let receipt; let calls = 0;
  adapter.saveDraft = () => { calls++; return new Promise(done => { resolve = done; }); };
  adapter.checkSave = async () => receipt || { kind: 'unknown' };
  await flow.save(); assert.equal(flow.snapshot().saveUnknown, true);
  assert.deepEqual(flow.snapshot().document, original); assert.equal(navigations.length, 0);
  await flow.save(); assert.equal(calls, 1);
  flow.requestDiscard(); assert.equal(flow.confirmDiscard(), false); flow.cancel();
  assert.equal(flow.resume(), false);
  receipt = { kind: 'fixture-saved', document: { ...original, unsaved: false } }; resolve(receipt);
  await flow.checkSave(); assert.equal(flow.snapshot().document.unsaved, false); assert.equal(navigations.length, 1);
});
test('Mismatched save receipt never exits or overwrites document', async () => {
  const { flow, adapter, load } = setup(); const original = load();
  adapter.saveDraft = async () => ({ kind: 'fixture-saved', document: { ...original, documentId: 'PN-OTHER' } });
  await flow.save(); assert.equal(flow.snapshot().saveUnknown, true); assert.deepEqual(flow.snapshot().document, original);
  assert.equal(flow.snapshot().panel, 'P03.S02');
});
test('A receipt from an earlier fixture scan session cannot resolve a different uncertain document', async () => {
  const { flow, load } = setup(); load(); await flow.save();
  const next = load('unknown'); await flow.checkSave();
  assert.equal(flow.snapshot().saveUnknown, true); assert.deepEqual(flow.snapshot().document, next);
});
test('Warehouse stop/unknown guards handlers and cannot be dismissed to bypass writes', async () => {
  for (const status of [false, null]) {
    const { flow, adapter, load, navigations } = setup(); const original = load(); adapter.setWarehouse(status);
    await flow.save(); assert.equal(flow.snapshot().panel, 'P03.S03');
    assert.equal(flow.cancel('escape'), false); assert.equal(flow.cancel('backdrop'), false);
    flow.home(); assert.equal(flow.snapshot().document.documentId, original.documentId);
    flow.openUnfinished(); assert.equal(flow.resume(), false);
    flow.home(); flow.openUnfinished(); flow.requestDiscard(); assert.equal(flow.confirmDiscard(), false);
    assert.ok(navigations.every(nav => nav.kind === 'home'));
    assert.deepEqual(flow.snapshot().document, original);
  }
});
test('Stopped warehouse preserves established session/read-only Home/history/lookup, P01 start remains required', () => {
  const { flow, adapter, state } = setup(); state().session.warehouse.active = false;
  assert.equal(resolveNavigation('home', null, state()).kind, 'home');
  assert.equal(resolveNavigation('history', null, state()).kind, 'available');
  for (const key of ['inbound', 'outbound']) assert.equal(resolveNavigation(key, null, state()).kind, 'warehouse-stopped');
  assert.equal(resolveNavigation('nfc', null, state()).kind, 'pending'); // P07 inspection/reconciliation; writes remain guarded.
  assert.equal(resolveNavigation('warranty', null, state()).kind, 'pending'); // Read-only case route; P09 handlers still guard writes.
  flow.openPicker(); assert.equal(flow.choose('inbound'), false);
  flow.home(); flow.openPicker(); assert.equal(flow.choose('warranty'), false); // Scanner intake is still a write entry.
  flow.home(); flow.openPicker(); assert.equal(flow.choose('lookup'), true);
  state().previewReady = false; assert.equal(resolveNavigation('home', null, state()).kind, 'blocked');
  adapter.setWarehouse(true); assert.equal(flow.writeGuard(), false);
});
test('No configured contact is fabricated; configured channel is returned for user action only', () => {
  const { flow, adapter } = setup(); flow.showStopped(); assert.equal(flow.contact(), null);
  adapter.contactChannel = { href: 'javascript:alert(1)', label: 'invalid' }; assert.equal(flow.contact(), null);
  adapter.contactChannel = { href: 'https://example.test/configured', label: 'Configured test channel' };
  assert.deepEqual(flow.contact(), adapter.contactChannel);
});
test('Auth loss and dispose prevent asynchronous save completion navigating into previous session', async () => {
  for (const dispose of [false, true]) {
    const { flow, load, adapter, setState, navigations } = setup(); const original = load(); let resolve;
    adapter.saveDraft = () => new Promise(done => { resolve = done; });
    const saving = flow.save();
    if (dispose) flow.dispose(); else setState({ session: null });
    resolve({ kind: 'fixture-saved', document: original }); await saving;
    assert.equal(navigations.length, 0);
  }
});
