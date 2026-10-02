const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const url = process.env.PREVIEW_URL || 'http://127.0.0.1:8766/flows/auth-session/';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 494, height: 950 }, reducedMotion: 'reduce', timezoneId: 'Asia/Ho_Chi_Minh' });
  const errors = [];
  const responses = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) responses.push({ url: response.url(), status: response.status() }); });
  try {
    const started = Date.now();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#login-form');
    const loginReadyMs = Date.now() - started;
    const beforeAuthCss = await page.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"]')].filter(link => link.media !== 'not all').map(link => link.href));
    assert.equal(beforeAuthCss.some(href => href.includes('/home/style.css')), false);
    assert.equal(beforeAuthCss.some(href => href.includes('/attachments/style.css')), false);
    assert.equal(beforeAuthCss.some(href => href.includes('/recovery-shift/style.css')), true);
    await page.locator('#username').fill('minhanh');
    await page.locator('#password').fill('preview');
    await page.locator('#submit').click();
    await page.waitForSelector('#start');
    await page.locator('#start').click();
    await page.waitForSelector('#home-app:not([hidden]) .hn-screen', { timeout: 30000 });
    const homeReadyMs = Date.now() - started;
    await page.waitForFunction(() => document.querySelectorAll('link[data-hn-deferred-style]').length >= 20);
    const afterHome = await page.evaluate(() => ({
      deferred: document.querySelectorAll('link[data-hn-deferred-style]').length,
      homeCss: [...document.querySelectorAll('link[data-hn-deferred-style]')].some(link => link.href.includes('/home/style.css')),
      homeVisible: !document.querySelector('#home-app').hidden,
    }));
    assert.equal(afterHome.homeCss, true);
    assert.equal(afterHome.homeVisible, true);
    assert.deepEqual(errors, []);
    assert.deepEqual(responses, []);
    console.log(JSON.stringify({ status: 'PASS', loginReadyMs, homeReadyMs, beforeAuthStylesheets: beforeAuthCss.length, ...afterHome }));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
