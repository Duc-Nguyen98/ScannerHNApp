const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const base = process.env.BASELINE_URL || 'http://127.0.0.1:8766/review/';
const output = path.resolve(process.env.BASELINE_OUTPUT || 'docs/performance/baseline.json');
const routes = [
  { name: 'review-home', url: '?view=review&panel=P01.S01&motion=off' },
  { name: 'review-deep', url: '?view=review&panel=P24.S04&motion=off' },
];

async function measure(browser, route) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 }, reducedMotion: 'reduce', timezoneId: 'Asia/Ho_Chi_Minh' });
  const page = await context.newPage();
  const requests = [];
  const failures = [];
  page.on('request', req => requests.push({ url: req.url(), method: req.method(), resourceType: req.resourceType() }));
  page.on('response', res => { if (res.status() >= 400) failures.push({ url: res.url(), status: res.status() }); });
  const start = performance.now();
  await page.goto(base + route.url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(id => document.querySelector('#status')?.textContent?.startsWith('Đã mở '), null, { timeout: 55000 });
  const ready = performance.now();
  await page.waitForLoadState('networkidle', { timeout: 55000 }).catch(() => {});
  const done = performance.now();
  const byteResults = await Promise.all(requests.map(async item => {
    try {
      const response = await page.request.get(item.url);
      return Number(response.headers()['content-length'] || 0);
    } catch { return 0; }
  }));
  const result = {
    name: route.name,
    url: base + route.url,
    openedMs: Math.round(ready - start),
    networkIdleMs: Math.round(done - start),
    requests: requests.length,
    bytesFromContentLength: byteResults.reduce((a, b) => a + b, 0),
    resourceTypes: requests.reduce((acc, r) => ((acc[r.resourceType] = (acc[r.resourceType] || 0) + 1), acc), {}),
    failures,
  };
  await context.close();
  return result;
}

(async () => {
  const stat = fs.statSync(path.resolve('docs/review/index.html'));
  const catalog = JSON.parse(fs.readFileSync(path.resolve('docs/review/catalog.json'), 'utf8'));
  const browser = await chromium.launch();
  try {
    const cold = [];
    for (const route of routes) cold.push(await measure(browser, route));
    const warm = [];
    for (const route of routes) warm.push(await measure(browser, route));
    const result = {
      measuredAt: new Date().toISOString(),
      platform: process.platform,
      node: process.version,
      browser: 'Playwright Chromium',
      viewport: '1440x950',
      networkProfile: 'localhost, browser default cache disabled per new context',
      dataset: { catalogPanels: catalog.panels.length, indexBytes: stat.size },
      cold,
      warm,
      limitations: [
        'Static preview only; no production API, database, queue, Valkey, CDN or load balancer was reachable.',
        'Content-Length is reported only where the local server provides it; it is not a wire-byte capture.',
        'No native camera/NFC or durable mobile storage was measured.',
      ],
    };
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify(result, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
