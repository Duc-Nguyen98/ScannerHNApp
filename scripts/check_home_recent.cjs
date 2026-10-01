const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.HOME_RECENT_EVIDENCE_DIR||'handoff/P02/evidence/revision-14-recent');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:950},deviceScaleFactor:1});const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
const home=async()=>{await page.locator('[data-tab=home]').click();await page.locator('#hn-home').waitFor({state:'visible'});};
const recent=()=>page.locator('[data-recent-document]').evaluateAll(ns=>ns.map(n=>({id:n.dataset.recentDocument,number:n.dataset.id,text:n.textContent})));
async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
try{
 await page.clock.setFixedTime(new Date('2026-09-29T01:15:20Z'));await page.goto((process.env.PREVIEW_BASE_URL||'http://127.0.0.1:8766')+'/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.locator('[data-recent-document]').first().waitFor();
 const initial=await recent(),shift=await page.locator('[data-shift-start]').getAttribute('datetime');
 await check('Home shows exactly the three newest source documents, no hardcoded April rows',async()=>{
  assert.deepEqual(initial.map(r=>r.number),['PX-0011','PN-0011','PX-0010']);assert.equal(initial.length,3);
  await page.locator('.hn-intro h1').focus();await page.screenshot({path:path.join(out,'after.png')});
 });
 await check('Each recent row opens exact P12 doc ID and header Back returns to focused Home row',async()=>{
  for(const row of initial){await page.locator(`[data-recent-document="${row.id}"]`).click();await page.locator('[data-panel="P12.S02"]').waitFor();assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('doc'),row.id);assert.match(await page.locator('.p12-context').textContent(),new RegExp(row.number));await page.locator('[data-p12=back]').click();await page.locator('#hn-home').waitFor({state:'visible'});assert.equal(await page.locator(`[data-recent-document="${row.id}"]`).evaluate(n=>n===document.activeElement),true);}
 });
 await page.click('[data-tab=documents]');await page.fill('#p12-query','PN-0005');await home();
 await check('View all opens full P12 list newest first, clears stale query, and keeps its own state on Back',async()=>{
  await page.locator('[data-home-documents]').press('Enter');await page.locator('.p12-record').first().waitFor();assert.match(page.url(),/#p02\/documents\?panel=1&entry=home-recent/);assert.equal(await page.locator('#p12-query').inputValue(),'');assert.equal(await page.locator('.p12-record').count(),24);
  assert.deepEqual(await page.locator('.p12-record').evaluateAll(ns=>ns.slice(0,3).map(n=>n.dataset.p12Doc)),initial.map(r=>r.id));await page.screenshot({path:path.join(out,'all-documents.png')});
  await page.fill('#p12-query','PX-0011');await page.locator('.p12-record').click();await page.locator('[data-panel="P12.S02"]').waitFor();await page.goBack();await page.locator('#p12-query').waitFor();assert.equal(await page.locator('#p12-query').inputValue(),'PX-0011');
  await page.goBack();await page.locator('#hn-home').waitFor({state:'visible'});assert.equal(await page.locator('[data-home-documents]').evaluate(n=>n===document.activeElement),true);
  await page.click('[data-tab=documents]');assert.equal(await page.locator('#p12-query').inputValue(),'PN-0005');await home();
 });
 await check('History nav remains the history hub, independently of View all',async()=>{
  await page.click('[data-tab=history]');await page.frameLocator('iframe').getByRole('heading',{name:'Lịch sử thao tác',exact:true}).waitFor();assert.equal(new URL(page.url()).hash,'#p02/history');await page.goBack();await page.locator('#hn-home').waitFor({state:'visible'});
 });
 await check('Shared source updates refresh top three; removed-row focus falls back to section heading',async()=>{
  const last=initial.at(-1);await page.locator(`[data-recent-document="${last.id}"]`).click();await page.locator('[data-panel="P12.S02"]').waitFor();
  await page.evaluate(async()=>{const m=await import('/flows/shared/warranty-cases.mjs');const row=m.readWarrantyCases().find(r=>r.id==='BH-002');m.writeWarrantyCase({...row,day:'2026-09-29',time:'08:16'});});
  await page.goBack();await page.locator('#hn-home').waitFor({state:'visible'});const refreshed=await recent();assert.equal(refreshed.length,3);assert.equal(refreshed[0].number,'BH-002');assert.ok(!refreshed.some(r=>r.id===last.id));assert.equal(await page.locator('#hn-recent-title').evaluate(n=>n===document.activeElement),true);assert.equal(await page.locator('[data-shift-start]').getAttribute('datetime'),shift);
  await page.evaluate(async()=>{(await import('/flows/shared/warranty-cases.mjs')).resetWarrantyCases();});
 });
 await check('UNKNOWN shows no fake rows; new View all resets latest view instead of stale search',async()=>{
  await page.getByText('Kịch bản kiểm tra P02',{exact:true}).click();await page.selectOption('#hn-scenario','unknown');assert.equal(await page.locator('.hn-record').count(),0);assert.match(await page.locator('.hn-recent-list').textContent(),/Chưa xác minh/);await page.selectOption('#hn-scenario','baseline');
  await page.click('[data-home-documents]');await page.locator('#p12-query').waitFor();assert.equal(await page.locator('#p12-query').inputValue(),'');assert.equal(await page.locator('.p12-record').count(),24);await home();
 });
 for(const [w,h]of [[494,950],[360,800],[430,932],[1264,712]]){await page.setViewportSize({width:w,height:h});await page.evaluate(()=>scrollTo(0,0));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const metrics=await page.evaluate(()=>{const n=document.querySelector('.hn-record:last-child').getBoundingClientRect(),nav=document.querySelector('.hn-nav').getBoundingClientRect();return{last:n.bottom,nav:nav.y,overflow:document.documentElement.scrollWidth>innerWidth};});assert.ok(metrics.last<=metrics.nav);assert.equal(metrics.overflow,false);await page.locator('.hn-intro h1').focus();await page.screenshot({path:path.join(out,`home-${w}.png`)});}
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,initial,errors,viewports:4,fixtureClock:'2026-09-29T01:15:20Z'},null,2));
}catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:e.stack,checks,errors},null,2));throw e;}finally{await browser.close();}
})();
