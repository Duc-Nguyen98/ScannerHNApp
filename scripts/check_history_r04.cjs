const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.HISTORY_R04_EVIDENCE_DIR||'handoff/P08/evidence/revision-04');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const act=n=>page.locator('[data-p08="'+n+'"]').first(),snap=async()=>JSON.parse(await page.locator('[data-p08-snapshot]').textContent());
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function apply(){await page.locator('.p08-picker [type="submit"]').click();}
 async function screenshot(name){await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
 try{
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.click('[data-tab="history"]');await page.frameLocator('iframe').locator('[data-action="history-general"]').click();
 await check('Compact list removes redundant controls; no native selects/dates inside P08',async()=>{
   assert.equal(await page.locator('.p08-demo-label,[data-p08="more"],[data-p08="day"],[data-p08="session"],.p08-app select,.p08-app input[type=date]').count(),0);
   assert.equal(await page.locator('.p08-row').count(),6);assert.match(await page.locator('.p08-result-count').textContent(),/48 kết quả/);
 });
 await check('List/filter/calendar/sort contained in app at six viewports',async()=>{
   for(const [w,h]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
    await page.setViewportSize({width:w,height:h});await screenshot('list-'+w+'x'+h);
    for(const mode of ['filter','calendar','sort']){
     await act(mode==='sort'?'sort':'filter').click();if(mode==='calendar')await page.click('[data-calendar="from"]');
     const m=await page.locator('.p08-picker').evaluate(e=>{const a=e.closest('.hn-screen').getBoundingClientRect(),r=e.getBoundingClientRect();return {inside:r.left>=a.left-1&&r.right<=a.right+1&&r.top>=a.top-1&&r.bottom<=a.bottom+1,overflow:e.scrollWidth>e.clientWidth+1,hosts:document.querySelectorAll('.app-modal-host').length};});
     assert.equal(m.inside,true);assert.equal(m.overflow,false);assert.equal(m.hosts,1);await screenshot(mode+'-'+w+'x'+h);await page.keyboard.press('Escape');
    }
   }
   await page.setViewportSize({width:494,height:1000});
 });
 await check('Filter draft cancel, invalid dates/range, calendar, radio selection and focus trap',async()=>{
   await act('filter').click();await page.fill('[name=from]','31/02/2026');await apply();assert.match(await page.locator('[data-error]').textContent(),/hợp lệ/);
   await page.fill('[name=from]','10/09/2026');await apply();assert.match(await page.locator('[data-error]').textContent(),/không được/);
   await page.click('[data-calendar="from"]');await page.click('[data-date="2026-09-09"]');
   await page.locator('[name=status][value=waiting]').check();for(let i=0;i<20;i++)await page.keyboard.press('Tab');
   assert.equal(await page.locator('.p08-picker').evaluate(e=>e.contains(document.activeElement)),true);await apply();
   assert.equal((await snap()).filters.from,'2026-09-09');assert.equal((await snap()).filters.status,'waiting');
   await act('filter').click();await page.locator('[name=status][value=all]').check();await page.keyboard.press('Escape');assert.equal((await snap()).filters.status,'waiting');assert.equal(await act('filter').evaluate(e=>e===document.activeElement),true);
 });
 await check('Clear and sort preserve scope; query/category combine and auto-load gives all48 unique IDs',async()=>{
   await act('clear').click();await act('sort').click();await page.locator('[name=sort][value=desc]').check();await apply();assert.equal((await snap()).filters.sort,'desc');
   await page.click('[data-p08-type=inbound]');await page.fill('#p08-search','HN12345');assert.equal(await page.locator('.p08-row').count(),1);
   await act('clear').click();for(let i=0;i<6;i++){await page.locator('.p08-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);await page.waitForTimeout(80);}
   assert.equal(await page.locator('.p08-row').count(),48);const ids=await page.locator('.p08-row').evaluateAll(es=>es.map(e=>e.dataset.p08Record));assert.equal(new Set(ids).size,48);assert.match(await page.locator('.p08-list-end').textContent(),/đủ 48/);await screenshot('list-end');
 });
 await check('Detail Back keeps expanded count and exact scroll; daily custom picker updates groups',async()=>{
   const row=page.locator('.p08-row').nth(40);await row.scrollIntoViewIfNeeded();const top=await page.locator('.p08-scroll').evaluate(e=>e.scrollTop);await row.click();await act('back').click();await page.locator('.p08-list').waitFor();
   assert.equal(await page.locator('.p08-row').count(),48);assert.equal(await page.locator('.p08-scroll').evaluate(e=>e.scrollTop),top);
   await page.click('[data-p08-preview="4"]');await act('choose-day').click();await page.click('[data-calendar=day]');await page.click('[data-date="2026-09-08"]');await apply();assert.equal((await snap()).day,'2026-09-08');assert.deepEqual(await page.locator('.p08-grid strong').allTextContents(),['3','2','1','1','1','8']);await screenshot('daily');
   await page.locator('[data-p08-group=warranty]').click();assert.equal((await snap()).filters.from,'2026-09-08');assert.equal(await page.locator('.p08-row').count(),1);
 });
 await check('Keyboard auto-load retains focus; filter reset cancel, sort ascending, month navigation and detail/session regression',async()=>{
   await page.click('[data-p08-preview="1"]');await act('clear').click();
   await page.locator('.p08-scroll').focus();for(let i=0;i<8;i++){await page.keyboard.press('PageDown');await page.waitForTimeout(80);}
   assert.ok(await page.locator('.p08-row').count()>6);assert.equal(await page.locator('.p08-scroll').evaluate(e=>e===document.activeElement),true);
   await page.locator('.p08-scroll').evaluate(e=>e.scrollTop=0);await act('sort').click();await page.locator('[name=sort][value=asc]').check();await apply();assert.equal((await snap()).filters.sort,'asc');
   await act('filter').click();await page.click('[data-reset]');await page.keyboard.press('Escape');assert.equal((await snap()).filters.sort,'asc');
   await act('filter').click();await page.click('[data-calendar=from]');await page.click('[data-month="-1"]');assert.match(await page.locator('.p08-calendar-head strong').textContent(),/Tháng 8/);await page.click('[data-month="1"]');await page.locator('[data-date="2026-09-09"]').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('[data-date="2026-09-10"]').evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Enter');await apply();assert.equal((await snap()).filters.from,'2026-09-10');
   await page.click('[data-p08-preview="2"]');await page.locator('[data-p08-tab="timeline"]').click();assert.equal(await page.locator('[data-event-id]').count(),4);await page.locator('[data-p08-tab="attachments"]').click();assert.match(await page.locator('[role=tabpanel]').textContent(),/Chưa có tệp nguồn/);await screenshot('detail-attachments');
   await page.click('[data-p08-preview="3"]');assert.deepEqual(await page.locator('.p08-counters strong').allTextContents(),['19','18','1']);await act('codes').click();assert.equal(await page.locator('[data-scan-id]').count(),19);await screenshot('session');await act('p23').click();await page.frameLocator('iframe').locator('[data-session="PQ-0001"]').click();assert.deepEqual(await page.locator('.p08-counters strong').allTextContents(),['19','18','1']);
   await page.click('[data-p08-preview="1"]');
 });
 await check('Source error/empty/loading preserved; documents scope clear stays scoped; logout guard',async()=>{
   for(const s of ['loading','error','empty','unavailable']){await page.selectOption('[data-p08-scenario]',s);assert.equal(await page.locator('.p08-row').count(),0);}
   await page.selectOption('[data-p08-scenario]','ready');await page.click('[data-tab=history]');await page.frameLocator('iframe').locator('[data-action=documents]').click();await act('clear').click();assert.equal((await snap()).filters.scope,'documents');assert.match(await page.locator('.p08-result-count').textContent(),/29 kết quả/);
   await act('filter').click();await page.keyboard.press('Escape');await page.locator('.hn-tools>details').first().locator('summary').click();await page.click('#hn-logout');await page.goBack();await page.locator('#login-form').waitFor();
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({revision:'P08-r04',checks,errors,integration:'NOT_RUN'},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await browser.close();}
})();
