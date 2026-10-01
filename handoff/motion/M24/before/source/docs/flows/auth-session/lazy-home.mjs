// UI module loading only. This controller never authenticates or starts a shift.
export function createLazyHome(importModule, onChange = () => {}) {
  let epoch = 0, attempt = 0, status = 'idle', module = null, pending = null;
  const snapshot = () => ({ status, module });
  function reset() {
    epoch++;
    pending = null;
    status = module ? 'ready' : 'idle';
  }
  function load() {
    if (status === 'ready') return Promise.resolve(module);
    if (pending) return pending;
    const ticket = ++epoch;
    status = 'loading';
    pending = Promise.resolve().then(() => ticket === epoch ? importModule(++attempt) : null).then(result => {
      if (ticket !== epoch) return null;
      if (typeof result?.mountHome !== 'function') throw new Error('Home module unavailable');
      module = result; status = 'ready'; pending = null; onChange(); return module;
    }).catch(() => {
      if (ticket !== epoch) return null;
      status = 'error'; pending = null; onChange(); return null;
    });
    onChange();
    return pending;
  }
  return { snapshot, load, reset };
}
