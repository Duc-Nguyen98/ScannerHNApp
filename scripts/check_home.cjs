const auditOrigin=process.env.PREVIEW_ORIGIN||'http://127.0.0.1:8766';
const previewBase=process.env.PREVIEW_BASE_URL||'http://127.0.0.1:8766';
// P02 browser integration and render evidence. Uses bundled Playwright; no installs.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const out = path.resolve(process.env.HOME_EVIDENCE_DIR || 'handoff/P02/evidence');
fs.mkdirSync(out, { recursive: true });
const base = previewBase;
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 494, height: 950 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__cameraRequests = 0;
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { window.__cameraRequests++; throw new Error('Hardware not used by Home test'); };
  });
  const errors = [], requests = [], checks = [], metrics = [];
  page.on('pageerror', error => errors.push(error.message));
  // P05 r07 already authorizes read-only geography; keep rejecting all other external requests.
  page.on('request', request => { if (!request.url().startsWith(base) && !request.url().startsWith('data:') && !(request.method() === 'GET' && request.url().startsWith('https://provinces.open-api.vn/api/v1/'))) requests.push(request.url()); });
  async function check(label, callback) { await callback(); checks.push({ label, status: 'PASS' }); }
  async function login(scenario = 'valid') {
    await page.goto(`${base}/flows/auth-session/`);
    await page.locator('#username').waitFor();
    if (scenario !== 'valid') { await page.locator('summary').click(); await page.selectOption('#scenario', scenario); }
    await page.fill('#username', 'minhanh'); await page.fill('#password', 'preview');
    await page.click('#submit'); await page.locator('#start').waitFor();
    if (await page.locator('#start').isEnabled()) await page.click('#start');
  }
  async function home() { await page.locator('#hn-home').waitFor({ state: 'visible' }); }
  async function capture(name) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(out, `${name}.png`) });
    metrics.push(await page.evaluate(name => {
      const rect = sel => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
      return { name, viewport: { width: innerWidth, height: innerHeight }, dpr: devicePixelRatio, zoom: visualViewport.scale,
        font: getComputedStyle(document.querySelector('#home-app')).fontFamily,
        scrollWidth: document.documentElement.scrollWidth,
        hero: rect('.hn-hero'), kpi: rect('.hn-kpis'), grid: rect('.hn-tasks'), scanner: rect('.hn-scanner'), recent: rect('.hn-recent-list'), nav: rect('.hn-nav') };
    }, name));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, name + ' horizontal overflow');
    const fitted = await page.evaluate(() => {
      const screen = document.querySelector('.hn-screen').getBoundingClientRect();
      const tools = document.querySelector('.hn-tools').getBoundingClientRect();
      const row = document.querySelector('.hn-record:last-child')?.getBoundingClientRect();
      const nav = document.querySelector('.hn-nav').getBoundingClientRect();
      return { top: screen.top, bottom: screen.bottom, viewport: innerHeight,
        toolsOutside: tools.left >= screen.right || tools.top >= screen.bottom,
        lastRowClear: !row || row.bottom <= nav.top,
        scale: getComputedStyle(document.querySelector('.hn-screen')).transform };
    });
    assert.ok(fitted.top >= -1 && fitted.bottom <= fitted.viewport + 1, name + ' full design fits viewport');
    assert.ok(fitted.toolsOutside, name + ' prototype controls outside app');
    assert.ok(fitted.lastRowClear, name + ' recent documents not covered by nav');
    metrics.at(-1).fittedPreview = fitted;
  }
  try {
    await check('Unauthenticated direct P02 route returns to P01', async () => {
      await page.goto(`${base}/flows/auth-session/#p02/inbound?id=PN-0001`);
      await page.locator('#username').waitFor();
      assert.equal(await page.locator('#hn-home').count(), 0);
      assert.equal(new URL(page.url()).hash, '#login');
    });
    await check('P01 login → confirmation → P02 uses existing session', async () => { await login(); await home(); assert.match(await page.locator('.hn-intro h1').textContent(), /Minh Anh/); });
    for (const [width, height] of [[494, 950], [360, 800], [430, 932], [1440, 900], [1264, 712]]) {
      await page.setViewportSize({ width, height });
      await capture(`P02-S01-${width}`);
    }
    await page.setViewportSize({ width: 360, height: 800 });
    await check('All recent rows remain above the navigation within the fitted app screen', async () => {
      await page.locator('.hn-record:last-child').scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, 110));
      const row = await page.locator('.hn-record:last-child').boundingBox();
      const nav = await page.locator('.hn-nav').boundingBox();
      assert.ok(row.y + row.height <= nav.y);
    });
    await check('Xem tất cả opens P12 documents; native Back preserves Home scroll/focus/tab', async () => {
      const button = page.getByRole('button', { name: 'Xem tất cả' });
      await button.focus();
      const before = await page.evaluate(() => scrollY);
      await button.click();
      await page.locator('[data-panel="P12.S01"]').waitFor();
      assert.equal(new URL(page.url()).hash, '#p02/documents?panel=1&entry=home-recent');
      assert.equal(await page.locator('[data-tab="documents"]').getAttribute('aria-current'), 'page');
      await page.screenshot({ path: path.join(out, 'documents-connected.png') });
      await page.goBack(); await home();
      assert.ok(Math.abs((await page.evaluate(() => scrollY)) - before) < 2);
      assert.equal(await page.locator('[data-tab="home"]').getAttribute('aria-current'), 'page');
      assert.equal(await button.evaluate(node => node === document.activeElement), true);
    });
    await check('Existing hub exit returns to the same Home, without modifying hub source', async () => {
      await page.locator('[data-tab="history"]').click();
      await page.frameLocator('iframe').getByRole('button', { name: 'Về Trang chủ', exact: true }).click();
      await home();
    });
    await check('Every task, scanner CTA, bell, avatar and nav resolves correct implemented or pending target', async () => {
      // P03 now owns the generic scan tab; dedicated four-operation tests are in check_dialogs.cjs.
      for (const [selector, prompt] of [['.hn-task[data-route="inbound"]', 'P04'], ['.hn-task[data-route="outbound"]', 'P05'], ['.hn-task[data-route="warranty"]', 'P09'], ['.hn-task[data-route="nfc"]', 'P07'], ['.hn-scanner', 'P06'], ['.hn-bell', 'P13'], ['.hn-avatar', 'P10'], ['[data-tab="documents"]', 'P12'], ['[data-tab="profile"]', 'P10']]) {
        await page.locator(selector).click();
        if (['P04','P05','P06','P07','P09','P10','P12'].includes(prompt)) {
          await page.locator(`[data-panel="${prompt}.S01"]`).waitFor();
          if(['P07','P10'].includes(prompt))await page.locator('[data-tab="home"]').click();else await page.locator(`[data-${prompt.toLowerCase()}="back"]`).click();
        } else {
          assert.match(await page.locator('#hn-destination [role="status"]').textContent(), new RegExp(prompt + ' chưa có'));
          await page.locator('[data-return]').click();
        }
        await home();
      }
    });
    await check('Recent rows open exact P12 document IDs and return to Home', async () => {
      const rows = await page.locator('[data-recent-document]').evaluateAll(ns=>ns.map(n=>({id:n.dataset.recentDocument,number:n.dataset.id})));
      for (const row of rows) {
        await page.locator(`[data-recent-document="${row.id}"]`).click();
        await page.locator('[data-panel="P12.S02"]').waitFor();
        assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('doc'),row.id);
        assert.match(await page.locator('.p12-context').textContent(),new RegExp(row.number));
        await page.locator('[data-p12=back]').click();await home();
      }
    });
    await page.locator('.hn-tools > details:not(.p03-tools):not(.p04-tools):not(.p05-tools):not(.p06-tools) summary').click();
    await check('Long name + five digit badge responsive without overflow', async () => {
      await page.selectOption('#hn-scenario', 'long');
      assert.match(await page.locator('.hn-count').textContent(), /12345/);
      await capture('P02-long-name-360');
    });
    await check('Unknown adapter does not display mock KPI as live results', async () => {
      await page.selectOption('#hn-scenario', 'unknown');
      assert.equal(await page.locator('.hn-kpis .hn-unknown').count(), 2);
      assert.match(await page.locator('[data-shift-start]').textContent(), /^\d{2}:\d{2}:\d{2}$/);
      assert.equal(await page.locator('.hn-record').count(), 0);
      await capture('P02-unknown-360');
    });
    await page.selectOption('#hn-scenario', 'baseline');
    await check('Keyboard focus and Enter open route; Home never starts camera', async () => {
      assert.equal(await page.evaluate(() => window.__cameraRequests), 0);
      await page.locator('.hn-task[data-route="inbound"]').focus();
      await page.keyboard.press('Enter');
      await page.locator('[data-panel="P04.S01"]').waitFor();
      await page.locator('[data-p04="back"]').click();
      await page.locator('.hn-bell').focus(); await page.keyboard.press('Tab');
      assert.equal(await page.locator('.hn-avatar').evaluate(node => node === document.activeElement), true);
      await page.screenshot({ path: path.join(out, 'keyboard-focus.png') });
    });
    await check('Logout then Back/direct route never restores Home', async () => {
      await page.locator('#hn-logout').click(); await page.locator('#username').waitFor();
      await page.goBack(); await page.locator('#username').waitFor();
      await page.evaluate(() => { location.hash = '#p02/history'; });
      await page.waitForFunction(() => location.hash === '#login');
      assert.equal(await page.locator('#hn-home').count(), 0);
    });
    await check('Denied, stopped and UNKNOWN sessions cannot open Home by hash', async () => {
      for (const scenario of ['denied', 'warehouse-stopped', 'start-unknown']) {
        await login(scenario);
        await page.evaluate(() => { location.hash = '#p02/inbound'; });
        await page.waitForFunction(() => location.hash === '#confirmation');
        assert.equal(await page.locator('#hn-home').count(), 0);
      }
    });
    await check('Alternate P01 actor reaches Home without hardcoded Minh Anh', async () => {
      await login('other-user'); await home();
      assert.match(await page.locator('.hn-intro h1').textContent(), /Lan Nguyễn/);
    });
    await check('Reload requires a new fixture session, no persisted credentials', async () => {
      await page.reload(); await page.locator('#username').waitFor();
      assert.equal(await page.locator('#hn-home').count(), 0);
      assert.equal(await page.evaluate(() => sessionStorage.length), 0);
    });
    assert.deepEqual(errors, []); assert.deepEqual(requests, []);
    fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify({ status: 'PASS', checks, errors, externalRequests: requests, conditions: 'Chromium headless, DPR1, zoom1, local fixture; no real mobile keyboard/hardware/backend' }, null, 2));
    fs.writeFileSync(path.join(out, 'render-metrics.json'), JSON.stringify(metrics, null, 2));
    console.log(JSON.stringify({ status: 'PASS', checks: checks.length, captures: metrics.length, errors, externalRequests: requests }));
  } catch (error) {
    await page.screenshot({ path: path.join(out, 'failure.png') });
    fs.writeFileSync(path.join(out, 'browser-failure.json'), JSON.stringify({ message: error.message, checks, errors, url: page.url() }, null, 2));
    throw error;
  } finally { await browser.close(); }
})();

