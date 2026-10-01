const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.QUERY_DATE_EVIDENCE_DIR||'handoff/P08/evidence/revision-10');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000},timezoneId:'Asia/Ho_Chi_Minh'}),checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.setFixedTime(new Date('2026-09-27T05:00:00Z'));
 const act=n=>page.locator('[data-p08="'+n+'"]').first(),snap=async()=>JSON.parse(await page.locator('[data-p08-snapshot]').textContent());
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function apply(){await page.locator('.p08-picker [type=submit]').click();}
 async function capture(name){await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
 try{
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.click('[data-tab=history]');await page.frameLocator('iframe').locator('[data-action=history-general]').click();
 await check('Filter help/calendar fit six scaled viewports with one overlay and trapped focus',async()=>{
  for(const [w,h]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
   await page.setViewportSize({width:w,height:h});await act('filter').click();
   const fit=await page.locator('.p08-picker').evaluate(e=>{const r=e.getBoundingClientRect(),s=e.closest('.hn-screen').getBoundingClientRect();return r.top>=s.top-1&&r.bottom<=s.bottom+1&&e.scrollWidth<=e.clientWidth+1;});assert.equal(fit,true);
   for(let i=0;i<12;i++)await page.keyboard.press('Tab');assert.equal(await page.locator('.p08-picker').evaluate(e=>e.contains(document.activeElement)),true);await capture('filter-'+w+'x'+h);await page.keyboard.press('Escape');
  }await page.setViewportSize({width:494,height:1000});
 });
 await check('P08 calendar blocks future/day91, permits today/day90 and stops boundary months',async()=>{
  await act('filter').click();await page.click('[data-calendar=from]');
  assert.equal(await page.locator('[data-date="2026-09-28"]').isDisabled(),true);assert.equal(await page.locator('[data-date="2026-09-27"]').isEnabled(),true);assert.equal(await page.locator('[data-month="1"]').isDisabled(),true);await capture('calendar-future');
  for(let i=0;i<3;i++)await page.click('[data-month="-1"]');
  assert.equal(await page.locator('[data-date="2026-06-28"]').isDisabled(),true);assert.equal(await page.locator('[data-date="2026-06-29"]').isEnabled(),true);assert.equal(await page.locator('[data-month="-1"]').isDisabled(),true);
  await capture('calendar-oldest');await page.locator('[data-date="2026-06-29"]').focus();await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('[data-date="2026-06-29"]').evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Enter');
  await page.fill('[name=to]','27/09/2026');await apply();assert.equal((await snap()).filters.from,'2026-06-29');assert.equal((await snap()).filters.to,'2026-09-27');
 });
 await check('P08 typed outside dates rejected, state preserved, single empty bound normalized; all blank manual',async()=>{
  await act('filter').click();const before=(await snap()).filters;
  for(const value of ['28/06/2026','28/09/2026','31/02/2026']){await page.fill('[name=from]',value);await apply();assert.ok(await page.locator('[data-error]').textContent());assert.deepEqual((await snap()).filters,before);}
  await page.fill('[name=from]','');await page.fill('[name=to]','27/09/2026');await apply();assert.equal((await snap()).filters.from,'2026-06-29');
  await act('filter').click();await page.click('[data-reset]');await apply();assert.equal((await snap()).filters.from,'');assert.equal((await snap()).filters.to,'');
 });
 await check('P08 daily uses same bounds; validation recalculates after Vietnam midnight',async()=>{
  await page.click('[data-p08-preview="4"]');await act('choose-day').click();await page.fill('[name=day]','28/06/2026');await apply();assert.ok(await page.locator('[data-error]').textContent());await page.fill('[name=day]','28/09/2026');await apply();assert.ok(await page.locator('[data-error]').textContent());await page.fill('[name=day]','29/06/2026');
  await page.clock.setFixedTime(new Date('2026-09-27T17:00:01Z'));await apply();assert.ok(await page.locator('[data-error]').textContent());await page.fill('[name=day]','28/09/2026');await apply();assert.equal((await snap()).day,'2026-09-28');
  await page.clock.setFixedTime(new Date('2026-09-27T05:00:00Z'));
 });
 await check('P06 min/max and flow validation reject date bypass; manual clear preserves history',async()=>{
  await page.click('[data-tab=home]');await page.locator('.hn-scanner[data-route=lookup]').click();await page.fill('#p06-search','HN12345');await page.locator('[data-p06-item]').first().click();await page.click('[data-p06=history]');await page.locator('.p06-dates summary').click();
  for(const id of ['p06-from','p06-to']){assert.equal(await page.locator('#'+id).getAttribute('min'),'2026-06-29');assert.equal(await page.locator('#'+id).getAttribute('max'),'2026-09-27');}
  await page.fill('#p06-from','2026-06-28');assert.equal(await page.locator('[data-p06=dates]').isDisabled(),true);assert.match(await page.locator('#p06-date-error').textContent(),/phạm vi/);
  await page.fill('#p06-from','2026-06-29');await page.fill('#p06-to','2026-09-28');assert.equal(await page.locator('[data-p06=dates]').isDisabled(),true);assert.match(await page.locator('#p06-date-error').textContent(),/phạm vi/);
  await page.fill('#p06-to','2026-09-27');await page.locator('[data-p06=dates]').click();await page.locator('.p06-dates summary').click();await capture('p06-date-limits');
  await page.locator('[data-p06=clear-dates]').click();assert.equal(JSON.parse(await page.locator('[data-p06-snapshot]').textContent()).filters.from,'');assert.ok(await page.locator('.p06-event').count()>0);
 });
 await check('Older-than90 fixture remains accessible manually; neither source nor result IDs deleted',async()=>{
  await page.clock.setFixedTime(new Date('2027-02-01T05:00:00Z'));
  await page.click('[data-tab=history]');await page.frameLocator('iframe').locator('[data-action=history-daily]').click();await act('choose-day').click();await page.click('[data-manual]');
  assert.match(await page.locator('.p08-result-count').textContent(),/48 kết quả/);await page.fill('#p08-search','LS-0001');await page.click('[data-p08-record="LS-0001"]');assert.match(await page.locator('.p08-detail-document').textContent(),/PN-0005/);await capture('manual-old-history');
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({revision:'P08-r10/P06-date-policy',checks,errors,clock:'Frozen 2026-09-27 Vietnam; midnight and 2027-02-01 tested',integration:'NOT_RUN'},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await browser.close();}
})();
