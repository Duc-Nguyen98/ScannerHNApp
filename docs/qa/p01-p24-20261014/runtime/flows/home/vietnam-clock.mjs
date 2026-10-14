// Vietnam time formatter. The live display never changes a confirmed shift receipt.
const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
export const vietnamTime = instant => formatter.format(new Date(instant));

export function syncLiveClock(node, now = Date.now()) {
  if (!node) return;
  const stamp = new Date(now).toISOString();
  const label = vietnamTime(now);
  if (node.getAttribute('datetime') !== stamp) node.setAttribute('datetime', stamp);
  if (node.textContent !== label) node.textContent = label;
}

// Timer belongs to the retained Home view; stop on hidden/suspended/disposed.
export function createLiveClock({ getNode, isActive, now = Date.now, schedule = setTimeout, cancel = clearTimeout }) {
  let timer = null, disposed = false;
  const stop = () => { if (timer !== null) cancel(timer); timer = null; };
  function sync() {
    stop();
    if (disposed || !isActive()) return;
    const instant = now();
    syncLiveClock(getNode(), instant);
    timer = schedule(sync, 1000 - instant % 1000);
  }
  return { sync, dispose() { disposed = true; stop(); } };
}

// Update the retained Home view from the current confirmed receipt, not wall time.
export function syncShiftClock(node, instant) {
  if (!node) return;
  const valid = typeof instant === 'string' && Number.isFinite(Date.parse(instant));
  const stamp = valid ? instant : '';
  if (node.getAttribute('datetime') !== stamp) node.setAttribute('datetime', stamp);
  const label = valid ? vietnamTime(instant) : '—';
  if (node.textContent !== label) node.textContent = label;
}

