const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/P06/evidence/revision-02');fs.mkdirSync(out,{recursive:true});
const before=process.argv.includes('--before');
(async()=>{
 const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:494,height:1000},deviceScaleFactor:1});
 const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 const act=n=>page.locator(`[data-p06="${n}"]`).first(),snap=async()=>JSON.parse(await page.locator('[data-p06-snapshot]').textContent());
 const check=async(name,fn)=>{const detail=await fn();checks.push({name,...detail});console.log(name+': '+JSON.stringify(detail));};
 const capture=async name=>page.locator('.hn-screen').screenshot({path:path.join(out,(before?'before-':'after-')+name+'.png')});
 async function login(){await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.click('.hn-scanner');}
 async function detail(){await page.click('[data-p06-item="fixture-item-HN12345"]');await page.locator('[data-panel="P06.S02"]').waitFor();}
 try {
 await login();await detail();
 await check('list scan must not carry previously viewed item',async()=>{await act('back').click();await page.locator('[data-panel="P06.S01"]').waitFor();await act('scan').click();await page.click('[data-p03-operation="lookup"]');const nav=JSON.parse(await page.locator('#hn-route-status').textContent());const ok=nav.context.itemId==null;if(!before)assert.ok(ok);return {status:ok?'PASS':'FAIL',itemId:nav.context.itemId};});
 await detail();
 await check('Escape restores the P06 title',async()=>{const expected=await page.title();await act('scan').click();await page.keyboard.press('Escape');const actual=await page.title();if(!before)assert.equal(actual,expected);return {status:actual===expected?'PASS':'FAIL',expected,actual};});
 await check('Back from history restores the invoking detail control and scroll',async()=>{await act('history').click();await act('back').click();await page.locator('[data-panel="P06.S02"]').waitFor();const scroll=await page.locator('.p06-scroll').evaluate(e=>e.scrollTop);const focused=await act('history').evaluate(e=>e===document.activeElement);if(!before){assert.ok(scroll>0);assert.ok(focused);}return {status:scroll>0&&focused?'PASS':'FAIL',scroll,focused};});
 await check('invalid date range keeps the last valid results and editor open',async()=>{await act('history').click();const old=(await snap()).filters;await page.click('.p06-dates summary');await page.fill('#p06-from','2026-09-09');await page.fill('#p06-to','2026-09-01');await act('dates').click();const count=await page.locator('.p06-event').count(),open=await page.locator('.p06-dates').evaluate(e=>e.open);await capture('invalid-dates');if(!before){assert.equal(count,7);assert.equal(open,true);assert.deepEqual((await snap()).filters,old);}return {status:count===7&&open?'PASS':'FAIL',count,open};});
 await check('cancelled scan context cannot leak into Home picker tool',async()=>{
  await page.click('[data-tab="home"]');await page.click('.hn-scanner');await detail();await act('scan').click();await page.keyboard.press('Escape');await page.click('[data-tab="home"]');await page.click('.p03-tools summary');await page.click('[data-p03-open="picker"]');await page.click('[data-p03-operation="lookup"]');const s=await snap();const nav=JSON.parse(await page.locator('#hn-route-status').textContent());if(!before){assert.equal(s.panel,1);assert.equal(nav.context.restoreLookup,undefined);}return {status:s.panel===1&&!nav.context.restoreLookup?'PASS':'FAIL',panel:s.panel,itemId:nav.context.itemId};
 });
 if(!before){
  await detail();await act('stock').click();await act('back').click();await page.locator('[data-panel="P06.S02"]').waitFor();await page.goBack();await page.locator('[data-panel="P06.S01"]').waitFor();checks.push({name:'app Back does not push a bounce to the child panel',status:'PASS'});
  await detail();await act('history').click();await page.click('.p06-dates summary');await page.fill('#p06-from','');await page.fill('#p06-to','');await act('dates').click();assert.match(await page.locator('.p06-dates summary').textContent(),/Tất cả ngày/);assert.equal(await page.locator('.p06-event').count(),7);await capture('open-range');checks.push({name:'empty date endpoints show a meaningful range summary',status:'PASS'});
  await page.evaluate(()=>location.hash='#p02/lookup?panel=4&item=fixture-component-01');await page.locator('[data-panel="P06.S04"]').waitFor();await capture('component-history');const overlap=await page.locator('.p06-hero').evaluate(e=>{const a=e.querySelector('strong').getBoundingClientRect(),b=e.querySelector('.p06-chip').getBoundingClientRect();return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;});assert.equal(overlap,false);assert.equal(await page.locator('.p06-scroll').evaluate(e=>e.scrollWidth>e.clientWidth),false);checks.push({name:'long item code and missing-data chip do not overlap',status:'PASS'});
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,(before?'before':'after')+'-results.json'),JSON.stringify({checks,errors},null,2));
 }finally{await browser.close();}
})();
