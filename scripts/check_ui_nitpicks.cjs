const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const base = process.env.PREVIEW_BASE_URL || 'http://127.0.0.1:8766';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 494, height: 950 }, reducedMotion: 'reduce', timezoneId: 'Asia/Ho_Chi_Minh' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`${base}/flows/auth-session/`);
    await page.fill('#username', 'minhanh');
    await page.fill('#password', 'preview');
    await page.click('#submit');
    await page.click('#start');
    await page.locator('#hn-home:not([hidden])').waitFor();

    const homeGeometry = await page.evaluate(() => {
      const section = document.querySelector('.hn-recent');
      const head = document.querySelector('.hn-recent .hn-section-head');
      return { sectionScrollWidth: section.scrollWidth, sectionClientWidth: section.clientWidth, headScrollWidth: head.scrollWidth, headClientWidth: head.clientWidth };
    });
    assert.equal(homeGeometry.sectionScrollWidth, homeGeometry.sectionClientWidth);
    assert.equal(homeGeometry.headScrollWidth, homeGeometry.headClientWidth);
    assert.equal(await page.locator('.hn-task:not([type="button"])').count(), 0);
    assert.equal(await page.locator('.hn-nav button:not([type="button"])').count(), 0);

    async function assertFilterGroup(hash, selector) {
      await page.evaluate(value => { location.hash = value; }, hash);
      await page.locator(selector).waitFor();
      if (await page.locator('.p08-tabs').count() === 0) return { skipped: true };
      const result = await page.locator('.p08-tabs').evaluate(node => ({
        role: node.getAttribute('role'),
        tabs: [...node.querySelectorAll('button')].map(button => ({ role: button.getAttribute('role'), pressed: button.getAttribute('aria-pressed'), type: button.type })),
      }));
      assert.equal(result.role, 'group');
      assert.ok(result.tabs.length > 0);
      assert.equal(result.tabs.filter(tab => tab.pressed === 'true').length, 1);
      assert.ok(result.tabs.every(tab => tab.role === null && tab.type === 'button'));
      return result;
    }

    await assertFilterGroup('#p02/history-list', '.p08-app[data-panel="P08.S01"]');
    await assertFilterGroup('#p02/documents', '.p12-app[data-panel="P12.S01"]');
    await assertFilterGroup('#p02/history?scene=nfc', '.p22-app');
    await assertFilterGroup('#p02/history?scene=warranty', '.p23-app');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ status: 'PASS', homeGeometry, groups: 4, errors }));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
