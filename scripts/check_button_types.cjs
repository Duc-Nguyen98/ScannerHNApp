const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const base = process.env.PREVIEW_BASE_URL || 'http://127.0.0.1:8766';
const routes = [
  ['P02 home', '#home', '#hn-home:visible'],
  ['P04 inbound', '#p02/inbound', '.p04-app'],
  ['P05 outbound', '#p02/outbound', '.p05-app'],
  ['P06 lookup', '#p02/lookup', '.p06-app'],
  ['P07 NFC', '#p02/nfc', '.p07-app'],
  ['P08 history', '#p02/history-list', '.p08-app'],
  ['P09 warranty', '#p02/warranty', '.p09-app'],
  ['P10 profile', '#p02/profile', '.p10-app'],
  ['P11 security', '#p02/security?panel=1', '.p11-app'],
  ['P12 documents', '#p02/documents', '.p12-app'],
  ['P13 notifications', '#p02/notifications', '.p13-app'],
  ['P14 shift', '#p02/shift', '.p14-app'],
  ['P18 attachments', '#p02/attachments', '.p18-app'],
  ['P19 component issue', '#p02/component-issue', '.p19-app'],
  ['P20 component history', '#p02/component-history?case=BH-001', '.p20-app'],
  ['P21 component resume', '#p02/component-resume', '.p21-app'],
  ['P22 NFC audit', '#p02/history?scene=nfc', '.p22-app'],
  ['P23 sessions', '#p02/history?scene=sessions', '.p23-app'],
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 494, height: 950 }, reducedMotion: 'reduce' });
  try {
    await page.goto(`${base}/flows/auth-session/`);
    await page.fill('#username', 'minhanh');
    await page.fill('#password', 'preview');
    await page.click('#submit');
    await page.click('#start');
    await page.locator('#hn-home:not([hidden])').waitFor();
    const findings = [];
    for (const [name, hash, selector] of routes) {
      await page.evaluate(value => { location.hash = value; }, hash);
      await page.locator(selector).waitFor({ timeout: 15000 });
      const rows = await page.evaluate(() => [...document.querySelectorAll('#home-app:not([hidden]) .hn-screen button')]
        .filter(button => button.getClientRects().length && !button.closest('[hidden]') && !button.hasAttribute('type'))
        .map(button => ({ text: (button.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80), label: button.getAttribute('aria-label'), form: !!button.closest('form'), data: [...button.attributes].filter(a => a.name.startsWith('data-')).map(a => `${a.name}=${a.value}`).join(' ') })));
      findings.push({ name, hash, missingType: rows });
    }
    const all = findings.flatMap(row => row.missingType.map(item => ({ route: row.name, ...item })));
    console.log(JSON.stringify({ status: 'PASS', routes: findings.length, missingCount: all.length, missing: all }, null, 2));
    assert.equal(all.length, 0, JSON.stringify(all, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
