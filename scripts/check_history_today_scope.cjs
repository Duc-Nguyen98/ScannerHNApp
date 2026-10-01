const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/P08/evidence/revision-18');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],errors=[],metrics=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date('2026-09-27T05:00:00Z'));
 const act=n=>page.locator('[data-p08="'+n+'"]').first(),values=()=>page.locator('.p08-date-entry input').evaluateAll(es=>es.map(e=>e.value)),snap=async()=>JSON.parse(await page.locator('[data-p08-snapshot]').textContent());
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function hub(scene){await page.click('[data-tab=history]');await page.frameLocator('iframe').locator('[data-action="'+scene+'"]').click();await page.locator('.p08-app').waitFor();}
 async function capture(name){await page.mouse.move(0,0);await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
 try{
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');
 await check('All6: Today only navigates current calendar month; Reset/Today match selected-day teal',async()=>{
  for(const scene of ['history-general','history-daily','documents','nfc','warranty','sessions']){
   await hub(scene);const before=await snap();await act('filter').click();assert.equal(await page.locator('[data-today]').count(),0);
   const resetColor=await page.locator('[data-reset]').evaluate(e=>getComputedStyle(e).backgroundColor);
   await page.fill('[name=from]','28/08/2026');await page.fill('[name=to]','27/09/2026');await page.click('[data-calendar=from]');
   const selectedColor=await page.locator('[data-date="2026-08-28"]').evaluate(e=>getComputedStyle(e).backgroundColor),todayColor=await page.locator('[data-today]').evaluate(e=>getComputedStyle(e).backgroundColor);
   assert.equal(resetColor,'rgb(0, 109, 145)');assert.equal(todayColor,resetColor);assert.equal(selectedColor,resetColor);await capture(scene+'-calendar-before');
   await page.click('[data-today]');assert.equal(await page.locator('.p08-picker').getAttribute('data-view'),'calendar');assert.match(await page.locator('.p08-calendar-head strong').textContent(),/Tháng 9 \/ 2026/);assert.equal(await page.locator('[data-date="2026-09-27"]').getAttribute('aria-current'),'date');assert.equal(await page.locator('[data-date="2026-09-27"]').getAttribute('aria-pressed'),'false');await capture(scene+'-calendar-today');
   await page.click('[data-calendar-back]');assert.deepEqual(await values(),['28/08/2026','27/09/2026']);assert.deepEqual(await snap(),before);
   await page.keyboard.press('Escape');assert.deepEqual(await snap(),before);
  }
 });
 await check('From remains blocked beyond To after Today; explicit date selection updates only active endpoint',async()=>{
  await hub('nfc');await act('filter').click();await page.fill('[name=from]','01/08/2026');await page.fill('[name=to]','28/08/2026');await page.locator('[name=status][value=success]').check();
  await page.click('[data-calendar=from]');await page.click('[data-today]');assert.equal(await page.locator('[data-date="2026-09-27"]').isDisabled(),true);assert.match(await page.locator('.p08-calendar-notice').textContent(),/Đến ngày/);await capture('today-blocked-by-end');
  await page.locator('[data-date="2026-09-27"]').evaluate(e=>{e.disabled=false;e.click();});assert.equal(await page.locator('.p08-picker').getAttribute('data-view'),'calendar');await page.click('[data-calendar-back]');assert.deepEqual(await values(),['01/08/2026','28/08/2026']);
  await page.click('[data-calendar=to]');await page.click('[data-today]');assert.equal(await page.locator('[data-date="2026-09-27"]').isEnabled(),true);await page.click('[data-date="2026-09-27"]');assert.deepEqual(await values(),['01/08/2026','27/09/2026']);assert.equal(await page.locator('[name=status]:checked').inputValue(),'success');await capture('end-only-updated');
  await page.click('[data-calendar=from]');await page.click('[data-today]');await page.click('[data-date="2026-09-26"]');assert.deepEqual(await values(),['26/09/2026','27/09/2026']);
  await page.locator('.p08-picker [type=submit]').click();assert.equal((await snap()).filters.from,'2026-09-26');assert.equal((await snap()).filters.to,'2026-09-27');
 });
 await check('Today honors Vietnam midnight without modifying draft;6viewports stay inside app',async()=>{
  await act('clear').click();await act('filter').click();await page.fill('[name=from]','28/08/2026');await page.fill('[name=to]','27/09/2026');await page.click('[data-calendar=from]');
  await page.clock.setFixedTime(new Date('2026-09-27T17:01:00Z'));await page.click('[data-today]');assert.equal(await page.locator('[data-date="2026-09-28"]').getAttribute('aria-current'),'date');assert.equal(await page.locator('[data-date="2026-09-28"]').isDisabled(),true);
  for(const [w,h]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
   await page.setViewportSize({width:w,height:h});const m=await page.locator('.p08-picker').evaluate(e=>{const r=e.getBoundingClientRect(),s=e.closest('.hn-screen').getBoundingClientRect();return {inside:r.top>=s.top-1&&r.bottom<=s.bottom+1&&r.left>=s.left-1&&r.right<=s.right+1,overflow:e.scrollWidth>e.clientWidth+1};});assert.deepEqual(m,{inside:true,overflow:false});metrics.push({w,h,...m});await capture('today-'+w+'x'+h);
  }await page.click('[data-calendar-back]');assert.deepEqual(await values(),['28/08/2026','27/09/2026']);await page.click('[data-reset]');assert.deepEqual(await values(),['','']);await page.locator('.p08-picker [type=submit]').click();assert.equal(await page.locator('.p08-filter-summary button').textContent(),'Tất cả ngày');
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'today-results.json'),JSON.stringify({revision:'P08-r18',checks,metrics,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await browser.close();}
})();
