// Vietnam time formatter for confirmed timestamps. No live timer or WMS synchronization.
const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
export const vietnamTime = instant => formatter.format(new Date(instant));

// Update the retained Home view from the current confirmed receipt, not wall time.
export function syncShiftClock(node, instant) {
  if (!node) return;
  const valid = typeof instant === 'string' && Number.isFinite(Date.parse(instant));
  const stamp = valid ? instant : '';
  if (node.getAttribute('datetime') !== stamp) node.setAttribute('datetime', stamp);
  const label = valid ? vietnamTime(instant) : '—';
  if (node.textContent !== label) node.textContent = label;
}

