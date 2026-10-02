// Activate stylesheet slots that already exist in auth-session/index.html.
// Keeping the slots in their original DOM order preserves the cascade while
// media="not all" prevents secondary-screen CSS from blocking P01.
const STYLE_TIMEOUT_MS = 10000;
const pending = new Map();

function slotFor(href) {
  return [...document.head.querySelectorAll('link[data-hn-deferred-style]')]
    .find(link => link.getAttribute('data-hn-deferred-style') === href);
}

function replaceFailedSlot(link, href) {
  const replacement = document.createElement('link');
  replacement.rel = 'stylesheet';
  replacement.href = href;
  replacement.media = 'not all';
  replacement.dataset.hnDeferredStyle = href;
  link.replaceWith(replacement);
  return replacement;
}

function loadOne(href) {
  if (typeof document === 'undefined') return Promise.resolve();
  if (pending.has(href)) return pending.get(href);
  let link = slotFor(href);
  if (!link) return Promise.reject(new Error(`Missing deferred stylesheet slot: ${href}`));
  if (link.dataset.hnDeferredState === 'error') link = replaceFailedSlot(link, href);

  const promise = new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error = null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      link.removeEventListener('load', onLoad);
      link.removeEventListener('error', onError);
      if (error) {
        link.media = 'not all';
        link.dataset.hnDeferredState = 'error';
        reject(error);
      } else {
        link.dataset.hnDeferredState = 'ready';
        resolve();
      }
    };
    const onLoad = () => finish();
    const onError = () => finish(new Error(`Deferred stylesheet failed: ${href}`));
    const timer = setTimeout(() => finish(new Error(`Deferred stylesheet timed out: ${href}`)), STYLE_TIMEOUT_MS);
    link.addEventListener('load', onLoad, { once: true });
    link.addEventListener('error', onError, { once: true });
    link.media = 'all';
    // A cached stylesheet can have a sheet immediately without firing a new
    // load event after a retry. Treat it as ready only after activation.
    if (link.sheet) queueMicrotask(() => finish());
  }).finally(() => pending.delete(href));
  pending.set(href, promise);
  return promise;
}

export function loadDeferredStyles(styles) {
  if (styles == null) styles = typeof document === 'undefined' ? [] : [...document.head.querySelectorAll('link[data-hn-deferred-style]')].map(link => link.dataset.hnDeferredStyle);
  return Promise.all(styles.map(loadOne));
}
