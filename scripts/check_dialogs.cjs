const previewBase=process.env.PREVIEW_BASE_URL||'http://127.0.0.1:8766';
// Headless local prototype verification. No browser plugin/native app automation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { mockGeography } = require('./outbound_geography_helpers.cjs');
const out = path.resolve(process.env.DIALOG_EVIDENCE_DIR || 'handoff/P03/evidence');
fs.mkdirSync(out, { recursive: true });
const base = previewBase;
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 394, height: 692 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  // Reuse P05's address fixture so this P03 regression never depends on live geography.
  await mockGeography(page);
  const checks = [], errors = [], externalRequests = [], metrics = [];
  let p01Colors;
  let p02Footer;
  const footerStyle = () => page.locator('.hn-nav').evaluate(nav => {
    const properties = ['height', 'minHeight', 'padding', 'borderRadius', 'backgroundColor', 'backgroundImage', 'color', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'gap', 'alignItems', 'justifyContent', 'boxShadow', 'fill', 'stroke', 'strokeWidth', 'marginTop'];
    const read = (el, container = false) => Object.fromEntries(properties.filter(p => !(container && p === 'marginTop')).map(p => [p, getComputedStyle(el)[p]]));
    const markup = nav.cloneNode(true);
    // Motion instrumentation is not footer artwork, structure, or computed style.
    for (const el of markup.querySelectorAll('[data-motion-primitive]')) el.removeAttribute('data-motion-primitive');
    return { html: markup.innerHTML, container: read(nav, true), children: [...nav.querySelectorAll('button, svg, span')].map(el => ({ tag: el.tagName, style: read(el) })) };
  });
  const colors = locator => locator.evaluate(el => {
    const s = getComputedStyle(el);
    return { background: s.backgroundColor, image: s.backgroundImage, border: s.borderTopColor, text: s.color };
  });
  page.on('pageerror', error => errors.push(error.message));
  // P05 r07 approved this exact read-only geography source; reject other traffic.
  page.on('request', req => { if (!req.url().startsWith(base) && !req.url().startsWith('data:') && !(req.method()==='GET' && req.url().startsWith('https://provinces.open-api.vn/api/v1/'))) externalRequests.push(req.url()); });
  await page.addInitScript(() => {
    window.__cameraRequests = 0;
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { window.__cameraRequests++; throw new Error('P03 must not request camera'); };
  });
  const modal = () => page.locator('.p03-dialog');
  const act = name => page.locator(`[data-p03-action="${name}"]`);
  const snap = async () => JSON.parse(await page.locator('[data-p03-snapshot]').textContent());
  async function login() {
    await page.goto(`${base}/flows/auth-session/`);
    const primary = await colors(page.locator('#submit'));
    const linkColor = (await colors(page.locator('#forgot'))).text;
    await page.fill('#username', 'minhanh'); await page.fill('#password', 'preview');
    await page.click('#submit'); await page.locator('#start').waitFor();
    p01Colors = { primary, secondary: await colors(page.locator('#logout')), linkColor };
    await page.click('#start');
    await page.locator('#hn-home').waitFor({ state: 'visible' });
    p02Footer = await footerStyle();
    await page.locator('.p03-tools summary').click();
  }
  async function open(kind) { if(await page.locator('.hn-action-dialog[open]').count()){await page.keyboard.press('Escape');await page.locator('.app-modal-host').waitFor({state:'detached'});}await page.locator(`[data-p03-open="${kind}"]`).click(); await modal().waitFor(); }
  async function check(name, run) { await run(); checks.push({ name, status: 'PASS' }); }
  async function capture(name) {
    await page.evaluate(() => scrollTo(0, 0));
    await page.locator('.hn-screen').screenshot({ path: path.join(out, name + '.png') });
    const info = await page.evaluate(name => {
      const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right }; };
      const dialog = document.querySelector('.p03-dialog');
      return { name, viewport: [innerWidth, innerHeight], dpr: devicePixelRatio, zoom: visualViewport.scale, scroll: [scrollX, scrollY],
        font: getComputedStyle(dialog).fontFamily, screen: rect('.hn-screen'), header: rect('.p03-header'), dialog: rect('.p03-dialog'), nav: rect('.hn-nav'), tools: rect('.hn-tools'),
        dialogScroll: [dialog.scrollTop, dialog.scrollHeight, dialog.clientHeight], horizontalOverflow: document.documentElement.scrollWidth > innerWidth };
    }, name);
    metrics.push(info);
    assert.equal(info.horizontalOverflow, false, name + ' overflow');
    assert.ok(info.dialog.bottom <= info.nav.y + 1, name + ' dialog overlaps nav');
    assert.ok(info.screen.bottom <= info.viewport[1] + 1, name + ' screen does not fit');
    assert.ok(Math.abs(info.nav.bottom - info.screen.bottom) <= 1, name + ' menu anchored to app bottom');
    const expectedScale = Math.min(1, info.viewport[0] / 494, info.viewport[1] / 950);
    assert.ok(Math.abs(info.screen.width - 494 * expectedScale) <= 1, name + ' P02 shared shell width');
    assert.ok(Math.abs(info.screen.height - 950 * expectedScale) <= 1, name + ' P02 shared shell height');
    assert.equal(await page.locator('.p03-backdrop').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0.8)');
    const layout = await page.evaluate(() => {
      const rect = s => document.querySelector(s).getBoundingClientRect();
      const screen = rect('.hn-screen'), header = rect('.p03-header'), backdrop = rect('.p03-backdrop'), nav = rect('.hn-nav'), dialog = rect('.p03-dialog'), scan = rect('.hn-scan-circle');
      const sheet = document.querySelector('.p03-dialog').classList.contains('sheet');
      const labels = [...document.querySelectorAll('.hn-nav button > span:last-child')].map(el => el.getBoundingClientRect().top);
      const scale = screen.width / 494;
      return { square: ['.p03-host', '.p03-backdrop'].every(s => getComputedStyle(document.querySelector(s)).borderRadius === '0px'),
        bodyWidth: document.body.clientWidth, viewportWidth: innerWidth, centered: Math.abs(screen.left - (innerWidth - screen.right)),
        backdropEdges: [backdrop.left - screen.left, backdrop.right - screen.right, backdrop.top - header.bottom, backdrop.bottom - nav.top],
        sideMargins: [dialog.left - screen.left, screen.right - dialog.right],
        labelRange: Math.max(...labels) - Math.min(...labels), scanAboveNav: (nav.top - scan.top) / scale,
        sheet, sheetGap: nav.top - dialog.bottom, clearLastRow: !sheet || rect('.p03-operation:last-child').bottom <= scan.top,
        centerError: sheet ? 0 : Math.abs((dialog.top + dialog.bottom) / 2 - (backdrop.top + 16 * scale + backdrop.bottom - 32 * scale) / 2) };
    });
    assert.equal(layout.square, true, name + ' backdrop must have square corners');
    assert.deepEqual(await footerStyle(), p02Footer, name + ' footer DOM and computed appearance must match locked P02');
    assert.equal(layout.bodyWidth, layout.viewportWidth, name + ' no reserved scrollbar strip');
    assert.ok(layout.centered <= 1, name + ' full app centered without clipped right edge');
    assert.ok(layout.backdropEdges.every(v => Math.abs(v) <= 1), name + ' backdrop must cover edge-to-edge between header/footer');
    assert.ok(Math.abs(layout.sideMargins[0] - layout.sideMargins[1]) <= 1, name + ' symmetric dialog margins');
    // Footer label/scan layout comes from P02; do not enforce the superseded custom P03 geometry.
    if (info.dialogScroll[1] <= info.dialogScroll[2] + 1) assert.ok(layout.clearLastRow, name + ' scan circle must not cover last task');
    assert.ok(layout.sheet ? Math.abs(layout.sheetGap) <= 1 : layout.centerError <= 1, name + ' dialog placement');
    metrics.at(-1).revision03 = layout;
    assert.ok(info.tools.y >= info.screen.bottom || info.tools.x >= info.screen.right, name + ' tools inside app');
    if (info.viewport[1] >= 692 && !name.includes('unknown')) {
      assert.ok(info.dialogScroll[1] <= info.dialogScroll[2] + 1, name + ' baseline CTA must be visible without internal scrolling');
    }
  }
  try {
    await login();
    await check('Opening from external tools scrolls app into view and restores caller focus', async () => {
      await page.locator('[data-p03-open="picker"]').scrollIntoViewIfNeeded();
      await open('picker');
      assert.equal(await page.evaluate(() => scrollY), 0);
      await act('cancel').click();
      assert.equal(await page.locator('[data-p03-open="picker"]').evaluate(el => el === document.activeElement), true);
    });
    await check('A01/A05 S01 opens from scan tab, one overlay, focus trap + Esc restore caller', async () => {
      await page.locator('[data-tab="lookup"]').click();
      assert.equal(await modal().getAttribute('data-panel'), 'P03.S01');
      assert.equal(await page.locator('.p03-dialog').count(), 1);
      await capture('P03-S01-394');
      // Initial focus is the first task; test wraparound from the actual boundary.
      assert.equal(await page.locator('[data-p03-operation]').first().evaluate(el => el === document.activeElement), true);
      await page.locator('[data-p03-back]').focus();
      await page.keyboard.press('Shift+Tab');
      assert.equal(await page.locator('[data-tab="profile"]').evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('[data-p03-back]').evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Escape'); await modal().waitFor({ state: 'detached' });
      assert.equal(await page.locator('[data-tab="lookup"]').evaluate(el => el === document.activeElement), true);
    });
    await check('S01 all operations retain context, implemented or pending destination remains explicit, no default/camera', async () => {
      for (const [operation, target] of [['inbound', 'P04'], ['outbound', 'P05'], ['warranty', 'P09'], ['lookup', 'P06']]) {
        await page.locator('[data-tab="lookup"]').click(); await page.locator(`[data-p03-operation="${operation}"]`).click();
        if (['inbound','outbound','lookup','warranty'].includes(operation)) await page.locator(`[data-panel="${target}.S01"]`).waitFor();
        else assert.match(await page.locator('#hn-destination').textContent(), new RegExp(target + ' chưa có'));
        const nav = JSON.parse(await page.locator('#hn-route-status').textContent());
        assert.equal(nav.context.operation, operation); assert.equal(nav.context.actorId, 'fixture-minhanh');
        assert.equal(nav.context.warehouseId, 'fixture-hoa-nam');
        await page.locator(['inbound','outbound','lookup','warranty'].includes(operation) ? `[data-${target.toLowerCase()}="back"]` : '[data-return]').click();
      }
      assert.equal(await page.evaluate(() => window.__cameraRequests), 0);
    });
    await check('A02 legacy fixture cannot impersonate a stock owner; retained for review', async () => {
      await open('local'); await capture('P03-S02-394');
      const original = (await snap()).document;
      await act('resume').click();
      await page.locator('.hn-action-dialog[open]').waitFor();
      assert.deepEqual((await snap()).document,original);
      assert.equal(await page.locator('.p04-app').count(),0);
      await page.keyboard.press('Escape');
      await page.locator('.app-modal-host').waitFor({state:'detached'});
    });
    await check('A03 cancel discard keeps data, confirmation removes only unsaved fixture', async () => {
      await open('resume'); const original = (await snap()).document;
      await act('discard').click(); await capture('P03-S04-394');
      await page.keyboard.press('Escape');
      assert.equal(await modal().getAttribute('data-panel'), 'P03.S02');
      assert.deepEqual((await snap()).document, original);
      await act('discard').click(); await act('confirmDiscard').click();
      await modal().waitFor({ state: 'detached' }); assert.equal((await snap()).document, null);
      assert.equal(await page.evaluate(() => localStorage.length), 0);
    });
    await check('Save confirms result before exit, stored fixture can resume exact document', async () => {
      await open('local'); const original = (await snap()).document;
      await act('save').click(); assert.equal(await modal().getAttribute('aria-busy'), 'true');
      await page.keyboard.press('Escape'); assert.equal(await modal().count(), 1);
      await modal().waitFor({ state: 'detached' });
      await open('saved');
      const saved = (await snap()).document;
      assert.equal(saved.documentId, original.documentId); assert.deepEqual(saved.codes, original.codes); assert.equal(saved.unsaved, false);
      await act('discard').click(); await act('confirmDiscard').click();
      assert.match(await page.locator('#p03-description').textContent(), /Không được xóa/);
      await act('cancel').click(); await act('cancel').click();
    });
    await check('Save failure remains in dialog with unchanged data; retry explicit', async () => {
      await page.selectOption('[data-p03-fixture="save"]', 'failed'); await open('local');
      const original = (await snap()).document; await act('save').click();
      await page.getByText('Chưa lưu được nháp. Nội dung phiếu được giữ nguyên.', { exact: true }).last().waitFor();
      assert.deepEqual((await snap()).document, original); await act('cancel').click();
    });
    await check('UNKNOWN save retains identity, disables blind resubmit/discard and supports reconciliation boundary', async () => {
      await page.selectOption('[data-p03-fixture="save"]', 'unknown'); await open('resume');
      const original = (await snap()).document; await act('save').click();
      await act('checkSave').waitFor(); assert.equal(await act('save').isDisabled(), true);
      assert.deepEqual((await snap()).document, original);
      const uncertain = await snap(), uncertainUrl = page.url();
      await page.locator('.p03-backdrop').click({ position: { x: 5, y: 5 } });
      assert.deepEqual(await snap(), uncertain); assert.equal(page.url(), uncertainUrl);
      await page.locator('[data-tab="home"]').click();
      await page.locator('[data-tab="lookup"]').click();
      assert.equal(await modal().getAttribute('data-panel'), 'P03.S02');
      assert.deepEqual((await snap()).document, original);
      assert.equal(await act('save').isDisabled(), true);
      await capture('P03-save-unknown');
      await act('checkSave').click(); assert.deepEqual((await snap()).document, original);
      await act('discard').click(); await act('confirmDiscard').click();
      assert.deepEqual((await snap()).document, original);
      await act('cancel').click(); await act('cancel').click();
    });
    await login();
    await check('A04 S03 blocks Esc/backdrop/deep link writes after Home, preserves session/read access', async () => {
      await open('stopped'); await capture('P03-S03-394');
      await page.keyboard.press('Escape'); assert.equal(await modal().getAttribute('data-panel'), 'P03.S03');
      await page.locator('.p03-backdrop').click({ position: { x: 10, y: 10 } });
      assert.equal(await modal().count(), 1);
      await act('contact').click(); assert.match(await page.locator('#p03-description').textContent(), /Chưa có kênh/);
      await act('home').click();
      assert.match(await page.locator('.hn-intro').textContent(), /Minh Anh/);
      assert.equal(await page.locator('.hn-active').textContent(), 'Kho tạm dừng');
      await page.evaluate(() => { location.hash = '#p02/inbound?id=PN-0001'; });
      await page.locator('[data-panel="P03.S03"]').waitFor();
      await page.goBack(); assert.equal(await modal().getAttribute('data-panel'), 'P03.S03');
      await act('home').click();
      await page.locator('[data-tab="history"]').click();
      await page.frameLocator('iframe').getByRole('heading', { name: 'Lịch sử thao tác', exact: true }).waitFor();
      await page.frameLocator('iframe').getByRole('button', { name: 'Về Trang chủ', exact: true }).click();
      await page.locator('.hn-task[data-route="outbound"]').click();
      assert.equal(await modal().getAttribute('data-panel'), 'P03.S03'); await act('home').click();
      await page.selectOption('[data-p03-fixture="warehouse"]', 'active');
    });
    await check('Server/POSTED cannot be removed in S04', async () => {
      for (const kind of ['server', 'posted']) {
        await open(kind); const original = (await snap()).document;
        await act('discard').click(); await act('confirmDiscard').click();
        assert.deepEqual((await snap()).document, original); assert.match(await page.locator('#p03-description').textContent(), /Không được xóa/);
        await act('cancel').click(); await act('cancel').click();
      }
    });
    await login();
    await check('A01 backdrop never dismisses; explicit close/native Back return to caller', async () => {
      await page.locator('[data-tab="lookup"]').click(); await page.locator('.p03-backdrop').click({ position: { x: 8, y: 8 } });
      assert.equal(await modal().getAttribute('data-panel'), 'P03.S01');
      await act('cancel').click();
      await modal().waitFor({ state: 'detached' });
      assert.ok(await page.locator('[data-home-document]').count()<=3);
      await page.locator('.hn-scanner').click(); await page.locator('[data-tab="lookup"]').click();
      const lookupUrl = page.url(), lookupState = await snap();
      await page.locator('.p03-backdrop').click({ position: { x: 8, y: 8 } });
      assert.equal(page.url(), lookupUrl); assert.deepEqual(await snap(), lookupState);
      await page.goBack(); await modal().waitFor({ state: 'detached' });
      await page.locator('[data-panel="P06.S01"]').waitFor();
      await page.locator('[data-p06="back"]').click();
    });
    await check('Backdrop clicks preserve all four panels, route and document; footer explicitly navigates', async () => {
      for (const [kind, panel] of [['picker', 'S01'], ['local', 'S02'], ['discard', 'S04'], ['stopped', 'S03']]) {
        await open(kind);
        const original = await snap(), url = page.url();
        for (const fraction of [.02,.5,.98]) {
          const backdrop=await page.locator('.p03-backdrop').boundingBox();
          await page.mouse.click(backdrop.x+backdrop.width*fraction,backdrop.y+5);
          assert.deepEqual(await snap(), original);
          assert.equal(page.url(), url);
          assert.equal(await modal().getAttribute('data-panel'), `P03.${panel}`);
        }
        await page.locator('.hn-screen').screenshot({ path: path.join(out, `backdrop-${panel}.png`) });
        if(panel==='S04'){await act('cancel').click();await act('cancel').click();}
        await page.locator('[data-tab="home"]').click();
        await modal().waitFor({ state: 'detached' });
        await page.locator('#hn-home').waitFor({ state: 'visible' });
        assert.deepEqual((await snap()).document, original.document);
        if (kind === 'stopped') await page.selectOption('[data-p03-fixture="warehouse"]', 'active');
      }
    });
    await login();
    await check('All five footer controls work; scan remains picker; pending routes remain explicit', async () => {
      for (const key of ['lookup', 'documents', 'profile', 'history', 'home']) {
        await open('picker');
        await page.locator(`[data-tab="${key}"]`).click();
        if (key === 'lookup') {
          assert.equal(await modal().getAttribute('data-panel'), 'P03.S01');
          await act('cancel').click();
        } else {
          await modal().waitFor({ state: 'detached' });
          assert.equal(new URL(page.url()).hash, key === 'home' ? '#home' : `#p02/${key}`);
          if (key === 'history') await page.frameLocator('iframe').getByRole('heading', { name: 'Lịch sử thao tác', exact: true }).waitFor();
          else if (key === 'profile') await page.locator('.p10-app[data-panel="P10.S01"]').waitFor();
          else if (key === 'documents') await page.locator('.p12-app').waitFor();
          await page.locator('[data-tab="home"]').click();
        }
      }
    });
    await check('A05 four panels responsive at 360×800, 430×932, 1440×900, 1495×752, 1869×940; keyboard height 394×420', async () => {
      for (const [width, height] of [[360, 800], [430, 932], [1440, 900], [1495, 752], [1869, 940], [394, 420]]) {
        await page.setViewportSize({ width, height });
        for (const [kind, panel] of [['picker', 'S01'], ['local', 'S02'], ['discard', 'S04'], ['stopped', 'S03']]) {
          // Finish or cancel each fixture before opening the next one.
          await open(kind); await capture(`P03-${panel}-${width}x${height}`);
          for (let i = 0; i < 9; i++) {
            await page.keyboard.press('Tab');
            assert.equal(await page.evaluate(() => !!document.activeElement.closest('.p03-dialog, .hn-nav, .p03-header')), true);
            assert.equal(await page.evaluate(() => {
              const active = document.activeElement.getBoundingClientRect();
              const dialog = document.activeElement.closest('.hn-nav, .p03-header')
                ? document.querySelector('.hn-screen').getBoundingClientRect()
                : document.querySelector('.p03-dialog').getBoundingClientRect();
              return active.top >= dialog.top - 1 && active.bottom <= dialog.bottom + 1;
            }), true, 'focused CTA must be scrolled fully into view');
            assert.equal(await page.evaluate(() => {
              const active = document.activeElement;
              if (!active.matches('.p03-operation:last-child')) return true;
              return active.getBoundingClientRect().bottom <= document.querySelector('.hn-scan-circle').getBoundingClientRect().top;
            }), true, 'focused final task clears raised scan control');
          }
          if (panel === 'S03') { await act('home').click(); await page.selectOption('[data-p03-fixture="warehouse"]', 'active'); }
          else if (panel === 'S04') await act('confirmDiscard').click();
          else await act('cancel').click();
        }
      }
    });
    await check('User revision: P01 button colors, 80% backdrop, fixed menu during wheel and resize', async () => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await open('local'); await page.mouse.move(0, 0);
      assert.deepEqual(await colors(act('resume')), p01Colors.primary);
      assert.deepEqual(await colors(act('save')), p01Colors.secondary);
      assert.equal((await colors(act('cancel'))).text, p01Colors.linkColor);
      await act('resume').hover();
      assert.equal((await colors(act('resume'))).background, 'rgb(3, 70, 103)');
      await page.mouse.move(550, 100); await page.mouse.wheel(0, 550);
      assert.equal(await page.evaluate(() => scrollY), 0);
      let nav = await page.locator('.hn-nav').boundingBox(); assert.ok(Math.abs(nav.y + nav.height - 900) <= 1);
      await page.setViewportSize({ width: 430, height: 780 });
      await page.waitForFunction(() => Math.abs(document.querySelector('.hn-nav').getBoundingClientRect().bottom - innerHeight) < 1);
      await act('cancel').click();
      assert.notEqual(await page.evaluate(() => getComputedStyle(document.documentElement).overflow), 'hidden');
      const home = await page.locator('.hn-screen').boundingBox();
      assert.ok(Math.abs(home.width - 494 * (780 / 950)) <= 1, 'Home reference size restored');
    });
    await check('Logout/Back invalidates P03 and cannot restore fixture session', async () => {
      await page.setViewportSize({ width: 394, height: 692 });
      await page.locator('.hn-tools > details > summary').first().click();
      await page.locator('#hn-logout').click(); await page.locator('#username').waitFor();
      await page.goBack(); await page.locator('#username').waitFor(); assert.equal(await page.locator('.p03-host').count(), 0);
    });
    assert.deepEqual(errors, []); assert.deepEqual(externalRequests, []);
    fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify({ status: 'PASS', checks, errors, externalRequests, conditions: 'Chromium headless, DPR1, zoom1, local fixtures. Keyboard height simulated by viewport; real mobile keyboard/hardware/backend NOT_RUN.' }, null, 2));
    fs.writeFileSync(path.join(out, 'render-metrics.json'), JSON.stringify(metrics, null, 2));
    console.log(JSON.stringify({ status: 'PASS', groups: checks.length, captures: metrics.length, errors, externalRequests }));
  } catch (error) {
    await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true });
    fs.writeFileSync(path.join(out, 'browser-failure.json'), JSON.stringify({ error: error.message, checks, errors, url: page.url() }, null, 2));
    throw error;
  } finally { await browser.close(); }
})();
