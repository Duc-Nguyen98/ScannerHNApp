const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.HISTORY_DETAIL_EVIDENCE_DIR||'handoff/P08/evidence/revision-05');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),ctx=await browser.newContext({viewport:{width:494,height:1000},permissions:['clipboard-read','clipboard-write']}),page=await ctx.newPage();
 const checks=[],metrics=[],errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8766')&&!r.url().startsWith('data:'))external.push(r.url());});
 const act=n=>page.locator('[data-p08="'+n+'"]').first();
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function record(id){await page.click('[data-tab=history]');await page.frameLocator('iframe').locator('[data-action=history-general]').click();await page.fill('#p08-search',id);await page.click('[data-p08-record="'+id+'"]');await page.locator('.p08-detail-hero').waitFor();}
 async function capture(name){
  const m=await page.locator('.p08-app').evaluate(e=>{const s=e.closest('.hn-screen'),scroll=e.querySelector('.p08-scroll'),nav=s.querySelector('.hn-nav');return {css:[s.offsetWidth,s.offsetHeight],overflow:scroll.scrollWidth>scroll.clientWidth+1,nav:scroll.getBoundingClientRect().bottom<=nav.getBoundingClientRect().top+1,bad:[...e.querySelectorAll('button,strong,dd,dt,time')].filter(n=>n.clientWidth&&n.scrollWidth>n.clientWidth+1).map(n=>n.textContent),tabs:[...e.querySelectorAll('[role=tab]')].map(n=>n.offsetHeight),copy:e.querySelector('[data-p08=copy]')?.offsetWidth};});
  assert.deepEqual(m.css,[494,950]);assert.equal(m.overflow,false);assert.equal(m.nav,true);assert.deepEqual(m.bad,[]);assert.ok(m.tabs.every(h=>h>=44));if(m.copy)assert.equal(m.copy,44);metrics.push({name,...m});await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});
 }
 try{
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');
 await check('User LS-0026 record exact; no fake completion/no demo label/no duplicate shortcuts',async()=>{
  await record('LS-0026');assert.match(await page.locator('.p08-detail-document').textContent(),/BH-DEMO-026/);assert.equal(await page.locator('.p08-demo-label,.p08-success,[data-p08=timeline]').count(),0);assert.doesNotMatch(await page.locator('.p08-app').textContent(),/✓|Hoàn thành/);assert.equal(await page.locator('.p08-detail-status').getAttribute('class'),'p08-detail-status processing');assert.match(await page.locator('.p08-detail-note').textContent(),/Chưa có ghi chú/);assert.equal(await page.locator('.p08-detail-document button').count(),1);
 });
 await check('Three detail tabs across six viewports and 4 status types',async()=>{
  for(const [w,h]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
   await page.setViewportSize({width:w,height:h});
   for(const tab of ['info','timeline','attachments']){await page.click('[data-p08-tab="'+tab+'"]');await page.locator('.p08-scroll').evaluate(e=>e.scrollTop=0);await capture('LS-0026-'+tab+'-'+w+'x'+h);}
  }
  await page.setViewportSize({width:494,height:1000});
  for(const [id,status] of [['LS-0001','waiting'],['LS-0004','linked'],['LS-0005','recorded']]){await record(id);assert.ok((await page.locator('.p08-detail-status').getAttribute('class')).includes(status));await capture(id+'-info');}
 });
 await check('Copy receipt/denial keeps focus and ID; list Back restores query',async()=>{
  await record('LS-0026');await act('copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'BH-DEMO-026');assert.match(await page.locator('.p08-feedback').textContent(),/Đã sao chép BH-DEMO-026/);assert.equal(await act('copy').evaluate(e=>e===document.activeElement),true);
  await page.evaluate(()=>{window.originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw Error('denied');};});await act('copy').click();assert.match(await page.locator('.p08-feedback').textContent(),/Không truy cập/);await page.evaluate(()=>navigator.clipboard.writeText=window.originalWrite);
  await act('back').click();await page.locator('#p08-search').waitFor();assert.equal(await page.inputValue('#p08-search'),'LS-0026');
 });
 await check('Keyboard tabs, exact timeline and honest zero/unavailable attachments',async()=>{
  await page.click('[data-p08-record="LS-0026"]');await page.locator('[data-p08-tab=info]').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('[data-event-id]').count(),1);assert.match(await page.locator('.p08-detail-timeline').textContent(),/09\/09\/2026 · 13:13/);
  await page.keyboard.press('End');assert.match(await page.locator('[role=tabpanel]').textContent(),/Chưa có tệp đính kèm/);assert.equal(await page.locator('[role=tabpanel] button').count(),0);
  await record('LS-0001');assert.match(await page.locator('.p08-detail-waiting').textContent(),/chưa ghi sổ/);assert.match(await page.locator('.p08-detail-note').textContent(),/ĐH-2026-1023/);
  await page.click('[data-p08-tab=timeline]');assert.deepEqual(await page.locator('[data-event-id]').evaluateAll(es=>es.map(e=>e.dataset.eventId)),['B08-LS1-E1','B08-LS1-E2','B08-LS1-E3','B08-LS1-E4']);await capture('LS-0001-timeline');
  await page.click('[data-p08-tab=attachments]');assert.equal(await page.locator('.p08-detail-files li').count(),2);assert.match(await page.locator('.p08-detail-files').textContent(),/Chưa có tệp nguồn/);await capture('LS-0001-attachments');
 });
 await check('Session/NFC dependencies use exact IDs; unavailable source; logout Back protection',async()=>{
  await act('session').click();assert.deepEqual(await page.locator('.p08-counters strong').allTextContents(),['19','18','1']);await act('back').click();await page.locator('.p08-detail-hero').waitFor();
  await record('LS-0004');await act('nfc').click();assert.match(await page.frameLocator('iframe').locator('.summary-card').textContent(),/HN12345/);await page.frameLocator('iframe').locator('.phone-header button').click();await page.locator('.p08-detail-hero').waitFor();
  for(const mode of ['loading','error','unavailable']){await page.selectOption('[data-p08-scenario]',mode);assert.equal(await page.locator('.p08-detail-hero').count(),0);}await page.selectOption('[data-p08-scenario]','ready');
  await page.locator('.hn-tools>details').first().locator('summary').click();await page.click('#hn-logout');await page.goBack();await page.locator('#login-form').waitFor();assert.equal(await page.locator('.p08-app').count(),0);
 });
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({revision:'P08-r05',checks,metrics,errors,external,integration:'NOT_RUN'},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,error:e.stack},null,2));throw e;}finally{await browser.close();}
})();
