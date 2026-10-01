const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the real prototype functions without browser bootstrap. This small
// DOM adapter checks state/render output; native layout/keyboard need browser QA.
const source = fs.readFileSync(path.join(__dirname, '../docs/flows/warranty-components/flow.js'), 'utf8');
assert.match(source, /renderApp\(\);\s*$/);
function setup(scene = 'history', saved = null) {
  const writes = [];
  const routes = [];
  const listeners = {};
  const document = {
    body: {}, activeElement: null,
    addEventListener(type, fn) { listeners[type] = fn; },
    querySelectorAll() { return []; },
  };
  const ctx = vm.createContext({
    document, location: { search: '?mode=screen&scene=' + scene },
    history: { replaceState(_a, _b, url) { routes.push(url); } },
    localStorage: {
      getItem() { return saved == null ? null : JSON.stringify(saved); },
      setItem(...args) { writes.push(args); },
    },
    URLSearchParams, structuredClone, setTimeout,
    fetch() { throw new Error('Unexpected network request'); },
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../docs/flows/shared/history-fixtures.js'), 'utf8'), ctx);
  vm.runInContext(source.replace(/renderApp\(\);\s*$/, '') + `\nthis.api = {
    newState, renderPhone, go, loadMoreHistory, historyView,
    readHistoryFixturePage, isHistoryFixtureDocument, HISTORY_FIXTURES
  };`, ctx);
  const api = ctx.api;
  const state = api.newState(scene);
  let markup = '';
  let nodes;
  const element = (end = false) => ({
    disabled: false, textContent: '', tabIndex: undefined, dataset: {},
    classList: { contains(name) { return end && name === 'end-list'; } },
    setAttribute() {},
    focus() { document.activeElement = this; },
  });
  const node = {
    dataset: {}, isConnected: true,
    set innerHTML(value) {
      markup = value;
      nodes = {
        '.body': { scrollTop: 0 },
        '.history-block': { setAttribute(name, value) { this[name] = value; } },
      };
      if (value.includes('data-action="load-more"')) {
        const button = element();
        button.dataset.action = 'load-more';
        button.closest = (selector) => selector === '.phone' ? node : button;
        nodes['[data-action="load-more"]'] = button;
      }
      if (value.includes('class="end-list"')) nodes['.end-list'] = element(true);
      document.activeElement = document.body;
    },
    get innerHTML() { return markup; },
    querySelector(selector) { return nodes[selector] || null; },
  };
  api.renderPhone(node, state);
  const clickAction = (action) => {
    const button = { disabled: false, dataset: { action }, closest: () => node };
    listeners.click({ target: { closest: () => button } });
  };
  return { api, state, node, document, writes, routes, clickAction,
    button: () => node.querySelector('[data-action="load-more"]') };
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((a, b) => { resolve = a; reject = b; });
  return { promise, resolve, reject };
}
const ids = (s) => Array.from(s.historyDocs, d => d.id);

test('pending read is single-flight; final page deduplicates and keeps current scroll', async () => {
  const t = setup(); const d = deferred(); let calls = 0;
  const reader = () => { calls++; return d.promise; };
  const button = t.button(); t.document.activeElement = button;
  t.node.querySelector('.body').scrollTop = 18;
  const first = t.api.loadMoreHistory(t.node, t.state, button, reader);
  await t.api.loadMoreHistory(t.node, t.state, button, reader);
  assert.equal(calls, 1); assert.equal(button.disabled, true);
  assert.equal(button.textContent, 'Đang tải thêm…');
  assert.equal(t.node.querySelector('.history-block')['aria-busy'], 'true');
  assert.deepEqual(ids(t.state), ['XLK-0002']);
  t.node.querySelector('.body').scrollTop = 24;
  d.resolve(t.api.HISTORY_FIXTURES); await first;
  assert.deepEqual(ids(t.state), ['XLK-0002', 'XLK-0001', 'XLK-0000']);
  assert.equal(t.state.hasMore, false); assert.equal(t.state.loading, false);
  assert.equal(t.node.querySelector('.body').scrollTop, 24);
  assert.match(t.node.innerHTML, /3 phiếu đã tải/);
  assert.match(t.node.innerHTML, /Đã hiển thị hết phiếu đã xuất/);
  assert.equal(t.button(), null);
  assert.equal(t.document.activeElement, t.node.querySelector('.end-list'));
  assert.deepEqual(t.writes, []);
});

test('read failure preserves data, enables retry, and retry succeeds without a write', async () => {
  const t = setup(); const before = JSON.stringify(t.state.historyDocs);
  t.node.querySelector('.body').scrollTop = 19;
  const button = t.button(); t.document.activeElement = button;
  await t.api.loadMoreHistory(t.node, t.state, button, () => Promise.reject(new Error('fixture')));
  assert.equal(JSON.stringify(t.state.historyDocs), before);
  assert.equal(t.state.hasMore, true); assert.equal(t.state.loading, false);
  assert.equal(t.state.scene, 'history-error');
  assert.match(t.routes.at(-1), /scene=history-error$/);
  assert.match(t.node.innerHTML, /Phiếu đã tải vẫn được giữ lại/);
  assert.equal(t.node.querySelector('.body').scrollTop, 19);
  assert.equal(t.button().disabled, false); assert.equal(t.document.activeElement, t.button());
  await t.api.loadMoreHistory(t.node, t.state, t.button(), () => Promise.resolve(t.api.HISTORY_FIXTURES));
  assert.equal(t.state.historyError, false); assert.equal(t.state.scene, 'history');
  assert.match(t.routes.at(-1), /scene=history$/);
  assert.deepEqual(ids(t.state), ['XLK-0002', 'XLK-0001', 'XLK-0000']);
  assert.deepEqual(t.writes, []);
});

test('invalid fixture page does not partially update data or claim completion', async () => {
  const t = setup(); const before = JSON.stringify(t.state.historyDocs);
  const page = structuredClone(t.api.HISTORY_FIXTURES); page[2].lines[0].quantity = 0;
  await t.api.loadMoreHistory(t.node, t.state, t.button(), () => Promise.resolve(page));
  assert.equal(JSON.stringify(t.state.historyDocs), before);
  assert.equal(t.state.hasMore, true); assert.equal(t.state.scene, 'history-error');
});

test('navigation away and back invalidates old completion without cancelling a newer read', async () => {
  const t = setup(); const old = deferred(); const fresh = deferred();
  const p1 = t.api.loadMoreHistory(t.node, t.state, t.button(), () => old.promise);
  t.api.go(t.node, 'history-hub');
  assert.equal(t.state.loading, false);
  t.api.go(t.node, 'history');
  const p2 = t.api.loadMoreHistory(t.node, t.state, t.button(), () => fresh.promise);
  old.resolve(t.api.HISTORY_FIXTURES); await p1;
  assert.deepEqual(ids(t.state), ['XLK-0002']); assert.equal(t.state.loading, true);
  fresh.resolve(t.api.HISTORY_FIXTURES); await p2;
  assert.equal(t.state.hasMore, false); assert.equal(t.state.loading, false);
});

test('late rejection after Back never replaces the destination scene', async () => {
  const t = setup(); const d = deferred();
  const p = t.api.loadMoreHistory(t.node, t.state, t.button(), () => d.promise);
  t.clickAction('history-hub'); const before = t.node.innerHTML;
  d.reject(new Error('late fixture')); await p;
  assert.equal(t.state.scene, 'history-hub'); assert.equal(t.node.innerHTML, before);
  assert.deepEqual(t.writes, []);
});

test('detached preview cannot be repainted by a stale read', async () => {
  const t = setup(); const d = deferred();
  const p = t.api.loadMoreHistory(t.node, t.state, t.button(), () => d.promise);
  t.node.isConnected = false; const before = t.node.innerHTML;
  d.resolve(t.api.HISTORY_FIXTURES); await p;
  assert.equal(t.node.innerHTML, before); assert.deepEqual(ids(t.state), ['XLK-0002']);
  assert.equal(t.state.loading, false);
});

test('closed case stays read-only after failure and successful retry', async () => {
  const t = setup('closed');
  await t.api.loadMoreHistory(t.node, t.state, t.button(), () => Promise.reject(new Error('fixture')));
  assert.equal(t.state.scene, 'closed'); assert.match(t.node.innerHTML, /Thử tải lại/);
  assert.doesNotMatch(t.node.innerHTML, /data-action="new-issue"/);
  await t.api.loadMoreHistory(t.node, t.state, t.button(), () => Promise.resolve(t.api.HISTORY_FIXTURES));
  assert.equal(t.state.scene, 'closed');
  assert.doesNotMatch(t.node.innerHTML, /data-action="new-issue"/);
  assert.match(t.node.innerHTML, /Đã hiển thị hết/);
});

test('empty and static loading scenes do not start a read', async () => {
  for (const scene of ['empty', 'history-loading']) {
    const t = setup(scene); let calls = 0;
    await t.api.loadMoreHistory(t.node, t.state, {}, () => { calls++; return Promise.resolve([]); });
    assert.equal(calls, 0); assert.equal(t.button(), null);
    if (scene === 'empty') { assert.match(t.node.innerHTML, /0 phiếu đã tải/); assert.doesNotMatch(t.node.innerHTML, /class="issue-document"/); }
  }
});

test('history fixture fields are valid and text is escaped in rendered documents', () => {
  const t = setup(); assert.ok(t.api.HISTORY_FIXTURES.every(t.api.isHistoryFixtureDocument));
  t.state.historyDocs[0].lines[0].name = '<img src=x onerror=alert(1)>';
  const html = t.api.historyView(t.state);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<img src=x/);
});

test('new issue preserves saved-document routing without recording history', () => {
  for (const [checkpoint, phase, expected] of [
    ['UNKNOWN', 'NOT_STARTED', 'reconcile'], ['VERIFIED', 'SENT', 'post-check'],
    ['VERIFIED', 'NOT_STARTED', 'resume'], ['VERIFIED', 'CONFIRMED', 'scan'],
  ]) {
    const saved = { schema: 1, documentId: 'XLK-SAVED', draft: [{ code: 'SAVED', quantity: 1 }], recordedCodes: [], postPhase: phase, scanCheckpoint: checkpoint };
    const t = setup('history', saved); t.clickAction('new-issue');
    assert.equal(t.state.scene, expected);
    if (expected !== 'scan') assert.equal(t.state.documentId, 'XLK-SAVED');
    assert.deepEqual(t.writes, []);
  }
});
