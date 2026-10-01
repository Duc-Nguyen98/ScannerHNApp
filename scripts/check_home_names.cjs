const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const out = path.resolve('handoff/P02/evidence/revision-05-names');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1869, height: 940 }, deviceScaleFactor: 1 });
  const rows = [], errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto('http://127.0.0.1:8766/flows/auth-session/?v=p02-names-r05');
    await page.fill('#username', 'minhanh'); await page.fill('#password', 'preview'); await page.click('#submit');
    await page.locator('#start').waitFor(); await page.click('#start'); await page.locator('.hn-name').waitFor();
    await page.getByText('Kịch bản kiểm tra P02', { exact:true }).click();
    for (const [width, height] of [[1869, 940], [494, 950], [360, 800]]) {
      await page.setViewportSize({ width, height });
      let reference;
      for (const scenario of ['baseline', 'short', 'normal', 'long', 'unbroken']) {
        await page.selectOption('#hn-scenario', scenario);
        await page.evaluate(() => window.scrollTo(0, 0));
        const metrics = await page.evaluate(() => {
          const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height, bottom:r.bottom }; };
          const name = document.querySelector('.hn-name');
          return { hero:rect('.hn-hero'), heading:rect('.hn-intro h1'), badge:rect('.hn-active'), kpi:rect('.hn-kpis'), screen:rect('.hn-screen'), nav:rect('.hn-nav'),
            transform:getComputedStyle(document.querySelector('.hn-screen')).transform,
            font:getComputedStyle(name).fontSize, fullName:name.title, displayName:name.textContent, clipped:name.scrollWidth > name.clientWidth,
            overflow:document.documentElement.scrollWidth > innerWidth };
        });
        if (!reference) reference = metrics;
        assert.equal(metrics.hero.height, reference.hero.height, 'Stable hero height: ' + scenario);
        assert.equal(metrics.kpi.y, reference.kpi.y, 'Stable KPI: ' + scenario);
        assert.equal(metrics.transform, reference.transform, 'Name must not shrink whole app: ' + scenario);
        assert.equal(metrics.font, '28px');
        assert.ok(metrics.badge.bottom <= metrics.heading.y, 'Status never overlaps name');
        assert.equal(metrics.overflow, false);
        assert.equal(metrics.clipped, scenario === 'unbroken');
        const expected = { baseline:'Minh Anh', short:'An', normal:'Minh Anh', long:'Minh Anh', unbroken:'Nguyễn'.repeat(40) };
        assert.equal(metrics.displayName, expected[scenario], 'Last two words only; single word preserved');
        if (scenario === 'long') assert.equal(metrics.fullName, 'Nguyễn Thị Hoàng Ngọc Minh Anh');
        assert.ok(metrics.screen.bottom <= height + 1);
        await page.screenshot({ path: path.join(out, `${width}-${scenario}.png`) });
        await page.locator('.hn-name').focus(); await page.keyboard.press('Enter');
        await page.locator('#hn-name-dialog[open]').waitFor();
        assert.equal(await page.locator('#hn-full-name').textContent(), metrics.fullName, 'No lost/rewritten identity');
        assert.equal(await page.locator('#hn-name-dialog button').evaluate(n => n === document.activeElement), true);
        assert.equal(await page.locator('#hn-name-dialog').evaluate(n => n.scrollWidth <= n.clientWidth), true, 'Unbroken text wraps');
        if (scenario === 'long') await page.screenshot({ path: path.join(out, `${width}-full-name.png`) });
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#hn-name-dialog').getAttribute('open'), null);
        assert.equal(await page.locator('.hn-name').evaluate(n => n === document.activeElement), true, 'Focus returns to name');
        // Touch/click and explicit close work without hover/title.
        await page.locator('.hn-name').click(); await page.locator('#hn-name-dialog button').click();
        assert.equal(await page.locator('#hn-name-dialog').getAttribute('open'), null);
        rows.push({ width, height, scenario, ...metrics, status:'PASS' });
      }
    }
    // Replaced fixture markup preserves name handler and routing; other modules remain wired.
    await page.selectOption('#hn-scenario', 'baseline');
    for (const [route, selector] of [['inbound','.p04-app'],['outbound','.p05-app'],['lookup','.p06-app'],['nfc','.p07-app']]) {
      await page.evaluate(route => { location.hash = '#p02/' + route; }, route);
      await page.locator(selector).waitFor();
      await page.evaluate(() => { location.hash = '#home'; }); await page.locator('.hn-name').waitFor();
    }
    await page.locator('.hn-name').click();
    await page.evaluate(() => { location.hash = '#p02/profile'; });
    await page.locator('#hn-name-dialog').waitFor({ state:'hidden' });
    await page.evaluate(() => { location.hash = '#home'; });
    await page.locator('#hn-logout').click(); await page.locator('#username').waitFor();
    assert.equal(await page.locator('#hn-name-dialog').count(), 0);
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({status:'PASS', cases:rows.length, rows, errors, extra:'Enter/Escape focus, click/close, route dismissal, P04-P07 smoke, logout cleanup'}, null, 2));
    console.log('PASS: 15 name/viewport cases; dialog keyboard/click/focus; P04-P07 smoke; logout cleanup.');
  } catch (error) {
    await page.screenshot({ path:path.join(out,'failure.png') });
    fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({message:error.stack,rows,errors},null,2));
    throw error;
  } finally { await browser.close(); }
})();
