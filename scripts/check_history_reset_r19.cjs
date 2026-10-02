const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.HISTORY_EVIDENCE_DIR||'handoff/P08/evidence/revision-19');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:494,height:1000},permissions:['clipboard-read','clipboard-write']}),page=await context.newPage(),checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date('2026-09-27T05:00:00Z'));
 const act=n=>page.locator('[data-p08="'+n+'"]').first(),snap=async()=>JSON.parse(await page.locator('[data-p08-snapshot]').textContent()),values=()=>page.locator('.p08-date-entry input').evaluateAll(es=>es.map(e=>e.value));
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function hub(scene){await page.click('[data-tab=history]');await page.frameLocator('iframe').locator('[data-action="'+scene+'"]').click();await page.locator('.p08-app').waitFor();}
 async function apply(){await page.locator('.p08-picker [type=submit]').click();}
 async function capture(name){await page.mouse.move(0,0);await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
 try{
 await page.goto(process.env.HISTORY_PREVIEW_URL||'http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');
 await check('All6 Reset fills today/status All, clears invalid state, Cancel/Apply/Clear have distinct correct effects',async()=>{
  for(const scene of ['history-general','history-daily','documents','nfc','warranty','sessions']){
   await hub(scene);const initial=await snap();await act('filter').click();await page.fill('[name=from]','10/09/2026');await page.fill('[name=to]','09/09/2026');await page.locator('[name=status]').nth(1).check();assert.equal(await page.locator('.p08-picker [type=submit]').isDisabled(),true);
   await page.click('[data-reset]');assert.deepEqual(await values(),['27/09/2026','27/09/2026']);assert.equal(await page.locator('[name=status]:checked').inputValue(),'all');assert.equal(await page.locator('[aria-invalid=true]').count(),0);assert.equal(await page.locator('.p08-picker [type=submit]').isEnabled(),true);assert.deepEqual(await snap(),initial);await capture(scene+'-reset');
   await page.getByRole('button',{name:'Hủy',exact:true}).click();assert.deepEqual(await snap(),initial);assert.equal(await page.locator('.p08-filter-summary button').textContent(),'Tất cả ngày');
   await act('filter').click();await page.click('[data-reset]');await apply();assert.equal(await page.locator('.p08-filter-summary button').textContent(),'27/09/2026');
   await act('filter').click();assert.deepEqual(await values(),['27/09/2026','27/09/2026']);await page.keyboard.press('Escape');await act('clear').click();assert.equal(await page.locator('.p08-filter-summary button').textContent(),'Tất cả ngày');
  }
 });
 await check('Reset uses click-time Vietnam day; calendar Today does not reset or change the other endpoint',async()=>{
  await hub('history-general');await act('filter').click();await page.clock.setFixedTime(new Date('2026-09-27T17:01:00Z'));await page.click('[data-reset]');assert.deepEqual(await values(),['28/09/2026','28/09/2026']);
  await page.fill('[name=from]','28/08/2026');await page.fill('[name=to]','09/09/2026');await page.click('[data-calendar=from]');await page.click('[data-today]');assert.equal(await page.locator('.p08-picker').getAttribute('data-view'),'calendar');assert.equal(await page.locator('[data-date="2026-09-28"]').isDisabled(),true);await page.click('[data-calendar-back]');assert.deepEqual(await values(),['28/08/2026','09/09/2026']);await page.keyboard.press('Escape');
  await page.clock.setFixedTime(new Date('2026-09-27T05:00:00Z'));
 });
 await check('Six sizes after Reset: actual dates remain visible, no overflow, footer/focus intact',async()=>{
  for(const [w,h]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
   await page.setViewportSize({width:w,height:h});await act('filter').click();await page.fill('[name=from]','');await page.fill('[name=to]','');await page.click('[data-reset]');assert.deepEqual(await values(),['27/09/2026','27/09/2026']);
   const fit=await page.locator('.p08-picker').evaluate(e=>{const r=e.getBoundingClientRect(),s=e.closest('.hn-screen').getBoundingClientRect();return r.top>=s.top-1&&r.bottom<=s.bottom+1&&r.left>=s.left-1&&r.right<=s.right+1&&e.scrollWidth<=e.clientWidth+1;});assert.equal(fit,true);
   for(let i=0;i<16;i++)await page.keyboard.press('Tab');assert.equal(await page.locator('.p08-picker').evaluate(e=>e.contains(document.activeElement)),true);await capture('reset-'+w+'x'+h);await page.keyboard.press('Escape');
  }await page.setViewportSize({width:494,height:1000});
 });
 await check('Audit copy and detail Back use correct source across general/NFC/warranty',async()=>{
  for(const scene of ['history-general','nfc','warranty']){
   await hub(scene);await page.locator('.p08-row').first().click();const code=await page.locator('.p08-detail-document strong').textContent();await page.evaluate(()=>navigator.clipboard.writeText('before-copy'));await act('copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),code);await page.locator('.hn-action-dialog[open] [data-action-dialog=confirm]').click();await page.locator('.hn-action-dialog[open]').waitFor({state:'detached'});await page.waitForFunction(()=>document.querySelector('[data-p08=copy]')===document.activeElement);await act('back').click();await page.locator('.p08-row').first().waitFor();
  }
  await hub('warranty');await page.locator('.p08-row').first().click();await page.evaluate(()=>{window.originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw Error('denied');};});await act('copy').click();await page.locator('.hn-action-dialog[open]').waitFor();assert.match(await page.locator('.hn-action-dialog[open]').textContent(),/Không truy cập/);await page.locator('.hn-action-dialog[open] [data-action-dialog=confirm]').click();await page.locator('.hn-action-dialog[open]').waitFor({state:'detached'});await page.evaluate(()=>navigator.clipboard.writeText=window.originalWrite);
  await page.evaluate(()=>{navigator.clipboard.writeText=()=>new Promise(resolve=>{window.resolveLateCopy=resolve;});});await act('copy').click();await page.click('[data-p08-tab=timeline]');await page.evaluate(()=>window.resolveLateCopy());assert.equal(await page.locator('.hn-action-dialog[open]').count(),0);assert.equal(await page.locator('.p08-feedback').count(),0);assert.equal(await page.locator('[data-p08-tab=timeline]').getAttribute('aria-selected'),'true');await page.evaluate(()=>navigator.clipboard.writeText=window.originalWrite);
 });
 await check('Live reverse ranges and90-day cutoff remain blocked after Reset; same-day allowed',async()=>{
  await hub('history-daily');await act('filter').click();await page.click('[data-reset]');assert.equal(await page.locator('.p08-picker [type=submit]').isEnabled(),true);
  for(const [from,to]of [['27/09/2026','26/09/2026'],['28/06/2026','27/09/2026'],['27/09/2026','28/09/2026']]){
   await page.fill('[name=from]',from);await page.fill('[name=to]',to);assert.equal(await page.locator('.p08-picker [type=submit]').isDisabled(),true);await page.locator('.p08-picker form').evaluate(f=>f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));assert.equal(await page.locator('.p08-picker').count(),1);
  }await page.click('[data-reset]');assert.deepEqual(await values(),['27/09/2026','27/09/2026']);assert.equal(await page.locator('[aria-invalid=true]').count(),0);await page.keyboard.press('Escape');
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'reset-results.json'),JSON.stringify({revision:'P08-r19',checks,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,error:e.stack,errors},null,2));throw e;}finally{await browser.close();}
})();
