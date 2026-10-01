const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/P08/evidence/revision-16');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],metrics=[],errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date('2026-09-27T05:00:00Z'));
 const act=n=>page.locator('[data-p08="'+n+'"]').first(),apply=()=>page.locator('.p08-picker [type=submit]'),snap=async()=>JSON.parse(await page.locator('[data-p08-snapshot]').textContent());
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function hub(scene){await page.click('[data-tab=history]');await page.frameLocator('iframe').locator('[data-action="'+scene+'"]').click();await page.locator('.p08-app').waitFor();}
 async function capture(name){await page.mouse.move(0,0);await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
 try{
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');
 await check('Live two-way validation across6 filters, equality allowed, invalid submit cannot commit, Today draft-only',async()=>{
  for(const scene of ['history-general','history-daily','documents','nfc','warranty','sessions']){
   await hub(scene);const before=await snap();await act('filter').click();
   await page.fill('[name=from]','08/09/2026');await page.fill('[name=to]','09/09/2026');assert.equal(await apply().isEnabled(),true);
   await page.fill('[name=from]','10/09/2026');assert.equal(await apply().isDisabled(),true);assert.equal(await page.locator('[name=from]').getAttribute('aria-invalid'),'true');assert.equal(await page.locator('[name=to]').getAttribute('aria-invalid'),'true');assert.match(await page.locator('#pick-from-error').textContent(),/sau/);assert.match(await page.locator('#pick-to-error').textContent(),/trước/);
   assert.equal(await page.locator('[name=from]').evaluate(e=>getComputedStyle(e.parentElement).borderTopColor),'rgb(180, 35, 50)');
   await page.locator('.p08-picker form').evaluate(f=>f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));assert.deepEqual(await snap(),before);await capture(scene+'-invalid');
   await page.fill('[name=from]','09/09/2026');assert.equal(await apply().isEnabled(),true);assert.equal(await page.locator('#pick-from-error').isVisible(),false);
   await page.fill('[name=to]','08/09/2026');assert.equal(await apply().isDisabled(),true);await page.getByRole('button',{name:'Hôm nay',exact:true}).click();assert.deepEqual(await page.locator('.p08-date-entry input').evaluateAll(es=>es.map(e=>e.value)),['27/09/2026','27/09/2026']);assert.equal(await apply().isEnabled(),true);assert.deepEqual(await snap(),before);await capture(scene+'-today');
   await page.keyboard.press('Escape');assert.deepEqual(await snap(),before);
  }
 });
 await check('Calendar selection constrained in both directions; forged disabled day rejected; Today returns both fields',async()=>{
  await hub('history-general');await act('filter').click();await page.fill('[name=from]','08/09/2026');await page.fill('[name=to]','09/09/2026');
  await page.click('[data-calendar=from]');assert.equal(await page.locator('[data-date="2026-09-10"]').isDisabled(),true);assert.equal(await page.locator('[data-date="2026-09-09"]').isEnabled(),true);await capture('calendar-from');
  await page.locator('[data-date="2026-09-10"]').evaluate(b=>{b.disabled=false;b.click();});assert.equal(await page.locator('.p08-picker').getAttribute('data-view'),'calendar');
  await page.click('[data-calendar-back]');assert.equal(await page.inputValue('[name=from]'),'08/09/2026');
  await page.click('[data-calendar=to]');assert.equal(await page.locator('[data-date="2026-09-07"]').isDisabled(),true);assert.equal(await page.locator('[data-date="2026-09-08"]').isEnabled(),true);await capture('calendar-to');
  await page.getByRole('button',{name:'Hôm nay',exact:true}).click();assert.equal(await page.locator('.p08-picker').getAttribute('data-view'),'filter');assert.equal(await page.inputValue('[name=from]'),'27/09/2026');await apply().click();assert.equal(await page.locator('.p08-filter-summary button').textContent(),'27/09/2026');
 });
 await check('Today uses new Vietnam day, preserves status; Reset clears errors without commit; partial typing keeps focus',async()=>{
  await act('filter').click();await page.locator('[name=status][value=waiting]').check();await page.clock.setFixedTime(new Date('2026-09-27T17:01:00Z'));await page.click('[data-today]');assert.equal(await page.inputValue('[name=from]'),'28/09/2026');assert.equal(await page.locator('[name=status]:checked').inputValue(),'waiting');
  await page.fill('[name=from]','28/0');assert.equal(await apply().isDisabled(),true);assert.equal(await page.locator('[name=from]').evaluate(e=>e===document.activeElement),true);
  await page.locator('[name=from]').press('Tab');assert.match(await page.locator('#pick-from-error').textContent(),/hợp lệ/);
  await page.click('[data-reset]');assert.equal(await apply().isEnabled(),true);assert.deepEqual(await page.locator('.p08-date-entry input').evaluateAll(es=>es.map(e=>e.value)),['','']);assert.equal(await page.locator('[name=status]:checked').inputValue(),'all');await apply().click();assert.equal(await page.locator('.p08-filter-summary button').textContent(),'Tất cả ngày');
 });
 await check('Today control/error layout stays in app at6 viewports and footer/keyboard remain usable',async()=>{
  await page.clock.setFixedTime(new Date('2026-09-27T05:00:00Z'));
  for(const [w,h]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
   await page.setViewportSize({width:w,height:h});await act('filter').click();await page.fill('[name=from]','27/09/2026');await page.fill('[name=to]','26/09/2026');
   const m=await page.locator('.p08-picker').evaluate(e=>{const r=e.getBoundingClientRect(),s=e.closest('.hn-screen').getBoundingClientRect();return {inside:r.top>=s.top-1&&r.bottom<=s.bottom+1&&r.left>=s.left-1&&r.right<=s.right+1,overflow:e.scrollWidth>e.clientWidth+1,todayHeight:e.querySelector('[data-today]').offsetHeight};});assert.equal(m.inside,true);assert.equal(m.overflow,false);assert.ok(m.todayHeight>=44);metrics.push({w,h,...m});
   for(let i=0;i<16;i++)await page.keyboard.press('Tab');assert.equal(await page.locator('.p08-picker').evaluate(e=>e.contains(document.activeElement)),true);assert.deepEqual(await page.locator('.p08-date-entry input').evaluateAll(es=>es.map(e=>e.value)),['27/09/2026','26/09/2026']);await capture('errors-'+w+'x'+h);await page.click('[data-today]');await capture('today-'+w+'x'+h);await page.keyboard.press('Escape');
  }
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'validation-results.json'),JSON.stringify({revision:'P08-r16',checks,metrics,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await browser.close();}
})();
